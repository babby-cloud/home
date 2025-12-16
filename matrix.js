// matrix.js — falling code background with flicker and pause
(function(){
  const canvas = document.getElementById('matrix');
  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  ctx.scale(dpr, dpr);

  const alphaFade = 0.05; // background alpha for trails
  const fontSize = Math.max(12, Math.floor(Math.min(W, H) / 60));
  ctx.font = fontSize + 'px monospace';

  // char set: mix of numbers, letters and katakana for that Matrix feel
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEFghijklmnopqrstuvwxyz#$%&*+-=<>?';
  const columns = Math.floor(W / fontSize) + 1;
  const drops = new Array(columns).fill(0).map(()=>Math.floor(Math.random()*H/fontSize));

  let running = true;
  let allowFlick = true;

  function resize(){
    W = canvas.style.width = window.innerWidth;
    H = canvas.style.height = window.innerHeight;
    const newFont = Math.max(12, Math.floor(Math.min(W, H) / 60));
    ctx.font = newFont + 'px monospace';
    // recreate scaled buffer
  }

  window.addEventListener('resize', ()=>{
    canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px'; canvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr, dpr);
  });

  // prefer reduced motion
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){ running = false; }

  function draw(){
    // translucent black to create the trailing effect
    ctx.fillStyle = 'rgba(0,0,0,'+alphaFade+')';
    ctx.fillRect(0,0,window.innerWidth, window.innerHeight);

    ctx.textAlign = 'left';
    for(let i=0;i<columns;i++){
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      const r = Math.floor(Math.random()*chars.length);
      const text = chars.charAt(r);

      // head in bright green
      ctx.fillStyle = 'rgba(170,255,180,0.95)';
      ctx.fillText(text, x, y);

      // small chance to create brighter streaks
      if(Math.random() > 0.96){ ctx.fillStyle = 'rgba(200,255,190,0.9)'; ctx.fillText(text, x, y - fontSize); }

      drops[i]++;
      if(drops[i] * fontSize > window.innerHeight && Math.random() > 0.975){ drops[i] = 0; }
    }

    // occasional subtle flicker (global brightness pulse)
    if(allowFlick && Math.random() < 0.002){
      const card = document.querySelector('.card');
      if(card){ card.classList.add('flick'); setTimeout(()=>card.classList.remove('flick'), 140); }
    }
  }

  // animation loop
  let rafId = null;
  function loop(){ if(!running) return; draw(); rafId = requestAnimationFrame(loop); }
  if(running) loop();

  // controls
  const togglePause = document.getElementById('togglePause');
  const toggleFlick = document.getElementById('toggleFlick');

  function setPaused(val){ running = !val; if(!running){ cancelAnimationFrame(rafId); } else { loop(); } togglePause.textContent = running ? 'Pause' : 'Resume'; }
  function setFlick(val){ allowFlick = val; toggleFlick.textContent = 'Flicker: ' + (allowFlick ? 'On' : 'Off'); }

  togglePause.addEventListener('click', ()=> setPaused(running));
  toggleFlick.addEventListener('click', ()=> setFlick(!allowFlick));

  // keyboard shortcuts
  window.addEventListener('keydown', (e)=>{ if(e.code === 'Space'){ e.preventDefault(); setPaused(running); } });

  // expose small API for dev console
  window._matrix = { pause: ()=>setPaused(true), resume: ()=>setPaused(false), flickOn: ()=>setFlick(true), flickOff: ()=>setFlick(false) };
})();
