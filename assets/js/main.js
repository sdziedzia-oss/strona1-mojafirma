/* FORMA | Architektura – main.js
   Preloader · Cursor · Scroll reveals · Counter · Gallery */
(function(){
"use strict";

/* ─── CURSOR ──────────────────────────────────────────────── */
const cur  = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
if(cur && ring){
  let mx=0,my=0,rx=0,ry=0;
  window.addEventListener('mousemove',e=>{ mx=e.clientX; my=e.clientY; cur.style.left=mx+'px'; cur.style.top=my+'px'; });
  (function anim(){ rx+=(mx-rx)*.12; ry+=(my-ry)*.12; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(anim); })();
  document.querySelectorAll('a,button').forEach(el=>{
    el.addEventListener('mouseenter',()=>{ cur.classList.add('is-hover'); ring.classList.add('is-hover'); });
    el.addEventListener('mouseleave',()=>{ cur.classList.remove('is-hover'); ring.classList.remove('is-hover'); });
  });
}

/* ─── PRELOADER ───────────────────────────────────────────── */
const pl   = document.getElementById('preloader');
const hero = document.getElementById('hero') || document.querySelector('.hero');

function revealPage(){
  if(pl){ pl.classList.add('leave'); setTimeout(()=>{ pl.classList.add('gone'); if(hero) hero.classList.add('hero-ready'); }, 1250); }
  else   { if(hero) hero.classList.add('hero-ready'); }
}

if(pl){
  // First visit in session → full preloader; subsequent → instant
  const seen = sessionStorage.getItem('forma_visited');
  if(seen){
    pl.classList.add('gone');
    if(hero){ hero.classList.add('hero-ready','skip-preloader'); }
  } else {
    sessionStorage.setItem('forma_visited','1');
    const fill  = document.getElementById('pl-fill');
    const num   = document.getElementById('pl-num');
    const total = 2400;
    const t0    = performance.now();
    function ease(t){ return t<.5?2*t*t:-1+(4-2*t)*t; }
    (function tick(){
      const p = Math.min((performance.now()-t0)/total,1);
      const v = Math.round(ease(p)*100);
      if(num)  num.textContent  = String(v).padStart(3,'0');
      if(fill) fill.style.width = v+'%';
      if(p<1)  requestAnimationFrame(tick);
      else     setTimeout(revealPage,280);
    })();
  }
} else {
  if(hero) hero.classList.add('hero-ready');
}

/* ─── HEADER SCROLL ───────────────────────────────────────── */
const header = document.getElementById('site-header');
if(header){
  const onScroll = ()=> header.classList.toggle('scrolled', window.scrollY>60);
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
}

/* ─── HAMBURGER ───────────────────────────────────────────── */
const toggle = document.getElementById('nav-toggle') || document.getElementById('hamburger');
const nav    = document.getElementById('main-nav');
if(toggle && nav){
  toggle.addEventListener('click',()=>{
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded','false');
    document.body.style.overflow='';
  }));
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape' && nav.classList.contains('is-open')){
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded','false');
      document.body.style.overflow='';
      toggle.focus();
    }
  });
}

/* ─── INTERSECTION OBSERVER ───────────────────────────────── */
const io = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('vis'); io.unobserve(e.target); } });
},{ threshold:.1, rootMargin:'0px 0px -50px 0px' });
document.querySelectorAll('.reveal,.fade-up,.img-reveal').forEach(el=>io.observe(el));

/* ─── STAT COUNTERS ───────────────────────────────────────── */
const cio = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    const el=e.target, target=parseInt(el.dataset.count,10), suf=el.dataset.suffix||'';
    const dur=1600, t0=performance.now();
    (function tick(){ const t=Math.min((performance.now()-t0)/dur,1); el.textContent=Math.round((1-Math.pow(1-t,3))*target)+suf; t<1?requestAnimationFrame(tick):null; })();
    cio.unobserve(el);
  });
},{threshold:.5});
document.querySelectorAll('[data-count]').forEach(el=>cio.observe(el));

/* ─── HERO PARALLAX ───────────────────────────────────────── */
const heroText = document.querySelector('.hero-text');
if(heroText){
  window.addEventListener('scroll',()=>{
    const sy=window.scrollY, vh=window.innerHeight;
    if(sy<vh){ heroText.style.transform=`translateY(${sy*.28}px)`; heroText.style.opacity=String(1-sy/vh*1.4); }
  },{passive:true});
}

/* ─── HORIZONTAL GALLERY ──────────────────────────────────── */
const gallery = document.getElementById('proj-gallery');
const prevBtn = document.getElementById('proj-prev');
const nextBtn = document.getElementById('proj-next');
if(gallery){
  function slideBy(dir){
    const w = (gallery.firstElementChild?.offsetWidth||600)+2;
    gallery.scrollBy({left:dir*w, behavior:'smooth'});
  }
  if(prevBtn) prevBtn.addEventListener('click',()=>slideBy(-1));
  if(nextBtn) nextBtn.addEventListener('click',()=>slideBy(1));
  let drag=false, sx=0, ss=0;
  gallery.addEventListener('mousedown',e=>{ drag=true; sx=e.clientX; ss=gallery.scrollLeft; gallery.classList.add('grabbing'); });
  window.addEventListener('mousemove',e=>{ if(drag) gallery.scrollLeft=ss-(e.clientX-sx); });
  window.addEventListener('mouseup',  ()=>{ drag=false; gallery.classList.remove('grabbing'); });
  // Touch
  let tx=0;
  gallery.addEventListener('touchstart',e=>{ tx=e.touches[0].clientX; },{passive:true});
  gallery.addEventListener('touchmove', e=>{ gallery.scrollLeft-=e.touches[0].clientX-tx; tx=e.touches[0].clientX; },{passive:true});
}

/* ─── PROJECT FILTER ──────────────────────────────────────── */
document.querySelectorAll('.filter-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.project-card--grid').forEach(c=>{
      c.classList.toggle('project-card--hidden', f!=='wszystkie' && c.dataset.category!==f);
    });
  });
});

/* ─── NETLIFY FORM ────────────────────────────────────────── */
const form = document.getElementById('contact-form');
const succ = document.getElementById('form-success');
if(form && succ){
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    try{
      const r = await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(form)).toString()});
      if(r.ok){ form.hidden=true; succ.hidden=false; succ.scrollIntoView({behavior:'smooth',block:'center'}); }
      else form.submit();
    } catch{ form.submit(); }
  });
}

/* ─── ARCHIVE FILTER ─────────────────────────────────────── */
const rlfBtns = document.querySelectorAll('.rlf-btn');
const rlRows  = document.querySelectorAll('.rl-row');
const rlCount = document.getElementById('rl-count');
if(rlfBtns.length){
  rlfBtns.forEach(btn=>{
    btn.addEventListener('click',()=>{
      rlfBtns.forEach(b=>b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const f = btn.dataset.f;
      let n = 0;
      rlRows.forEach(row=>{
        const show = !f || row.dataset.cat === f;
        row.style.display = show ? '' : 'none';
        if(show) n++;
      });
      if(rlCount) rlCount.textContent = n;
    });
  });
}

/* ─── SMOOTH ANCHORS ──────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const t=document.querySelector(a.getAttribute('href'));
    if(t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth',block:'start'}); }
  });
});

})();
