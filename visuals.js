// tasktape-visuals.js
console.log("Visual upgrades loaded!");

// 18. Sticker Bombing (Drawer + Drag & Drop)
const stickerDrawer = document.createElement('div');
stickerDrawer.id = 'sticker-drawer';
stickerDrawer.innerHTML = `
  <span style="color:#fff; font-family:'Instrument Serif';">Stickers:</span>
  <img class="sticker" src="https://api.iconify.design/noto:skull.svg" data-sticker="skull">
  <img class="sticker" src="https://api.iconify.design/noto:star.svg" data-sticker="star">
  <img class="sticker" src="https://api.iconify.design/noto:fire.svg" data-sticker="fire">
  <img class="sticker" src="https://api.iconify.design/noto:guitar.svg" data-sticker="guitar">
`;
document.body.appendChild(stickerDrawer);

let activeSticker = null;
let offsetX = 0, offsetY = 0;

// Load saved stickers
const savedStickers = JSON.parse(localStorage.getItem('tasktape-stickers') || '[]');
savedStickers.forEach(s => {
  const img = document.createElement('img');
  img.className = 'sticker dropped';
  img.src = \`https://api.iconify.design/noto:\${s.type}.svg\`;
  img.style.left = s.x + 'px';
  img.style.top = s.y + 'px';
  document.body.appendChild(img);
});

document.addEventListener('mousedown', e => {
  if (e.target.classList.contains('sticker')) {
    activeSticker = e.target;
    
    // If it's in the drawer, clone it first
    if (!activeSticker.classList.contains('dropped')) {
      const clone = activeSticker.cloneNode(true);
      clone.classList.add('dropped');
      document.body.appendChild(clone);
      activeSticker = clone;
    }
    
    const rect = activeSticker.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    activeSticker.style.zIndex = 10000;
  }
});

document.addEventListener('mousemove', e => {
  if (activeSticker) {
    activeSticker.style.left = (e.clientX - offsetX) + 'px';
    activeSticker.style.top = (e.clientY - offsetY) + 'px';
  }
});

document.addEventListener('mouseup', () => {
  if (activeSticker) {
    activeSticker.style.zIndex = 9000;
    
    // Save to local storage
    const dropped = Array.from(document.querySelectorAll('.sticker.dropped')).map(el => ({
      type: el.src.split('noto:')[1].replace('.svg',''),
      x: parseInt(el.style.left),
      y: parseInt(el.style.top)
    }));
    localStorage.setItem('tasktape-stickers', JSON.stringify(dropped));
    
    activeSticker = null;
  }
});

// 12. Tape Ribbon Dragging
let ribbonInterval;
const ribbons = [];
document.addEventListener('dragstart', (e) => {
  ribbonInterval = setInterval(() => {
    const ribbon = document.createElement('div');
    ribbon.className = 'tape-ribbon';
    ribbon.style.left = e.clientX + 'px';
    ribbon.style.top = e.clientY + 'px';
    document.body.appendChild(ribbon);
    ribbons.push(ribbon);
    
    // Fade out
    setTimeout(() => {
      ribbon.style.transition = 'opacity 0.5s';
      ribbon.style.opacity = '0';
      setTimeout(() => ribbon.remove(), 500);
    }, 200);
  }, 50);
});
document.addEventListener('dragend', () => {
  clearInterval(ribbonInterval);
});
// Update drag event location (drag events don't update mouse coords natively on all browsers during dragstart, but we can hook into dragover)
document.addEventListener('dragover', (e) => {
  if (ribbonInterval) {
    const lastRibbon = ribbons[ribbons.length - 1];
    if (lastRibbon) {
      lastRibbon.style.left = e.clientX + 'px';
      lastRibbon.style.top = e.clientY + 'px';
    }
  }
});

// 11. Spinning Spools & 15. Worn Out Textures
const vObserver = new MutationObserver(() => {
  // Add spools to cassettes if missing
  document.querySelectorAll('[data-testid^="button-open-day"]').forEach(cassette => {
    if (!cassette.querySelector('.cassette-spool')) {
      cassette.style.position = 'relative'; // Ensure relative for absolute children
      
      const left = document.createElement('div');
      left.className = 'cassette-spool left';
      const right = document.createElement('div');
      right.className = 'cassette-spool right';
      
      // Scratch overlay (15)
      const scratch = document.createElement('div');
      scratch.className = 'scratch-overlay';
      
      cassette.appendChild(left);
      cassette.appendChild(right);
      cassette.appendChild(scratch);
    }
    
    // Trigger spinning if there are tasks "Playing" (This is hard to detect globally without checking DOM state inside popup)
    // As a fun visual hack, we'll just make them spin on hover!
    cassette.addEventListener('mouseenter', () => cassette.classList.add('spinning'));
    cassette.addEventListener('mouseleave', () => cassette.classList.remove('spinning'));
  });
});
vObserver.observe(document.body, { childList: true, subtree: true });
