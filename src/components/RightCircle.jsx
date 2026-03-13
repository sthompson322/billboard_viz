import {useRef} from 'react';
import {DECADE_LABELS} from '../constants.js';

//in genre and audio feature views
function YearSlider({yearRange, onYearRangeChange}) {
  const containerRef = useRef(null);
  const [yearStart, yearEnd] = yearRange;
  const MIN_YEAR = 1980;
  const MAX_YEAR = 2020;
  const MIN_GAP = 10;

  const pct = y => ((y - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;

  function clampYear(y) {
    return Math.round(Math.max(MIN_YEAR, Math.min(MAX_YEAR, y)));
  }

  function handlePointerMove(handle, e) {
    const rect = containerRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newYear = clampYear(MIN_YEAR + ratio * (MAX_YEAR - MIN_YEAR));

    if (handle === 'min') {
      const clamped = Math.min(newYear, yearEnd - MIN_GAP);
      onYearRangeChange([clampYear(clamped), yearEnd]);
    } else {
      const clamped = Math.max(newYear, yearStart + MIN_GAP);
      onYearRangeChange([yearStart, clampYear(clamped)]);
    }
  }

  function startDrag(handle) {
    function onMove(e) {handlePointerMove(handle, e);}
    function onUp() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  return (
    <>
      <div className="tiny" style={{marginBottom: 8}}>Year range</div>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%'}}>
        <div ref={containerRef} style={{width: '80%', height: 36, position: 'relative'}}>
          <div className="slider-track" />
          <div
            className="slider-range"
            style={{ left: `${pct(yearStart)}%`, width: `${pct(yearEnd) - pct(yearStart)}%` }}
          />
          <div
            className="slider-handle"
            style={{ left: `${pct(yearStart)}%` }}
            onPointerDown={e => {e.currentTarget.setPointerCapture(e.pointerId); startDrag('min');}}
          />
          <div
            className="slider-handle"
            style={{ left: `${pct(yearEnd)}%` }}
            onPointerDown={e => {e.currentTarget.setPointerCapture(e.pointerId); startDrag('max');}}
          />
        </div>
      </div>
      <div className="tiny" style={{marginTop: 8, textAlign: 'center'}}>
        {yearStart} – {yearEnd}
      </div>
    </>
  );
}

//in decade comparison view
function DecadePicker({decades, onDecadesChange}) {
  function toggle(lbl) {
    const next = decades.includes(lbl)
      ? decades.filter(d => d !== lbl)
      : [...decades, lbl];
    onDecadesChange(next);
  }

  return (
    <div className="picker">
      <h4>Choose decades</h4>
      <div className="grid-2">
        {DECADE_LABELS.map(lbl => (
          <label key={lbl} className="opt">
            <input
              type="checkbox"
              checked={decades.includes(lbl)}
              onChange={() => toggle(lbl)}
            />
            <span> {lbl}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function RightCircle({view, yearRange, onYearRangeChange, decadeState, onDecadesChange}) {
  let content;
  if (view === 'decade') {
    content = <DecadePicker decades={decadeState.decades} onDecadesChange={onDecadesChange} />;
  } else {
    content = <YearSlider yearRange={yearRange} onYearRangeChange={onYearRangeChange} />;
  }

  return (
    <div id="right-circle" className="region">
      <div className="circle-card">
        <div id="rightContent">{content}</div>
      </div>
    </div>
  );
}
