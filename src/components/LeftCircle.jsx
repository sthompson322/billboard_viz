import {ALL_GENRE_KEYS, GENRE_COLOR_SCALE, FEATURE_DESCRIPTIONS, FEATURE_LABELS} from '../constants.js';

//for genre stacked bar chart
function GenreControls({selectedGenres, onGenreChange}) {
  function toggle(key) {
    const next = new Set(selectedGenres);
    next.has(key) ? next.delete(key) : next.add(key);
    onGenreChange(next);
  }

  return (
    <>
      <h4 style={{margin: '4px 0 8px', fontSize: 16}}>Select genres to display</h4>
      <div className="genre-grid">
        {ALL_GENRE_KEYS.map(key => (
          <label key={key} className="genre-item">
            <input
              type="checkbox"
              checked={selectedGenres.has(key)}
              onChange={() => toggle(key)}
            />
            <span className="swatch" style={{background: GENRE_COLOR_SCALE(key)}} />
            <span>{key}</span>
          </label>
        ))}
      </div>
    </>
  );
}

function FeatureDescription({feature}) {
  return (
    <div className="feature-desc">
      <h4>{FEATURE_LABELS[feature] || feature}</h4>
      <p>{FEATURE_DESCRIPTIONS[feature]}</p>
    </div>
  );
}

const METRICS = [
  {k: 'genre', label: 'Genre'},
  {k: 'tempo', label: 'Tempo'},
  {k: 'danceability', label: 'Danceability'},
  {k: 'energy', label: 'Energy'},
  {k: 'acousticness', label: 'Acousticness'},
  {k: 'duration_ms', label: 'Duration'},
];

//choose metric to view in decade view
function MetricPicker({metric, onMetricChange}) {
  return (
    <div className="picker">
      <h4>Metric</h4>
      <div className="grid-2">
        {METRICS.map(m => (
          <label key={m.k} className="opt">
            <input
              type="radio"
              name="metricPick"
              value={m.k}
              checked={metric === m.k}
              onChange={() => onMetricChange(m.k)}
            />
            <span> {m.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function LeftCircle({view, selectedGenres, onGenreChange, decadeState, onDecadeMetricChange}) {
  let content;
  if (view === 'genre') { //genre multi-select
    content = <GenreControls selectedGenres={selectedGenres} onGenreChange={onGenreChange} />;
  } else if (view === 'decade') { //decade metric selection
    content = <MetricPicker metric={decadeState.metric} onMetricChange={onDecadeMetricChange} />;
  } else { //audio feature description
    content = <FeatureDescription feature={view} />;
  }

  return (
    <div id="left-circle" className="region">
      <div className="circle-card">
        <div id="leftContent">{content}</div>
      </div>
    </div>
  );
}
