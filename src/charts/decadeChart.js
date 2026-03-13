import * as d3 from 'd3';
import {ALL_GENRE_KEYS, FEATURE_COLORS} from '../constants.js';

function decadeRange(label) {
  const y0 = +label.slice(0, 4);
  return [y0, y0 + 9];
}

//finds min, max, median, q1, and q3 for the box plots
function boxStats(values) {
  const vs = values.filter(Number.isFinite).slice().sort((a, b) => a - b);
  const n = vs.length;
  if (!n) return null;

  const quant = p => {
    const idx = (n - 1) * p;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return vs[lo];
    return vs[lo] * (1 - (idx - lo)) + vs[hi] * (idx - lo);
  };

  return {min: vs[0], q1: quant(0.25), median: quant(0.5), q3: quant(0.75), max: vs[n - 1], n};
}

//get audio feature stats for decades
function getFeatureSamples(feature, decLabel, songsByYear, audioData) {
  const [y0, y1] = decadeRange(decLabel);
  const out = [];

  for (let y = y0; y <= y1; y++) {
    const songs = songsByYear.get(y) || [];
    for (const row of songs) {
      let v = Number(row[feature]);
      if (feature === 'duration_ms') v /= 1000;
      if (Number.isFinite(v) && v !== 0) out.push(v);
    }
  }
  if (out.length) return out;

  // yearly averages
  for (const d of audioData) {
    if (d.year >= y0 && d.year <= y1) {
      let v = Number(d[feature]);
      if (feature === 'duration_ms') v /= 1000;
      if (Number.isFinite(v) && v !== 0) out.push(v);
    }
  }
  return out;
}

//counts genre stats accross decade
function aggGenreCounts(startY, endY, genreData) {
  const sums = Object.fromEntries(ALL_GENRE_KEYS.map(k => [k, 0]));
  for (const row of genreData) {
    if (row.year >= startY && row.year <= endY) {
      for (const k of ALL_GENRE_KEYS) sums[k] += +row[k] || 0;
    }
  }
  return ALL_GENRE_KEYS.map(k => ({key: k, value: sums[k]}));
}

export function createGenrePies(g, {decades, genreData, width, height, colorScale, tooltip}) {
  if (!decades.length) {
    g.append('text').attr('x', width / 2).attr('y', height / 2).attr('text-anchor', 'middle').style('fill', '#e8edf7').text('Pick one or more decades.');
    return;
  }

  const cols = decades.length === 4 ? 2 : Math.min(3, decades.length);
  const rows = Math.ceil(decades.length / cols);
  const padX = 60, padY = 60;
  const cellW = (width - padX * 2) / cols;
  const cellH = (height - padY * 2) / rows;
  const radius = Math.min(cellW, cellH) * 0.35;

  const pie = d3.pie().value(d => d.value).sort(null);
  const arc = d3.arc().innerRadius(0).outerRadius(radius).cornerRadius(4);

  let activeGenre = null;
  const pies = [];

  decades.forEach((dec, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const cx = padX + col * cellW + cellW / 2;
    const cy = padY + row * cellH + cellH / 2;

    const [y0, y1] = decadeRange(dec);
    const data = aggGenreCounts(y0, y1, genreData);
    const total = d3.sum(data, d => d.value) || 1;

    const gp = g.append('g').attr('transform', `translate(${cx},${cy})`);

    gp.selectAll('path')
      .data(pie(data))
      .join('path')
      .attr('class', 'slice')
      .attr('d', arc)
      .attr('fill', d => colorScale(d.data.key))
      .attr('stroke', '#0b1220')
      .attr('stroke-width', 1.2)
      .style('cursor', 'pointer')
      .on('mousemove', (ev, d) => {
        tooltip.style('opacity', 1)
          .html(`<strong>${dec}</strong><br>${d.data.key}: ${(100 * d.data.value / total).toFixed(1)}%`)
          .style('left', `${ev.pageX + 10}px`)
          .style('top', `${ev.pageY - 28}px`);
      })
      .on('mouseout', () => tooltip.style('opacity', 0))
      .on('click', (_, d) => {
        activeGenre = activeGenre === d.data.key ? null : d.data.key;
        syncHighlight();
      });

    g.append('text')
      .attr('x', cx).attr('y', cy - radius - 10)
      .attr('text-anchor', 'middle')
      .style('fill', '#e8edf7').style('font-size', '14px')
      .text(dec);

    pies.push({dec, group: gp, data, total});
  });

  // legend
  const sw = 9, fs = 11, padx = 8, itemPad = 12;
  const maxW = width - 40;
  let xCursor = 0, legendRow = 0;

  ALL_GENRE_KEYS.forEach(k => {
    const itemW = sw + padx + Math.ceil(k.length * (fs * 0.62)) + itemPad;
    if (xCursor + itemW > maxW) {legendRow += 1; xCursor = 0;}
    const ly = height - 16 + legendRow * 16;
    g.append('rect').attr('x', xCursor).attr('y', ly - sw + 1).attr('width', sw).attr('height', sw).attr('rx', 2).attr('fill', colorScale(k));
    g.append('text').attr('x', xCursor + sw + padx).attr('y', ly).text(k).style('fill', '#e8edf7').style('font-size', fs);
    xCursor += itemW;
  });

  function syncHighlight() {
    g.selectAll('.genre-focus-label').remove();
    g.selectAll('path.slice').attr('opacity', 1);
    if (!activeGenre) return;

    g.selectAll('path.slice').attr('opacity', d => d.data.key === activeGenre ? 1 : 0.25);

    pies.forEach(({group, data, total}) => {
      const v = (data.find(x => x.key === activeGenre)?.value) || 0;
      const pct = (100 * v / total).toFixed(1) + '%';
      group.append('text')
        .attr('class', 'genre-focus-label')
        .attr('y', radius + 22)
        .attr('text-anchor', 'middle')
        .style('fill', '#e8edf7').style('font-size', '12px')
        .text(`${activeGenre}: ${pct}`);
    });
  }
}

export function createFeatureBoxplots(g, {decades, feature, audioData, songsByYear, width, height}) {
  if (!decades.length) {
    g.append('text').attr('x', width / 2).attr('y', height / 2).attr('text-anchor', 'middle').style('fill', '#e8edf7').text('Pick one or more decades.');
    return;
  }

  const stats = decades
    .map(dec => ({dec, s: boxStats(getFeatureSamples(feature, dec, songsByYear, audioData))}))
    .filter(d => d.s);

  const yMin = d3.min(stats, d => d.s.min);
  const yMax = d3.max(stats, d => d.s.max);

  const y = d3.scaleLinear().domain([yMin, yMax]).nice().range([height, 0]);
  const x = d3.scaleBand().domain(stats.map(d => d.dec)).range([60, width - 20]).padding(0.25);
  const boxW = Math.min(60, x.bandwidth() * 0.8);

  g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));
  g.append('g').call(d3.axisLeft(y));

  const fmt = v => (
    ['danceability', 'energy', 'acousticness'].includes(feature) ? v.toFixed(3)
      : feature === 'tempo' ? v.toFixed(1)
      : Math.round(v)
  );

  const showStats = {median: false, min: false, max: false, q1: false, q3: false};

  function drawLabel(xc, yc, text) {
    g.append('text')
      .attr('class', 'stat-label')
      .attr('x', xc).attr('y', yc - 4)
      .attr('text-anchor', 'middle')
      .style('fill', '#fff').style('font-size', '12px').style('font-weight', '600')
      .style('paint-order', 'stroke').style('stroke', '#0b1220')
      .style('stroke-width', '0.8px').style('stroke-opacity', 0.6)
      .style('pointer-events', 'none')
      .text(text);
  }

  function syncLabels() {
    g.selectAll('.stat-label').remove();
    Object.entries(showStats)
      .filter(([, on]) => on)
      .forEach(([type]) => stats.forEach(({dec, s}) =>
        drawLabel(x(dec) + x.bandwidth() / 2, y(s[type]) - 8, `${type}: ${fmt(s[type])}`)
      ));
  }

  function toggleStat(type) {
    showStats[type] = !showStats[type];
    syncLabels();
  }

  stats.forEach(({dec, s}) => {
    const cx = x(dec) + x.bandwidth() / 2;
    const yMinPx = y(s.min), yMaxPx = y(s.max);
    const yQ1Px = y(s.q1), yQ3Px = y(s.q3);
    const yMedPx = y(s.median);
    const hitH = 12;

    g.append('line').attr('x1', cx).attr('x2', cx).attr('y1', yMinPx).attr('y2', yMaxPx).attr('stroke', 'rgba(255,255,255,.6)');

    g.append('rect')
      .attr('x', cx - boxW / 2).attr('width', boxW)
      .attr('y', yQ3Px).attr('height', yQ1Px - yQ3Px)
      .attr('fill', FEATURE_COLORS[feature] || '#60a5fa').attr('opacity', 0.75)
      .attr('stroke', '#0b1220').attr('stroke-width', 1.2);

    [yMinPx, yMaxPx].forEach(yPx =>
      g.append('line').attr('x1', cx - boxW / 3).attr('x2', cx + boxW / 3).attr('y1', yPx).attr('y2', yPx).attr('stroke', 'rgba(255,255,255,.7)')
    );

    g.append('line')
      .attr('x1', cx - boxW / 2).attr('x2', cx + boxW / 2)
      .attr('y1', yMedPx).attr('y2', yMedPx)
      .attr('stroke', '#0b1220').attr('stroke-width', 2.2)
      .style('cursor', 'pointer').on('click', () => toggleStat('median'));

    [['min', yMinPx], ['max', yMaxPx], ['q1', yQ1Px], ['q3', yQ3Px]].forEach(([type, yPx]) => {
      g.append('rect')
        .attr('x', cx - boxW / 2).attr('width', boxW)
        .attr('y', yPx - hitH / 2).attr('height', hitH)
        .attr('fill', 'transparent').style('cursor', 'pointer')
        .on('click', () => toggleStat(type));
    });
  });

  g.append('text')
    .attr('class', 'y-axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2).attr('y', -44)
    .attr('text-anchor', 'middle')
    .text(feature === 'duration_ms' ? 'Duration (s)' : feature.charAt(0).toUpperCase() + feature.slice(1));
}
