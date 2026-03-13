import {useState, useEffect} from 'react';
import * as d3 from 'd3';
import './styles.css';

import {ALL_GENRE_KEYS, NAV_BUTTONS} from './constants.js';
import MainChart from './components/MainChart.jsx';
import LeftCircle from './components/LeftCircle.jsx';
import RightCircle from './components/RightCircle.jsx';

async function loadData() {
  const base = import.meta.env.BASE_URL;
  const [rawAudio, rawGenre, rawSongs] = await Promise.all([
    d3.csv(`${base}data/audio_features.csv`, d3.autoType),
    d3.csv(`${base}data/genre_counts.csv`, d3.autoType),
    d3.csv(`${base}data/songs_by_year.csv`, d3.autoType),
  ]);

  const songsByYear = d3.group(rawSongs, d => d.year);
  return {audioData: rawAudio, genreData: rawGenre, songsByYear};
}

//boombox background design
function BoomboxBackground({currentView, onViewChange}) {
  return (
    <svg
      id="boombox-bg"
      viewBox="0 0 1500 800"
      preserveAspectRatio="xMidYMid meet"
      style={{width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0}}
    >
      <rect x="142" y="29" width="1205" height="172" rx="30" fill="none" stroke="#2D2C5E" strokeWidth="10" />
      <rect x="11" y="172" width="1468" height="657" rx="20" fill="#3D4B91" />
      <rect x="10" y="153" width="1468" height="104" rx="15" fill="#2D2C5E" />

      <text x="400" y="215" fill="#e8edf7" fontSize="30" fontFamily="system-ui, sans-serif">
        Music Data Explorer: Top 10 Songs per Year 1980-2020
      </text>

      {NAV_BUTTONS.map(btn => (
        <g key={btn.view} style={{cursor: 'pointer'}} onClick={() => onViewChange(btn.view)}>
          <rect
            x={btn.x} y="102" width="129" height="51" rx="10"
            fill={btn.color}
            stroke={currentView === btn.view ? '#a78bfa' : 'none'}
            strokeWidth={currentView === btn.view ? 3 : 0}
          />
          <text
            x={btn.x + 64.5} y="135"
            fill="#e8edf7" fontSize="14" fontFamily="system-ui, sans-serif" textAnchor="middle"
          >
            {btn.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

const DESIGN_W = 1500;
const DESIGN_H = 800;

//responsive scaling
function useBoomboxScale() {
  const getScale = () => Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H);
  const [scale, setScale] = useState(getScale);

  useEffect(() => {
    function update() {setScale(getScale());}
    window.addEventListener('resize', update, {passive: true});
    return () => window.removeEventListener('resize', update);
  }, []);

  return scale;
}

export default function App() {
  const scale = useBoomboxScale();
  const [data, setData] = useState(null);
  const [currentView, setCurrentView] = useState('genre');
  const [selectedGenres, setSelectedGenres] = useState(new Set(ALL_GENRE_KEYS));
  const [yearRange, setYearRange] = useState([1980, 2020]);
  const [decadeState, setDecadeState] = useState({decades: ['1980s', '1990s', '2010s'], metric: 'genre'});

  useEffect(() => {
    loadData().then(setData);
  }, []);

  function handleViewChange(view) {
    setCurrentView(view);
    if (view !== 'decade') setYearRange([1980, 2020]);
  }

  if (!data) {
    return <div style={{color: '#e8edf7', padding: 40}}>Loading data…</div>;
  }

  return (
    <div className="boombox-viewport">
      <div className="boombox" style={{ transform: `scale(${scale})` }}>
        <BoomboxBackground currentView={currentView} onViewChange={handleViewChange} />

        <MainChart
          view={currentView}
          data={data}
          selectedGenres={selectedGenres}
          yearRange={yearRange}
          decadeState={decadeState}
        />

        <LeftCircle
          view={currentView}
          selectedGenres={selectedGenres}
          onGenreChange={setSelectedGenres}
          decadeState={decadeState}
          onDecadeMetricChange={metric => setDecadeState(prev => ({...prev, metric}))}
        />

        <RightCircle
          view={currentView}
          yearRange={yearRange}
          onYearRangeChange={setYearRange}
          decadeState={decadeState}
          onDecadesChange={decades => setDecadeState(prev => ({...prev, decades}))}
        />
      </div>
    </div>
  );
}
