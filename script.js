/* script.js - copia completa */
const screens = document.querySelectorAll(".screen");
const wheel = document.getElementById("wheel");
const actionBtn = document.getElementById("actionBtn");
const result = document.getElementById("result");
const confetti = document.getElementById("confetti");
const playBtn = document.getElementById("playBtn");

let rotation = 0;
let spinning = false;
let stage = 0; // 0 = before first spin, 1 = after first spin, 2 = finished

/* NAV */
function nextScreen(n){
  if (typeof n === "undefined") {
    // fallback: advance sequentially
    const cur = Array.from(screens).findIndex(s => s.classList.contains("active"));
    const next = Math.min(screens.length-1, cur + 1);
    screens[cur].classList.remove("active");
    screens[next].classList.add("active");
    return;
  }
  screens.forEach(s => s.classList.remove("active"));
  const el = document.getElementById(`screen${n}`);
  if (el) el.classList.add("active");
}

/* VIDEO */
function playVideo(){
  const v = document.getElementById("video");
  if (!v) return;
  v.play();
  if (playBtn) playBtn.style.display = "none";
}

/* CONFETTI */
function launchConfetti(){
  for (let i=0;i<120;i++){
    const piece = document.createElement("span");
    piece.style.left = Math.random()*100 + "vw";
    piece.style.top = (-5 - Math.random()*20) + "vh";
    piece.style.background = `hsl(${Math.random()*360}, 80%, 55%)`;
    piece.style.transform = `rotate(${Math.random()*360}deg)`;
    piece.style.width = (6 + Math.random()*8) + "px";
    piece.style.height = (8 + Math.random()*12) + "px";
    confetti.appendChild(piece);
    piece.animate([
      { transform: piece.style.transform, opacity: 1 },
      { transform: `translateY(${80 + Math.random()*40}vh) rotate(${Math.random()*720}deg)`, opacity: 0 }
    ], {
      duration: 1600 + Math.random()*1000,
      easing: 'cubic-bezier(.2,.8,.3,1)'
    });
    setTimeout(()=> piece.remove(), 3200);
  }
}

/* RUEDA: centros de sectores (en grados relativos, con conic-gradient from -90deg) */
const sectorCenters = [-45, 45, 135, 225]; // Q0, Q50, Q150, Q200

function spinToSector(index, spins = 5){
  if (spinning) return;
  spinning = true;
  result.classList.remove("show");
  result.textContent = "";

  const currentMod = ((rotation % 360) + 360) % 360;
  const targetCenter = sectorCenters[index];
  let extra = ((-targetCenter - currentMod) % 360 + 360) % 360;

  const full = 360 * spins;
  const delta = full + extra;

  rotation += delta;
  wheel.style.transition = 'transform 4s cubic-bezier(.33,1,.68,1)';
  wheel.style.transform = `rotate(${rotation}deg)`;

  // wait transitionend
  const handler = () => {
    wheel.removeEventListener('transitionend', handler);
    spinning = false;
    // show handled in caller
  };
  wheel.addEventListener('transitionend', handler);
}

/* SINGLE BUTTON FLOW */
actionBtn.addEventListener('click', () => {
  if (spinning) return;

  if (stage === 0) {
    // first spin -> Q0 (sector 0)
    actionBtn.disabled = true;
    actionBtn.classList.add('disabled');
    spinToSector(0, 5);
    // after transition - listen once
    const afterFirst = () => {
      result.textContent = '💀 Your prize is 0 Quetzales 💀';
      result.classList.add('show');

      // change single button text to "I wanna kill you" and re-enable
      actionBtn.textContent = 'I wanna kill you';
      actionBtn.disabled = false;
      actionBtn.classList.remove('disabled');
      stage = 1;

      wheel.removeEventListener('transitionend', afterFirst);
    };
    wheel.addEventListener('transitionend', afterFirst);
  } else if (stage === 1) {
    // second spin -> Q200 (sector 3)
    actionBtn.disabled = true;
    spinToSector(3, 6);

    const afterSecond = () => {
      result.textContent = '🎉 ¡YOU WON 200 Quetzales! 🎉';
      result.classList.add('show');
      // confetti
      launchConfetti();
      stage = 2;
      actionBtn.disabled = true;
      actionBtn.classList.add('hidden'); // hide button at end
      wheel.removeEventListener('transitionend', afterSecond);
    };
    wheel.addEventListener('transitionend', afterSecond);
  }
});
