// tasktape-audio.js
console.log("Audio subsystem loaded!");

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const masterGain = audioCtx.createGain();
masterGain.gain.value = 0.5;
masterGain.connect(audioCtx.destination);

function playOscillator(type, frequency, duration, vol = 1, slideToFreq = null) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  if (slideToFreq) {
    osc.frequency.exponentialRampToValueAtTime(slideToFreq, audioCtx.currentTime + duration);
  }
  
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(masterGain);
  
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playClack() {
  playOscillator('square', 100, 0.05, 0.8, 50);
  setTimeout(() => playOscillator('square', 120, 0.05, 0.8, 60), 20);
}

function playRewind() {
  playOscillator('sawtooth', 800, 0.4, 0.3, 100);
}

function playChime() {
  playOscillator('sine', 600, 0.1, 0.5);
  setTimeout(() => playOscillator('sine', 800, 0.3, 0.5), 100);
}

function playFastForward() {
  playOscillator('sawtooth', 100, 0.2, 0.3, 600);
}

function playEject() {
  playOscillator('square', 80, 0.1, 1, 40);
  setTimeout(() => playOscillator('square', 60, 0.2, 1, 20), 50);
}

// UI elements removed by user request
// Global interaction listeners
document.addEventListener('click', (e) => {
  // 1. Cassette Click Sounds
  const target = e.target.closest('[data-testid^="button-open-day"], [data-testid="cassette-popup"]');
  if (target) {
    playClack();
  }
});

// Drag and drop / state change observers
let taskCountCache = { played: 0, queued: 0 };

// We'll use a MutationObserver on the body to detect when the lists render, and then we'll observe the lists
const observer = new MutationObserver(() => {
  // 6. Track Completion Chime (moving to "Played")
  // 2. Tape Rewind (moving from "Played" to "Queued")
  
  // A naive approach: just listen to clicks on task checkboxes for chime/rewind
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    if (!cb.dataset.audioBound) {
      cb.dataset.audioBound = 'true';
      cb.addEventListener('change', (e) => {
        if (e.target.checked) playChime();
        else playRewind();
      });
    }
  });
  
  // 7. Fast Forward Sounds (Dragging tasks)
  document.querySelectorAll('[draggable="true"]').forEach(el => {
    if (!el.dataset.dragBound) {
      el.dataset.dragBound = 'true';
      el.addEventListener('dragstart', playFastForward);
      el.addEventListener('dragend', playClack);
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });
