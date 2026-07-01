// tasktape-gamification.js
console.log("Gamification loaded!");

let score = parseInt(localStorage.getItem('tt-score') || '0');


// 21. Awards
const award = document.createElement('div');
award.id = 'award-overlay';
award.innerHTML = '<span>PLATINUM<br>RECORD!</span>';
document.body.appendChild(award);


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
