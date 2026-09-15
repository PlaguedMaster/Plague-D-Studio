const fileInput = document.querySelector('#fileInput');
const browseButton = document.querySelector('#browseButton');
const chooseFileButton = document.querySelector('#chooseFileButton');
const uploadZone = document.querySelector('#uploadZone');
const projectName = document.querySelector('#projectName');
const playButton = document.querySelector('#playButton');
const progressBar = document.querySelector('#progressBar');
const timeCurrent = document.querySelector('#timeCurrent');
const toast = document.querySelector('#toast');
const transcribeButton = document.querySelector('#transcribeButton');
const durationLabel = document.querySelector('.trackbar > span:nth-of-type(2)');
const audio = new Audio();
let playing = false;
let elapsed = 14;
let audioUrl = '';
let currentFile = null;

function openFilePicker() {
  if (typeof fileInput.showPicker === 'function') fileInput.showPicker();
  else fileInput.click();
}

function openSessionStore() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('plagueDStudio', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('sessions', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function loadRecording(file, notify = true) {
  if (!file || !file.type.startsWith('audio/')) {
    showToast('Please choose an audio file');
    return;
  }
  if (audioUrl) URL.revokeObjectURL(audioUrl);
  audioUrl = URL.createObjectURL(file);
  audio.src = audioUrl;
  audio.load();
  currentFile = file;
  transcribeButton.disabled = false;
  projectName.textContent = file.name.replace(/\.[^/.]+$/, '').slice(0, 28);
  uploadZone.querySelector('strong').textContent = 'Recording loaded';
  uploadZone.querySelector('span').textContent = `${file.name} · ready to transcribe`;
  uploadZone.classList.add('dragging');
  if (notify) showToast('Recording ready for transcription');
  localStorage.setItem('plagueD.lastProject', projectName.textContent);
}

function frequencyToTab(frequency) {
  const strings = [
    { name: 'e', midi: 64 }, { name: 'B', midi: 59 }, { name: 'G', midi: 55 },
    { name: 'D', midi: 50 }, { name: 'A', midi: 45 }, { name: 'E', midi: 40 }
  ];
  const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
  const candidates = strings
    .map(string => ({ ...string, fret: midi - string.midi }))
    .filter(string => string.fret >= 0 && string.fret <= 20);
  return candidates.sort((a, b) => a.fret - b.fret)[0] || null;
}

function detectPitch(samples, sampleRate) {
  let bestOffset = -1;
  let bestCorrelation = 0;
  const minOffset = Math.floor(sampleRate / 1000);
  const maxOffset = Math.floor(sampleRate / 70);
  for (let offset = minOffset; offset <= maxOffset; offset += 2) {
    let difference = 0;
    for (let index = 0; index < samples.length - offset; index += 4) {
      difference += Math.abs(samples[index] - samples[index + offset]);
    }
    const correlation = 1 - difference / ((samples.length - offset) * 2);
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
    }
  }
  return bestOffset > 0 && bestCorrelation > 0.55 ? sampleRate / bestOffset : 0;
}

async function transcribeRecording() {
  if (!audio.src) return;
  transcribeButton.disabled = true;
  transcribeButton.textContent = 'Analyzing recording...';
  try {
    const context = new AudioContext();
    const response = await fetch(audio.src);
    const buffer = await context.decodeAudioData(await response.arrayBuffer());
    const channel = buffer.getChannelData(0);
    const frameSize = 4096;
    const notes = [];
    for (let start = 0; start + frameSize < channel.length && notes.length < 32; start += frameSize * 2) {
      const frame = channel.slice(start, start + frameSize);
      const peak = Math.max(...frame.map(value => Math.abs(value)));
      if (peak < 0.035) continue;
      const frequency = detectPitch(frame, buffer.sampleRate);
      const tab = frequencyToTab(frequency);
      if (tab && (!notes.length || notes[notes.length - 1].name !== tab.name || notes[notes.length - 1].fret !== tab.fret)) notes.push(tab);
    }
    if (!notes.length) throw new Error('No clear notes found');
    const rowNames = ['e', 'B', 'G', 'D', 'A', 'E'];
    const rows = new Map(rowNames.map(name => [name, []]));
    notes.forEach(note => rowNames.forEach(name => rows.get(name).push(name === note.name ? String(note.fret) : '--')));
    document.querySelectorAll('.tab-row').forEach(row => {
      const values = rows.get(row.previousElementSibling.textContent) || [];
      row.innerHTML = values.length ? values.map(value => value === '--' ? '<span>--</span>' : `<b>${value}</b>`).join(' ') : '<span>--</span>';
    });
    showToast(`${notes.length} notes detected in the recording`);
  } catch (error) {
    showToast('Could not find a clear playable note');
  } finally {
    transcribeButton.disabled = false;
    transcribeButton.innerHTML = 'Transcribe recording <span>↗</span>';
  }
}

browseButton.addEventListener('click', openFilePicker);
chooseFileButton.addEventListener('click', openFilePicker);
fileInput.addEventListener('change', () => loadRecording(fileInput.files[0]));
transcribeButton.addEventListener('click', transcribeRecording);
uploadZone.addEventListener('click', event => {
  if (event.target.closest('button') || event.target === fileInput) return;
  openFilePicker();
});

['dragenter', 'dragover'].forEach(eventName => uploadZone.addEventListener(eventName, event => {
  event.preventDefault();
  uploadZone.classList.add('dragging');
}));
['dragleave', 'drop'].forEach(eventName => uploadZone.addEventListener(eventName, event => {
  event.preventDefault();
  uploadZone.classList.remove('dragging');
}));
uploadZone.addEventListener('drop', event => {
  loadRecording(event.dataTransfer.files[0]);
});

playButton.addEventListener('click', () => {
  if (!audio.src) {
    showToast('Load a recording first');
    return;
  }
  playing = !playing;
  playButton.textContent = playing ? 'Ⅱ' : '▶';
  if (playing) audio.play();
  else audio.pause();
});

audio.addEventListener('loadedmetadata', () => {
  durationLabel.textContent = formatTime(audio.duration);
  timeCurrent.textContent = formatTime(audio.currentTime);
});
audio.addEventListener('timeupdate', () => {
  elapsed = audio.currentTime;
  progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
  timeCurrent.textContent = formatTime(audio.currentTime);
});
audio.addEventListener('ended', () => {
  playing = false;
  playButton.textContent = '▶';
  progressBar.style.width = '0%';
});

document.querySelector('.progress').addEventListener('click', event => {
  if (!audio.duration) return;
  const bounds = event.currentTarget.getBoundingClientRect();
  audio.currentTime = ((event.clientX - bounds.left) / bounds.width) * audio.duration;
});

document.querySelectorAll('.string').forEach(button => button.addEventListener('click', () => {
  document.querySelector('.string.active').classList.remove('active');
  button.classList.add('active');
  document.querySelector('#noteName').textContent = button.firstChild.textContent;
  document.querySelector('#tuneMessage').textContent = 'Perfectly in tune';
}));
document.querySelectorAll('[data-scroll]').forEach(button => button.addEventListener('click', () => document.querySelector(`#${button.dataset.scroll}`).scrollIntoView({ behavior: 'smooth', block: 'center' })));
document.querySelector('#exportButton').addEventListener('click', () => {
  const tab = [...document.querySelectorAll('.tab-row')]
    .map(row => `${row.previousElementSibling.textContent} | ${row.textContent.replace(/\s+/g, ' ')}`)
    .join('\n');
  const download = document.createElement('a');
  download.href = URL.createObjectURL(new Blob([tab], { type: 'text/plain' }));
  download.download = `${projectName.textContent || 'untitled-riff'}-tab.txt`;
  download.click();
  URL.revokeObjectURL(download.href);
  showToast('Tab export downloaded');
});
document.querySelector('.save-button').addEventListener('click', async () => {
  try {
    const session = {
      format: 'plague-d-studio-session',
      version: 1,
      projectName: projectName.textContent,
      audioFileName: currentFile?.name || null,
      tabRows: [...document.querySelectorAll('.tab-row')].map(row => row.innerHTML),
      lyrics: document.querySelector('.lyrics-text').innerHTML,
      currentTime: audio.currentTime,
      savedAt: new Date().toISOString()
    };
    const database = await openSessionStore();
    const transaction = database.transaction('sessions', 'readwrite');
    transaction.objectStore('sessions').put({ ...session, id: 'current', file: currentFile });
    transaction.oncomplete = () => showToast('Full session saved in this browser');
    transaction.onerror = () => showToast('Could not save this session');

    if ('showSaveFilePicker' in window) {
      const handle = await window.showSaveFilePicker({
        suggestedName: `${projectName.textContent || 'untitled-riff'}.plague-session.json`,
        types: [{ description: 'Plague D Studio session', accept: { 'application/json': ['.json', '.plague-session'] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(JSON.stringify(session, null, 2));
      await writable.close();
      showToast('Session file saved');
    }
  } catch (error) {
    if (error.name !== 'AbortError') showToast('Could not save the session file');
  }
});

const savedProject = localStorage.getItem('plagueD.lastProject');
if (savedProject) projectName.textContent = savedProject;

async function restoreSession() {
  try {
    const database = await openSessionStore();
    const request = database.transaction('sessions').objectStore('sessions').get('current');
    request.onsuccess = () => {
      const session = request.result;
      if (!session) return;
      projectName.textContent = session.projectName;
      document.querySelector('.lyrics-text').innerHTML = session.lyrics;
      document.querySelectorAll('.tab-row').forEach((row, index) => {
        if (session.tabRows[index]) row.innerHTML = session.tabRows[index];
      });
      if (session.file) {
        audio.addEventListener('loadedmetadata', () => {
          audio.currentTime = session.currentTime || 0;
        }, { once: true });
        loadRecording(session.file, false);
      }
      showToast('Saved session restored');
    };
  } catch (error) {
    // A first-time or privacy-restricted browser simply starts with a blank session.
  }
}

restoreSession();

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}