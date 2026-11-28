/* Shared drag-to-orbit + view-angle foil for ritual, share, and inspect.
   Pointer + touch. CSS 3D thickness + WebGL2 iridescence with CSS fallback.
   Performant on mobile: one rAF loop, one 2D-sized canvas, no per-card HTML. */
(function (global) {
  'use strict';

  var VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main(){
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

  var FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 frag;
uniform vec2 uAngle;
uniform float uIntensity;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.13 + 13.5;
    a *= 0.5;
  }
  return v;
}

void main(){
  vec2 uv = vUv;
  // Frame is stronger; skin/face in the center stays subtler.
  float edgeX = min(uv.x, 1.0 - uv.x) / 0.18;
  float edgeY = min(uv.y, 1.0 - uv.y) / 0.14;
  float edge = 1.0 - smoothstep(0.0, 1.0, min(edgeX, edgeY));
  float frame = pow(clamp(edge, 0.0, 1.0), 0.72);

  vec3 V = normalize(vec3(sin(uAngle.x) * cos(uAngle.y), sin(uAngle.y), max(0.15, cos(uAngle.x) * cos(uAngle.y))));
  float n = fbm(uv * 16.0 + V.xy * 3.2);
  float n2 = fbm(uv * 42.0 - V.yx * 2.0);
  float nx = fbm(uv * 16.0 + vec2(0.04, 0.0) + V.xy * 3.2) - n;
  float ny = fbm(uv * 16.0 + vec2(0.0, 0.04) + V.xy * 3.2) - n;
  vec3 N = normalize(vec3(nx * 4.5, ny * 4.5, 1.0));
  float ndv = pow(1.0 - abs(dot(N, V)), 1.45);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.4);

  float phase = uv.x * 2.15 + uv.y * 0.62 + V.x * 1.7 + V.y * 1.05 + n * 0.55;
  vec3 rainbow = 0.5 + 0.5 * cos(6.2831853 * (phase + vec3(0.00, 0.33, 0.67)));
  // Cool foil bias so it does not flash cheap gold
  rainbow = mix(rainbow, vec3(0.55, 0.82, 1.0), 0.12);

  vec3 col = rainbow * (0.28 + 0.72 * ndv);
  col += rainbow * fres * 0.45;
  // Micro sparkles on the frame only
  float sp = step(0.945, hash(floor(uv * 110.0 + V.xy * 10.0) + n2));
  col += sp * rainbow * frame * 0.85;

  float a = uIntensity * (0.10 + 0.38 * frame + 0.28 * fres + 0.16 * ndv);
  a = clamp(a, 0.0, 0.62);
  // Keep faces readable
  a *= mix(0.42, 1.0, frame);
  frag = vec4(col, a);
}`;

  function compile(gl, type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function makeFoil(canvas) {
    var gl;
    try {
      gl = canvas.getContext('webgl2', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
        powerPreference: 'low-power'
      });
    } catch (e) { gl = null; }
    if (!gl) return null;
    var vs = compile(gl, gl.VERTEX_SHADER, VERT);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, 'aPos');
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var uAngle = gl.getUniformLocation(prog, 'uAngle');
    var uIntensity = gl.getUniformLocation(prog, 'uIntensity');
    gl.useProgram(prog);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.disable(gl.DEPTH_TEST);
    var lastW = 0, lastH = 0;
    return {
      gl: gl,
      draw: function (yawDeg, pitchDeg, intensity, cssW, cssH) {
        var dpr = Math.min(2, window.devicePixelRatio || 1);
        var w = Math.max(1, Math.round(cssW * dpr));
        var h = Math.max(1, Math.round(cssH * dpr));
        if (w !== lastW || h !== lastH) {
          canvas.width = w;
          canvas.height = h;
          gl.viewport(0, 0, w, h);
          lastW = w;
          lastH = h;
        }
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.uniform2f(uAngle, yawDeg * Math.PI / 180, pitchDeg * Math.PI / 180);
        gl.uniform1f(uIntensity, intensity);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    };
  }

  function ensureChrome(el) {
    var physical = el.querySelector('.card-physical') || el;
    var media = physical.querySelector('.card-media-wrap') || physical;
    var clip = media.querySelector('.card-fx-clip');
    if (!clip) {
      clip = document.createElement('div');
      clip.className = 'card-fx-clip';
      clip.setAttribute('aria-hidden', 'true');
      var movers = media.querySelectorAll('.holo-foil-canvas, .holo-foil-css, .card-glare-overlay, .card-light-sweep');
      for (var i = 0; i < movers.length; i++) clip.appendChild(movers[i]);
      media.appendChild(clip);
    }
    var canvas = clip.querySelector('.holo-foil-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'holo-foil-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      clip.appendChild(canvas);
    }
    var cssFoil = clip.querySelector('.holo-foil-css');
    if (!cssFoil) {
      cssFoil = document.createElement('div');
      cssFoil.className = 'holo-foil-css';
      cssFoil.setAttribute('aria-hidden', 'true');
      clip.appendChild(cssFoil);
    }
    var back = physical.querySelector('.card-face-back');
    if (!back) {
      back = document.createElement('div');
      back.className = 'card-face-back';
      back.setAttribute('aria-hidden', 'true');
      var img = document.createElement('img');
      img.src = '/holo/cards/back.webp';
      img.alt = '';
      img.draggable = false;
      img.decoding = 'async';
      back.appendChild(img);
      physical.appendChild(back);
    }
    physical.classList.add('is-orbit-ready');
    return { physical: physical, media: media, canvas: canvas, cssFoil: cssFoil, back: back };
  }

  function mount(el, opts) {
    if (!el) return null;
    opts = opts || {};
    var chrome = ensureChrome(el);
    var foil = makeFoil(chrome.canvas);
    if (foil) el.classList.add('has-webgl-foil');
    else el.classList.add('has-css-foil');

    var yaw = 0, pitch = 0, velY = 0, velP = 0;
    var dragging = false, lastX = 0, lastY = 0, lastT = 0;
    var pointerId = null;
    var interactive = opts.interactive !== false;
    var raf = 0;
    var lastTap = 0;
    var SENS = 0.42;
    var PITCH_MAX = 42;
    var FRIC = 0.93;
    var idle = 0;

    function apply() {
      el.style.setProperty('--tilt-rx', pitch.toFixed(2) + 'deg');
      el.style.setProperty('--tilt-ry', yaw.toFixed(2) + 'deg');
      var px = 50 + yaw * 0.9;
      var py = 50 - pitch * 1.1;
      el.style.setProperty('--glare-x', px.toFixed(1) + '%');
      el.style.setProperty('--glare-y', py.toFixed(1) + '%');
      el.style.setProperty('--glare-alpha', dragging ? '0.85' : '0.55');
      el.style.setProperty('--foil-shift-x', (50 + yaw * 1.4).toFixed(1) + '%');
      el.style.setProperty('--foil-shift-y', (50 - pitch * 1.2).toFixed(1) + '%');
      chrome.cssFoil.style.setProperty('--foil-x', (50 + yaw * 1.6).toFixed(1) + '%');
      chrome.cssFoil.style.setProperty('--foil-y', (50 - pitch * 1.3).toFixed(1) + '%');
      if (foil) {
        var r = el.getBoundingClientRect();
        foil.draw(yaw, pitch, dragging ? 1.15 : 0.92, r.width, r.height);
      }
    }

    function loop(ts) {
      raf = requestAnimationFrame(loop);
      if (!dragging) {
        velY *= FRIC;
        velP *= FRIC;
        if (Math.abs(velY) < 0.02) velY = 0;
        if (Math.abs(velP) < 0.02) velP = 0;
        yaw += velY;
        pitch = Math.max(-PITCH_MAX, Math.min(PITCH_MAX, pitch + velP));
        if (opts.idle !== false && !velY && !velP && interactive) {
          idle = ts || performance.now();
          yaw += Math.sin(idle / 1800) * 0.012;
          pitch += Math.cos(idle / 2200) * 0.008;
        }
      }
      apply();
    }

    function down(e) {
      if (!interactive) return;
      if (e.button != null && e.button !== 0) return;
      var now = performance.now();
      if (now - lastTap < 280) {
        reset();
        lastTap = 0;
        e.preventDefault();
        return;
      }
      lastTap = now;
      dragging = true;
      pointerId = e.pointerId;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
      velY = 0;
      velP = 0;
      el.classList.add('is-tilting', 'is-orbiting');
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    }

    function move(e) {
      if (!dragging || (pointerId != null && e.pointerId !== pointerId)) return;
      var now = performance.now();
      var dx = e.clientX - lastX;
      var dy = e.clientY - lastY;
      var dt = Math.max(8, now - lastT);
      yaw += dx * SENS;
      pitch = Math.max(-PITCH_MAX, Math.min(PITCH_MAX, pitch - dy * SENS * 0.72));
      velY = (dx * SENS) * (16 / dt);
      velP = (-dy * SENS * 0.72) * (16 / dt);
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
      e.preventDefault();
    }

    function up(e) {
      if (!dragging) return;
      if (e && pointerId != null && e.pointerId !== pointerId) return;
      dragging = false;
      pointerId = null;
      el.classList.remove('is-tilting');
      // keep is-orbiting while inertia settles; class is visual-only for transition
      if (Math.abs(velY) < 0.15 && Math.abs(velP) < 0.15) el.classList.remove('is-orbiting');
    }

    function reset() {
      yaw = 0;
      pitch = 0;
      velY = 0;
      velP = 0;
      el.classList.remove('is-orbiting');
      apply();
    }

    el.addEventListener('pointerdown', down, { passive: false });
    el.addEventListener('pointermove', move, { passive: false });
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.style.touchAction = 'none';
    el.style.userSelect = 'none';
    el.setAttribute('tabindex', '0');
    el.addEventListener('keydown', function (e) {
      if (!interactive) return;
      var step = e.shiftKey ? 10 : 6;
      if (e.key === 'ArrowLeft') { yaw -= step; e.preventDefault(); }
      if (e.key === 'ArrowRight') { yaw += step; e.preventDefault(); }
      if (e.key === 'ArrowUp') { pitch = Math.min(PITCH_MAX, pitch + step * 0.7); e.preventDefault(); }
      if (e.key === 'ArrowDown') { pitch = Math.max(-PITCH_MAX, pitch - step * 0.7); e.preventDefault(); }
      if (e.key === 'Home' || e.key === '0' || e.key === 'Escape') reset();
    });

    raf = requestAnimationFrame(loop);
    apply();

    return {
      el: el,
      setInteractive: function (on) {
        interactive = !!on;
        if (!interactive) {
          dragging = false;
          el.classList.remove('is-orbiting', 'is-tilting');
        }
      },
      setAngles: function (y, p) {
        yaw = y;
        pitch = Math.max(-PITCH_MAX, Math.min(PITCH_MAX, p));
        velY = 0;
        velP = 0;
        apply();
      },
      getAngles: function () { return { yaw: yaw, pitch: pitch }; },
      reset: reset,
      destroy: function () {
        cancelAnimationFrame(raf);
        el.removeEventListener('pointerdown', down);
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
      }
    };
  }

  global.HoloOrbit = { mount: mount };
})(typeof window !== 'undefined' ? window : this);
