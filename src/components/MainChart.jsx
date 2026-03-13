import {useRef, useEffect} from 'react';
import * as d3 from 'd3';
import {CHART_MARGIN, CHART_WIDTH, CHART_HEIGHT, GENRE_COLOR_SCALE} from '../constants.js';
import {createGenreChart} from '../charts/genreChart.js';
import {createFeatureRange} from '../charts/featureChart.js';
import {createGenrePies, createFeatureBoxplots} from '../charts/decadeChart.js';

const featureViews = new Set(['tempo', 'danceability', 'energy', 'acousticness', 'duration_ms']);

export default function MainChart({view, data, selectedGenres, yearRange, decadeState}) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);

    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${CHART_MARGIN.left},${CHART_MARGIN.top})`);

    const shared = {
      width: CHART_WIDTH,
      height: CHART_HEIGHT,
      colorScale: GENRE_COLOR_SCALE,
      tooltip
    };

    if (view === 'genre') {
      //genre stacked bar chart view
      createGenreChart(g, {
        ...shared,
        genreData: data.genreData,
        selectedKeys: [...selectedGenres],
        yearRange
      });
    } else if (featureViews.has(view)) { 
      //audio feature views
      createFeatureRange(g, {
        ...shared,
        audioData: data.audioData,
        feature: view,
        yearRange,
        songsByYear: data.songsByYear
      });
    } else if (view === 'decade') { 
      const {decades, metric} = decadeState;
      if (metric === 'genre') {
        //decade pie charts
        createGenrePies(g, {
          ...shared,
          decades,
          genreData: data.genreData
        });
      } else {
        //decade box plots
        createFeatureBoxplots(g, {
          ...shared,
          decades,
          feature: metric,
          audioData: data.audioData,
          songsByYear: data.songsByYear
        });
      }
    }
  }, [view, data, selectedGenres, yearRange, decadeState]);

  return (
    <>
      <div id="center-rect" className="region">
        <svg ref={svgRef} id="mainChart" viewBox="0 0 900 560" preserveAspectRatio="xMidYMid meet" />
      </div>
      <div ref={tooltipRef} className="tooltip" id="tooltip" />
    </>
  );
}
