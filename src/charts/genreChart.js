import * as d3 from 'd3';

export function createGenreChart(g, {genreData, selectedKeys, yearRange, width, height, colorScale, tooltip}) {
  const [startYear, endYear] = yearRange;
  //get year range dadat
  const data = genreData.filter(d => d.year >= startYear && d.year <= endYear);

  const x = d3.scaleBand()
    .domain(data.map(d => d.year))
    .range([0, width])
    .padding(0.2);

  const y = d3.scaleLinear().domain([0, 10]).range([height, 0]);

  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).tickValues(x.domain().filter((_, i) => !(i % 5))));
  
  g.append('g').call(d3.axisLeft(y));



  if (selectedKeys.length && data.length) {
    const stacked = d3.stack().keys(selectedKeys)(data);

    g.selectAll('g.layer')
      .data(stacked, s => s.key)
      .join(
        enter => enter.append('g').attr('class', 'layer').attr('fill', s => colorScale(s.key)),
        update => update.attr('fill', s => colorScale(s.key)),
        exit => exit.remove()
      )
      .selectAll('rect')
      .data(d => d, d => d.data.year)
      .join(
        enter => enter.append('rect')
          .attr('x', d => x(d.data.year))
          .attr('y', d => y(d[1]))
          .attr('height', d => y(d[0]) - y(d[1]))
          .attr('width', x.bandwidth())
          //show tooltip
          .on('mousemove', (event, d) => {
            const genre = d3.select(event.currentTarget.parentNode).datum().key;
            tooltip.style('opacity', 1)
              .html(`<strong>Year:</strong> ${d.data.year}<br/><strong>Genre:</strong> ${genre}<br/><strong>Count:</strong> ${d.data[genre]}`)
              .style('left', `${event.pageX + 10}px`)
              .style('top', `${event.pageY - 28}px`);
          })
          .on('mouseout', () => tooltip.style('opacity', 0)),
        update => update
          .transition().duration(250)
          .attr('x', d => x(d.data.year))
          .attr('y', d => y(d[1]))
          .attr('height', d => y(d[0]) - y(d[1]))
          .attr('width', x.bandwidth()),
        exit => exit.remove()
      );
  }

  //x-aisx
  g.append('text')
    .attr('class', 'x-axis-label')
    .attr('x', width / 2).attr('y', height + 44)
    .attr('text-anchor', 'middle')
    .text('Year');

  
  //y-axis
  g.append('text')
    .attr('class', 'y-axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2).attr('y', -35)
    .attr('text-anchor', 'middle')
    .text('Number of Songs in Top 10');

  //chart title
  g.append('text')
    .attr('class', 'chart-title')
    .attr('x', width / 2).attr('y', -18)
    .attr('text-anchor', 'middle')
    .text('Top-10 Genre Mix By Year');
}
