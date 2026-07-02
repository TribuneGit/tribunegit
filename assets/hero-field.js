/* Tribune signature moment: the stone field.
   Doctrine: one Lusion-class hero moment, everything else efficient.
   Locked stack tool: Three.js (CDN ESM). Single renderer (FM-3). Desktop only.
   Brand rules honored: flat geometry, no gradients, no glow, solid white ground,
   obsidian stones with rare tyrian, motion returns to rest. */
import * as THREE from 'three';

var host = document.querySelector('.hero-field');
if (host && !window.__tribuneRenderer) {
  var canvas = document.createElement('canvas');
  host.appendChild(canvas);

  /* FM-3: one renderer, module scope, never a second instance. */
  var renderer = new THREE.WebGLRenderer({
    canvas: canvas, alpha: true, antialias: true, powerPreference: 'low-power'
  });
  window.__tribuneRenderer = renderer;
  renderer.setClearColor(0xffffff, 0);

  var scene = new THREE.Scene();
  var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 2;

  /* Colors pre-blended against the white ground: flat paint, no transparency. */
  var WHITE = new THREE.Color(0xffffff);
  var STONE = new THREE.Color(0x0A0B12).lerp(WHITE, 0.84);   /* quiet obsidian */
  var OFFICE = new THREE.Color(0x7A1A5C).lerp(WHITE, 0.12);  /* rare tyrian */

  var mesh = null, homes = null, pos = null, vel = null, count = 0;
  var W = 0, H = 0;
  var dummy = new THREE.Object3D();

  function build() {
    if (mesh) { scene.remove(mesh); mesh.geometry.dispose(); mesh.material.dispose(); }
    var rect = host.getBoundingClientRect();
    W = Math.max(1, rect.width); H = Math.max(1, rect.height);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    camera.left = -W / 2; camera.right = W / 2;
    camera.top = H / 2; camera.bottom = -H / 2;
    camera.updateProjectionMatrix();

    var sx = 52, sy = 48;
    var cols = Math.ceil(W / sx) + 1, rows = Math.ceil(H / sy) + 1;
    count = cols * rows;
    homes = new Float32Array(count * 2);
    pos = new Float32Array(count * 2);
    vel = new Float32Array(count * 2);

    var geo = new THREE.PlaneGeometry(9, 13);
    var mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    mesh = new THREE.InstancedMesh(geo, mat, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    var i = 0;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var jx = (Math.sin(i * 12.9898) * 43758.5453 % 1) * 10 - 5;
        var jy = (Math.sin(i * 78.233) * 12543.123 % 1) * 10 - 5;
        var x = c * sx - W / 2 + (r % 2 ? sx / 2 : 0) + jx;
        var y = r * sy - H / 2 + jy;
        homes[i * 2] = x; homes[i * 2 + 1] = y;
        pos[i * 2] = x; pos[i * 2 + 1] = y;
        dummy.position.set(x, y, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        /* Roughly one stone in twenty-five carries the office. Deterministic. */
        mesh.setColorAt(i, (i % 25 === 7) ? OFFICE : STONE);
        i++;
      }
    }
    mesh.instanceColor.needsUpdate = true;
    scene.add(mesh);
  }

  var mx = 1e9, my = 1e9;
  function onMove(e) {
    var rect = host.getBoundingClientRect();
    mx = e.clientX - rect.left - W / 2;
    my = (H / 2) - (e.clientY - rect.top);
  }
  function onLeave() { mx = 1e9; my = 1e9; }
  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerleave', onLeave);

  var running = false, rafId = 0, shown = false;
  var R = 170, R2 = R * R;

  function tick() {
    if (!running) return;
    rafId = requestAnimationFrame(tick);
    for (var i = 0; i < count; i++) {
      var ix = i * 2, iy = ix + 1;
      var dx = pos[ix] - mx, dy = pos[iy] - my;
      var d2 = dx * dx + dy * dy;
      /* Spring home. */
      vel[ix] += (homes[ix] - pos[ix]) * 0.02;
      vel[iy] += (homes[iy] - pos[iy]) * 0.02;
      /* Repulsion inside the radius: the field parts around the cursor. */
      if (d2 < R2 && d2 > 0.01) {
        var d = Math.sqrt(d2);
        var f = (1 - d / R) * 3.2;
        vel[ix] += (dx / d) * f;
        vel[iy] += (dy / d) * f;
      }
      vel[ix] *= 0.86; vel[iy] *= 0.86;
      pos[ix] += vel[ix]; pos[iy] += vel[iy];
      dummy.position.set(pos[ix], pos[iy], 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
    if (!shown) { shown = true; host.classList.add('on'); }
  }
  function start() { if (!running) { running = true; tick(); } }
  function stop() { running = false; cancelAnimationFrame(rafId); }

  /* Run only while the hero is on screen and the tab is visible. */
  new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.isIntersecting ? start() : stop(); });
  }, { threshold: 0.05 }).observe(host);
  document.addEventListener('visibilitychange', function () {
    document.hidden ? stop() : start();
  });

  var rt = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rt); rt = setTimeout(build, 200);
  });

  /* FM-3 mindset: if the context is lost, fail to the static hero, quietly. */
  canvas.addEventListener('webglcontextlost', function () {
    stop(); host.classList.remove('on');
  });

  build();
  start();
}
