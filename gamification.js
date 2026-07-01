// tasktape-gamification.js
console.log("Gamification loaded!");

let score = parseInt(localStorage.getItem('tt-score') || '0');


// 21. Awards
const award = document.createElement('div');
award.id = 'award-overlay';
award.innerHTML = '<span>PLATINUM<br>RECORD!</span>';
document.body.appendChild(award);

// 24. Encore
const encore = document.createElement('div');
encore.id = 'encore-banner';
encore.innerHTML = '🔥 ENCORE TIME! 🔥<br><span style="font-size:20px; font-family:sans-serif">You finished everything! Keep going!</span>';
document.body.appendChild(encore);


function updateShells() {
  document.querySelectorAll('[data-testid^="button-open-day"]').forEach(c => {
    if (score >= 5 && score < 15) {
      c.classList.add('cassette-shell-neon');
    } else if (score >= 15) {
      c.classList.remove('cassette-shell-neon');
      c.classList.add('cassette-shell-gold');
    }
  });
}

// Global checking for completed tasks
const gObserver = new MutationObserver(() => {
  updateShells(); 
  
  const cbs = document.querySelectorAll('input[type="checkbox"]');
  cbs.forEach(cb => {
    if (!cb.dataset.gameBound) {
      cb.dataset.gameBound = 'true';
      cb.addEventListener('change', (e) => {
        if (e.target.checked) {
          score++;
          localStorage.setItem('tt-score', score);
          
          // Check if all are done
          setTimeout(() => {
             const allCbs = document.querySelectorAll('input[type="checkbox"]');
             if (allCbs.length > 0 && Array.from(allCbs).every(c => c.checked)) {
               award.classList.add('show');
               setTimeout(() => {
                  award.classList.remove('show');
                  encore.classList.add('show');
                  setTimeout(() => encore.classList.remove('show'), 4000);
               }, 3000);
             }
          }, 100);
        }
      });
    }
  });
});
gObserver.observe(document.body, { childList: true, subtree: true });
updateShells();
