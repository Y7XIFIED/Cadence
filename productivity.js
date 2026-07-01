// tasktape-productivity.js
console.log("Productivity features loaded!");

// LocalStorage helpers
const loadData = () => JSON.parse(localStorage.getItem('tt-productivity') || '{}');
const saveData = (d) => localStorage.setItem('tt-productivity', JSON.stringify(d));

let prodData = loadData();
if(!prodData.timers) prodData.timers = {};
if(!prodData.notes) prodData.notes = {};
if(!prodData.skipped) prodData.skipped = {};
if(!prodData.genres) prodData.genres = {};
if(!prodData.bsides) prodData.bsides = [];
if(!prodData.albumArts) prodData.albumArts = {};
saveData(prodData);

// 32. B-Sides Drawer
const bsides = document.createElement('div');
bsides.id = 'bsides-drawer';
bsides.innerHTML = `
  <button id="bsides-toggle">B-SIDES</button>
  <h2>B-SIDES BACKLOG</h2>
  <input type="text" id="bsides-input" placeholder="Add to backlog (Press Enter)...">
  <ul id="bsides-list"></ul>
`;
document.body.appendChild(bsides);

const bToggle = document.getElementById('bsides-toggle');
bToggle.onclick = () => bsides.classList.toggle('open');

const bInput = document.getElementById('bsides-input');
const bList = document.getElementById('bsides-list');

function renderBSides() {
  bList.innerHTML = '';
  prodData.bsides.forEach((b, i) => {
    const li = document.createElement('li');
    li.textContent = b;
    const del = document.createElement('span');
    del.textContent = '❌';
    del.style.cursor = 'pointer';
    del.onclick = () => { prodData.bsides.splice(i, 1); saveData(prodData); renderBSides(); };
    li.appendChild(del);
    bList.appendChild(li);
  });
}
renderBSides();

bInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && bInput.value.trim()) {
    prodData.bsides.push(bInput.value.trim());
    saveData(prodData);
    bInput.value = '';
    renderBSides();
  }
});

// Active Timers
const activeTimers = {};

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return \`\${m}:\${s}\`;
}

// Global DOM Observer for injecting features into tasks
const pObserver = new MutationObserver(() => {
  // We need to find tasks. Since we don't have clear selectors, we look for labels inside task lists
  // Based on standard React drag/drop structures, tasks usually have checkboxes
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    const taskContainer = cb.closest('div'); // Usually the wrapper
    if (!taskContainer) return;
    
    // Find the text content of the task (usually a sibling span or label)
    // We will just look at the textContent of the container and strip whitespace
    const titleEl = taskContainer.querySelector('span') || taskContainer;
    const taskTitle = titleEl.textContent.replace(/\\s+/g, ' ').trim();
    if(!taskTitle || taskTitle.length === 0) return;

    if (!taskContainer.dataset.prodBound) {
      taskContainer.dataset.prodBound = 'true';
      taskContainer.style.position = 'relative';
      taskContainer.style.display = 'flex';
      taskContainer.style.flexWrap = 'wrap';
      taskContainer.style.alignItems = 'center';

      // 40. Setlists
      if (taskTitle.toLowerCase().includes('[setlist]')) {
        titleEl.classList.add('setlist-header');
        titleEl.textContent = titleEl.textContent.replace(/\\[setlist\\]/ig, '').trim();
      }

      // 36. Track Skips
      if (prodData.skipped[taskTitle]) {
        titleEl.classList.add('task-skipped');
      }
      const skipBtn = document.createElement('button');
      skipBtn.className = 'track-skip-btn';
      skipBtn.textContent = '⏭';
      skipBtn.title = 'Skip Track';
      skipBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        prodData.skipped[taskTitle] = !prodData.skipped[taskTitle];
        saveData(prodData);
        if(prodData.skipped[taskTitle]) titleEl.classList.add('task-skipped');
        else titleEl.classList.remove('task-skipped');
      };
      
      // 38. Genre Tags
      const genreBtn = document.createElement('span');
      genreBtn.className = 'genre-tag';
      const currentGenre = prodData.genres[taskTitle] || 'None';
      if(currentGenre !== 'None') genreBtn.classList.add('genre-' + currentGenre);
      genreBtn.textContent = currentGenre;
      genreBtn.onclick = (e) => {
        e.preventDefault(); e.stopPropagation();
        const genres = ['None', 'Rock', 'Jazz', 'Pop', 'LoFi'];
        let nextIdx = genres.indexOf(prodData.genres[taskTitle] || 'None') + 1;
        if(nextIdx >= genres.length) nextIdx = 0;
        const newGenre = genres[nextIdx];
        prodData.genres[taskTitle] = newGenre;
        saveData(prodData);
        genreBtn.className = 'genre-tag';
        if(newGenre !== 'None') genreBtn.classList.add('genre-' + newGenre);
        genreBtn.textContent = newGenre;
      };

      // 31. Track Length
      if(!prodData.timers[taskTitle]) prodData.timers[taskTitle] = 0;
      const timerBtn = document.createElement('button');
      timerBtn.className = 'track-timer-btn';
      timerBtn.textContent = '▶';
      const timerDisplay = document.createElement('span');
      timerDisplay.className = 'track-timer-display';
      timerDisplay.textContent = formatTime(prodData.timers[taskTitle]);

      timerBtn.onclick = (e) => {
        e.preventDefault(); e.stopPropagation();
        if(activeTimers[taskTitle]) {
          clearInterval(activeTimers[taskTitle]);
          delete activeTimers[taskTitle];
          timerBtn.textContent = '▶';
        } else {
          timerBtn.textContent = '■';
          activeTimers[taskTitle] = setInterval(() => {
            prodData.timers[taskTitle]++;
            saveData(prodData);
            timerDisplay.textContent = formatTime(prodData.timers[taskTitle]);
          }, 1000);
        }
      };

      // 35. Liner Notes
      const notesBtn = document.createElement('button');
      notesBtn.className = 'liner-notes-btn';
      notesBtn.textContent = '📝';
      
      const notesArea = document.createElement('textarea');
      notesArea.className = 'liner-notes-area';
      notesArea.value = prodData.notes[taskTitle] || '';
      notesArea.placeholder = "Write liner notes for this track...";
      notesArea.oninput = () => {
        prodData.notes[taskTitle] = notesArea.value;
        saveData(prodData);
      };

      notesBtn.onclick = (e) => {
        e.preventDefault(); e.stopPropagation();
        notesArea.classList.toggle('open');
      };

      // Container for controls
      const controls = document.createElement('div');
      controls.style.marginLeft = 'auto';
      controls.style.display = 'flex';
      controls.style.alignItems = 'center';
      
      controls.appendChild(genreBtn);
      controls.appendChild(skipBtn);
      controls.appendChild(timerBtn);
      controls.appendChild(timerDisplay);
      controls.appendChild(notesBtn);
      
      taskContainer.appendChild(controls);
      
      // Notes area goes full width below
      const flexBreak = document.createElement('div');
      flexBreak.style.flexBasis = '100%';
      flexBreak.style.height = '0';
      taskContainer.appendChild(flexBreak);
      taskContainer.appendChild(notesArea);
    }
  });
  
  // 39. Custom Album Art Covers
  // Whenever the cassette popup opens, find the image and allow clicking it to swap
  const popupImg = document.querySelector('[data-testid="cassette-popup"] img');
  if (popupImg && !popupImg.dataset.artBound) {
    popupImg.dataset.artBound = 'true';
    popupImg.style.cursor = 'pointer';
    popupImg.title = 'Click to change Album Art';
    
    // Check if we have custom art saved for this day
    const dayMatch = popupImg.src.match(/([^/]+)-cover\\.png/);
    if(dayMatch) {
      const day = dayMatch[1];
      if(prodData.albumArts[day]) {
        popupImg.src = prodData.albumArts[day];
      }
      
      popupImg.onclick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target.result;
            prodData.albumArts[day] = base64;
            saveData(prodData);
            popupImg.src = base64;
          };
          reader.readAsDataURL(file);
        };
        input.click();
      };
    }
  }
});
pObserver.observe(document.body, { childList: true, subtree: true });

