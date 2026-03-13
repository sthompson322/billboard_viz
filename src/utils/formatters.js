import {FEATURE_LABELS} from '../constants.js';

export function formatFeatureValue(feature, value) {
  if (value == null || Number.isNaN(value)) return '—';
  if (feature === 'tempo') return `${Math.round(value)} BPM`;
  if (feature === 'duration_ms') {
    const secs = Math.round(value / 1000);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
  return Number(value).toFixed(3);
}

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function buildTooltipHtml(year, feature, avgValue, songs) {
  const label = FEATURE_LABELS[feature] || feature;
  const avgText = formatFeatureValue(feature, avgValue);
  const lines = songs.map(row => {
    const val = formatFeatureValue(feature, row[feature]);
    return `<li>${escapeHtml(row.track_name)} — ${escapeHtml(row.artist_name)}: ${val}</li>`;
  }).join('');

  return `
    <div><strong>${year} — ${label}</strong><br/>Average: ${avgText}</div>
    <hr style="border-color: rgba(255,255,255,.12);" />
    <ol style="margin: 0; padding-left: 18px;">${lines}</ol>
  `;
}
