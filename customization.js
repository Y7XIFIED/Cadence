// tasktape-customization.js
console.log("Customization features loaded!");

const loadCust = () => JSON.parse(localStorage.getItem('tt-cust') || '{}');
const saveCust = (d) => localStorage.setItem('tt-cust', JSON.stringify(d));

let custData = loadCust();
if(!custData.labels) custData.labels = {};
if(!custData.sharpies) custData.sharpies = {};
saveCust(custData);

// 46. Walkman Battery
const battContainer = document.createElement('div');
battContainer.id = 'walkman-battery-container';
battContainer.innerHTML = \`<span style="color:#aaa; font-family:monospace; font-size:10px;">BATT</span><div id="walkman-battery-shell"><div id="walkman-battery-fill"></div></div>\`;
document.body.appendChild(battContainer);

let batteryLevel = 100;
const battFill = document.getElementById('walkman-battery-fill');
setInterval(() => {
  batteryLevel -= 1; // Drain 1% every interval
  if(batteryLevel < 0) batteryLevel = 0;
  updateBattery();
}, 60000); // 1 minute

function updateBattery() {
  battFill.style.width = batteryLevel + '%';
  if(batteryLevel > 50) battFill.style.background = '#0f0';
  else if(batteryLevel > 20) battFill.style.background = '#ffeb3b';
  else battFill.style.background = '#ff0055';
}

// 48. Analog Flip Clock
const clock = document.createElement('div');
clock.id = 'flip-clock';
clock.innerHTML = \`<div class="flip-card" id="clock-h">12</div><div class="flip-card" id="clock-m">00</div>\`;
document.body.appendChild(clock);

setInterval(() => {
  const d = new Date();
  let h = d.getHours();
  let m = d.getMinutes().toString().padStart(2, '0');
  
  if(h > 12) h -= 12;
  if(h === 0) h = 12;
  h = h.toString().padStart(2, '0');

  document.getElementById('clock-h').textContent = h;
  document.getElementById('clock-m').textContent = m;
}, 1000);


// Observers for Tasks and Cassettes
const cObserver = new MutationObserver(() => {
  
  // 41. Custom Cassette Labels
  document.querySelectorAll('[data-testid^="button-open-day"]').forEach(c => {
    if (!c.dataset.labelBound) {
      c.dataset.labelBound = 'true';
      // Find the day from the image src or id
      const img = c.querySelector('img');
      if (img) {
        const match = img.src.match(/([^/]+)-spine\\.png/) || img.src.match(/([^/]+)-cover\\.png/);
        if (match) {
          const day = match[1];
          const label = document.createElement('div');
          label.className = 'cassette-label';
          label.contentEditable = true;
          label.textContent = custData.labels[day] || '';
          
          label.oninput = (e) => {
            custData.labels[day] = e.target.textContent;
            saveCust(custData);
          };
          label.onclick = (e) => { e.preventDefault(); e.stopPropagation(); }; // Don't open the cassette when clicking label
          
          c.style.position = 'relative';
          c.appendChild(label);
        }
      }
    }
  });

  // 42. Sharpie Colors
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    const taskContainer = cb.closest('div'); 
    if (!taskContainer) return;
    const titleEl = taskContainer.querySelector('span') || taskContainer;
    const taskTitle = titleEl.textContent.replace(/\\s+/g, ' ').trim();
    if(!taskTitle || taskTitle.length === 0) return;

    if (!taskContainer.dataset.custBound) {
      taskContainer.dataset.custBound = 'true';
      
      const colors = ['black', 'red', 'blue', 'green', 'purple'];
      let currentColor = custData.sharpies[taskTitle] || 'black';
      
      const applyColor = (color) => {
        if(color === 'black') titleEl.style.color = '';
        else titleEl.style.color = \`var(--sharpie-\${color}, \${color})\`;
      };
      applyColor(currentColor);

      const picker = document.createElement('div');
      picker.className = 'sharpie-picker sharpie-' + currentColor;
      picker.title = 'Change Sharpie Color';
      picker.onclick = (e) => {
        e.preventDefault(); e.stopPropagation();
        let idx = colors.indexOf(currentColor) + 1;
        if(idx >= colors.length) idx = 0;
        currentColor = colors[idx];
        
        picker.className = 'sharpie-picker sharpie-' + currentColor;
        custData.sharpies[taskTitle] = currentColor;
        saveCust(custData);
        applyColor(currentColor);
      };

      // Add battery recharge hook!
      cb.addEventListener('change', (e) => {
        if(e.target.checked) {
          batteryLevel += 15;
          if(batteryLevel > 100) batteryLevel = 100;
          updateBattery();
        }
      });

      titleEl.appendChild(picker);
    }
  });
});
cObserver.observe(document.body, { childList: true, subtree: true });
