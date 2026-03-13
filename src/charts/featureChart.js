import * as d3 from 'd3';
import {FEATURE_LABELS, FEATURE_COLORS} from '../constants.js';
import {buildTooltipHtml} from '../utils/formatters.js';

export function createFeatureRange(g, {audioData, feature, yearRange, width, height, songsByYear, tooltip}) {
  const [startYear, endYear] = yearRange;

  const data = audioData
    .filter(d => d.year >= startYear && d.year <= endYear)
    .map(d => ({...d, duration_sec: d.duration_ms / 1000}));

  const rawFeature = feature === 'duration_ms' ? 'duration_sec' : feature;
  const yMin = d3.min(data, d => d[rawFeature]);
  const yMax = d3.max(data, d => d[rawFeature]);

  let padMin = yMin * 0.95;
  let padMax = yMax * 1.05;
  if (['danceability', 'energy', 'acousticness'].includes(feature)) {
    padMin = Math.max(0, yMin - 0.05);
    padMax = Math.min(1, yMax + 0.05);
  }

  const x = d3.scaleLinear().domain([startYear, endYear]).range([0, width]);
  const y = d3.scaleLinear().domain([padMin, padMax]).range([height, 0]);

  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format('d')));
  g.append('g').call(d3.axisLeft(y));

  const baseLabel = FEATURE_LABELS[feature] || feature;
  const yLabel = feature === 'tempo' ? 'Tempo (BPM)' : feature === 'duration_ms' ? 'Duration (s)' : baseLabel;

  //x-axis
  g.append('text')
    .attr('class', 'x-axis-label')
    .attr('x', width / 2).attr('y', height + 44)
    .attr('text-anchor', 'middle')
    .text('Year');


  //y-axis
  g.append('text')
    .attr('class', 'y-axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2).attr('y', -48)
    .attr('text-anchor', 'middle')
    .text(yLabel);


  //chart title
  g.append('text')
    .attr('class', 'chart-title')
    .attr('x', width / 2).attr('y', -18)
    .attr('text-anchor', 'middle')
    .text(`Average ${baseLabel} of Top-10 Songs By Year`);

  const area = d3.area()
    .x(d => x(d.year))
    .y0(height)
    .y1(d => y(d[rawFeature]))
    .curve(d3.curveMonotoneX);

  //fill in area of chart
  g.append('path')
    .datum(data)
    .attr('fill', FEATURE_COLORS[feature] || '#60a5fa')
    .attr('opacity', 0.8)
    .attr('d', area);

  //data points
  g.selectAll('.dot')
    .data(data)
    .join('circle')
    .attr('class', 'dot')
    .attr('cx', d => x(d.year))
    .attr('cy', d => y(d[rawFeature]))
    .attr('r', 4)
    .attr('fill', '#000')
    .attr('stroke', '#fff')
    //show tooltip
    .on('mouseover', (event, d) => {
      const songs = (songsByYear.get(d.year) || []).slice(0, 10);
      tooltip.style('opacity', 1)
        .html(buildTooltipHtml(d.year, feature, d[feature], songs))
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 28}px`);
    })
    .on('mouseout', () => tooltip.style('opacity', 0));
}
