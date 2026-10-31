(() => {
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
window.lucide && lucide.createIcons();
$('#yr').textContent = new Date().getFullYear();
gsap.registerPlugin(ScrollTrigger);

/* Split hero heading into characters */
const h1 = $('h1');
h1.innerHTML = [...h1.textContent].map(c => `<span class="ch" aria-hidden="true">${c === ' ' ? '&nbsp;' : c}</span>`).join('');

/* Loader, then hero intro */
let n = { v: 0 };
gsap.to(n, { v: 100, duration: reduce ? .1 : 1.4, ease: 'power2.inOut',
  onUpdate() { $('#loadNum').textContent = Math.round(n.v); $('#loader i').style.width = n.v + '%'; },
  onComplete() {
    gsap.to('#loader', { yPercent: -100, duration: .8, ease: 'power3.inOut', onComplete: () => $('#loader').remove() });
    if (!reduce) {
      gsap.from('.ch', { yPercent: 110, opacity: 0, stagger: .03, duration: .8, ease: 'power3.out', delay: .4 });
      gsap.from('.sub,.lead,.cta', { y: 30, opacity: 0, stagger: .15, duration: .8, delay: .9 });
    }
  } });

/* Scroll animations */
if (!reduce) {
  $$('.sec h2').forEach(el => gsap.from(el, { y: 40, opacity: 0, duration: .8, scrollTrigger: { trigger: el, start: 'top 85%' } }));
  ['.about-grid > *', '.grid4 > *', '.grid3 > *', '.contact-grid > *', '.empty'].forEach(sel => {
    gsap.from(sel, { y: 50, opacity: 0, stagger: .12, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: sel, start: 'top 85%' } });
  });
  gsap.from('.timeline li', { x: -40, opacity: 0, duration: .8, scrollTrigger: { trigger: '.timeline', start: 'top 80%' } });
}

/* Progress bar, nav state, active link */
const secs = $$('main section[id]'), links = $$('#menu a');
addEventListener('scroll', () => {
  const h = document.documentElement;
  $('#progress').style.transform = `scaleX(${scrollY / (h.scrollHeight - innerHeight)})`;
  $('#nav').classList.toggle('solid', scrollY > 40);
  const cur = secs.filter(s => s.getBoundingClientRect().top < innerHeight * .4).pop();
  links.forEach(a => a.classList.toggle('on', cur && a.getAttribute('href') === '#' + cur.id));
}, { passive: true });

/* Mobile menu */
const btn = $('#menuBtn'), menu = $('#menu');
const setMenu = o => { menu.classList.toggle('open', o); btn.setAttribute('aria-expanded', o); };
btn.onclick = () => setMenu(!menu.classList.contains('open'));
links.forEach(a => a.onclick = () => setMenu(false));
addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));

/* Cursor, magnetic buttons, card tilt (desktop only) */
if (fine && !reduce) {
  const cur = $('#cursor');
  addEventListener('mousemove', e => gsap.to(cur, { x: e.clientX, y: e.clientY, duration: .15 }));
  $$('a,button,input,textarea').forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('big'));
    el.addEventListener('mouseleave', () => cur.classList.remove('big'));
  });
  $$('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .3, y: (e.clientY - r.top - r.height / 2) * .3, duration: .3 });
    });
    el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: .5, ease: 'elastic.out(1,.4)' }));
  });
  $$('.tilt').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      gsap.to(el, { rotateY: px * 12, rotateX: -py * 12, transformPerspective: 800, duration: .4 });
    });
    el.addEventListener('mouseleave', () => gsap.to(el, { rotateX: 0, rotateY: 0, duration: .6 }));
  });
}

/* Placeholder project links stay inert until you add real URLs */
$$('.links a[href="#"]').forEach(a => {
  a.setAttribute('title', 'Add your link in index.html');
  a.addEventListener('click', e => e.preventDefault());
});

/* Contact form: opens the visitor's email app (no backend needed) */
$('#form').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target, m = $('#formMsg');
  if (!f.checkValidity()) { m.textContent = 'Please fill in your name, a valid email and a message.'; return; }
  const d = new FormData(f);
  location.href = `mailto:your.email@example.com?subject=${encodeURIComponent('Portfolio message from ' + d.get('name'))}&body=${encodeURIComponent(d.get('message') + '\n\nReply to: ' + d.get('email'))}`;
  m.textContent = 'Opening your email app...';
});

/* Three.js: particle background + interactive hero object */
if (window.THREE) {
  const mouse = { x: 0, y: 0 };
  addEventListener('pointermove', e => { mouse.x = e.clientX / innerWidth - .5; mouse.y = e.clientY / innerHeight - .5; });
  const GREEN = 0xb4ff39, OLIVE = 0x8a9a3b;

  // Background particles
  const bg = $('#bg'), r1 = new THREE.WebGLRenderer({ canvas: bg, alpha: true, antialias: false });
  r1.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const s1 = new THREE.Scene(), c1 = new THREE.PerspectiveCamera(60, 1, .1, 100); c1.position.z = 5;
  const cnt = innerWidth < 700 ? 500 : 1100, pos = new Float32Array(cnt * 3);
  for (let i = 0; i < pos.length; i++) pos[i] = (Math.random() - .5) * 18;
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: GREEN, size: .025, transparent: true, opacity: .6 }));
  s1.add(pts);

  // Hero object
  const cv = $('#obj'), r2 = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
  r2.setPixelRatio(Math.min(devicePixelRatio, 2));
  const s2 = new THREE.Scene(), c2 = new THREE.PerspectiveCamera(45, 1, .1, 50); c2.position.z = 6;
  const grp = new THREE.Group(); s2.add(grp);
  grp.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 1), new THREE.MeshStandardMaterial({ color: 0x151a0c, metalness: .8, roughness: .25, flatShading: true })));
  grp.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.62, 1), new THREE.MeshBasicMaterial({ color: GREEN, wireframe: true, transparent: true, opacity: .55 })));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.4, .02, 8, 100), new THREE.MeshBasicMaterial({ color: OLIVE })); ring.rotation.x = 1.2; grp.add(ring);
  s2.add(new THREE.AmbientLight(0xffffff, .5));
  const pl = new THREE.PointLight(GREEN, 2.5, 20); pl.position.set(3, 3, 4); s2.add(pl);

  const size = (r, c, el) => { const w = el.clientWidth, h = el.clientHeight; r.setSize(w, h, false); c.aspect = w / h; c.updateProjectionMatrix(); };
  const resize = () => { size(r1, c1, bg); size(r2, c2, cv); };
  addEventListener('resize', resize); resize();

  let vis = true; document.addEventListener('visibilitychange', () => vis = !document.hidden);
  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop); if (!vis) return;
    const t = clock.getElapsedTime();
    if (!reduce) {
      pts.rotation.y = t * .02 + mouse.x * .3; pts.rotation.x = mouse.y * .3;
      grp.rotation.y += (mouse.x * 2 + t * .2 - grp.rotation.y) * .05;
      grp.rotation.x += (mouse.y * 1.2 - grp.rotation.x) * .05;
      grp.position.y = Math.sin(t) * .12; ring.rotation.z = t * .3;
    }
    r1.render(s1, c1); r2.render(s2, c2);
  })();
}
})();
