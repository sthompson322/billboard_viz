import * as d3 from 'd3';

export const ALL_GENRE_KEYS = [
  'Rock', 'Pop Rock', 'Pop', 'Pop Ballad', 'Country Pop',
  'Latin Pop', 'Pop Rap', 'Rap', 'Hip Hop', 'R&B',
];

export const DECADE_LABELS = ['1980s', '1990s', '2000s', '2010s'];

//for colors in genre stacked bar chart
export const GENRE_COLOR_SCALE = d3.scaleOrdinal()
  .domain(ALL_GENRE_KEYS)
  .range(['#7ce2ad', '#7cc6c6', '#7ca8da', '#808be9', '#a689dd', '#c784d0', '#e77dc3', '#eb9ab3', '#ecb79f', '#ebd385']);

//feature chart colors 
export const FEATURE_COLORS = {
  tempo: '#8a508f',
  danceability: '#bc5090',
  energy: '#de5a79',
  acousticness: '#ff6361',
  duration_ms: '#ff8531',
};

export const FEATURE_LABELS = {
  tempo: 'Tempo',
  danceability: 'Danceability',
  energy: 'Energy',
  acousticness: 'Acousticness',
  duration_ms: 'Duration',
};

//for left circle in audio feature views
export const FEATURE_DESCRIPTIONS = {
  danceability: 'Danceability describes how suitable a track is for dancing, based on musical elements like tempo, '
      + 'rhythm stability, beat strength, and regularity. The score ranges from 0.0 (least danceable) to 1.0 (most danceable).',
  tempo: 'Tempo represents the speed of a track in beats per minute (BPM). Higher tempo usually means faster, more energetic music.',
  energy: 'Energy measures the intensity and activity of a track. Higher energy tracks are fast and dynamic. Lower energy '
      + 'tracks are calmer and softer. The score ranges from 0.0 to 1.0.',
  acousticness: 'Acousticness estimates the likelihood that a track was produced with natural instruments as opposed '
      + 'to synthetic production. The score ranges from 0.0 (heavy synthetic production) to 1.0 (very acoustic).',
  duration_ms: 'Duration is the length of a track in seconds.',
};

export const CHART_MARGIN = {top: 40, right: 20, bottom: 40, left: 72};
export const CHART_WIDTH = 900 - CHART_MARGIN.left - CHART_MARGIN.right;
export const CHART_HEIGHT = 560 - CHART_MARGIN.top - CHART_MARGIN.bottom;

//for buttons on top of boombox
export const NAV_BUTTONS = [
  {view: 'genre', label: 'Genre', x: 202, color: '#58508D'},
  {view: 'tempo', label: 'Tempo', x: 364, color: '#8A508F'},
  {view: 'danceability', label: 'Danceability', x: 526, color: '#BC5090'},
  {view: 'energy', label: 'Energy', x: 689, color: '#DE5A79'},
  {view: 'acousticness', label: 'Acousticness', x: 853, color: '#FF6361'},
  {view: 'duration_ms', label: 'Duration', x: 1015, color: '#FF8531'},
  {view: 'decade', label: 'Decade', x: 1178, color: '#FFA600'},
];
