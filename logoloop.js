// logoloop.js — Vanilla JS port of the LogoLoop React component
(function () {
  'use strict';

  var SMOOTH_TAU = 0.25;
  var MIN_COPIES = 2;
  var COPY_HEADROOM = 2;

  // Technology stack logos as inline SVG HTML strings.
  // All use currentColor so they inherit the CSS accent colour.
  var LOGOS = [
    { src: 'assets/videos-images/AWS.png',                                    alt: 'AWS',    title: 'AWS' },
    { src: 'assets/videos-images/ChatGPT_Logo_1.png',                         alt: 'OpenAI', title: 'OpenAI / ChatGPT' },
    { src: 'assets/videos-images/Claude_Logo_1.png',                          alt: 'Claude', title: 'Claude' },
    { src: 'assets/videos-images/NVIDIA_Symbol_1.png',                        alt: 'NVIDIA', title: 'NVIDIA' },
    { src: 'assets/videos-images/idAFFUENLe_logos.png',                       alt: 'Ollama', title: 'Ollama' },
    { src: 'assets/videos-images/Microsoft_Azure_Portal_id4YvwdUb-_1.png',    alt: 'Azure',  title: 'Azure' },
    { src: 'assets/videos-images/GitHub_Symbol_2.webp',                       alt: 'GitHub', title: 'GitHub' },
    { src: 'assets/videos-images/Visual_Studio_Code_Logo_1.png',               alt: 'VS Code', title: 'VS Code' }
  ];

  function createLogoLoop(container, logos, options) {
    var opts = {
      speed:      options.speed      !== undefined ? options.speed      : 80,
      logoHeight: options.logoHeight !== undefined ? options.logoHeight : 44,
      gap:        options.gap        !== undefined ? options.gap        : 64,
      hoverSpeed: options.hoverSpeed !== undefined ? options.hoverSpeed : 0,
      fadeOut:    options.fadeOut    !== undefined ? options.fadeOut    : true,
      ariaLabel:  options.ariaLabel  || 'Technology stack'
    };

    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', opts.ariaLabel);
    container.classList.add('logoloop', 'logoloop--horizontal');
    if (opts.fadeOut) container.classList.add('logoloop--fade');
    container.style.setProperty('--logoloop-gap', opts.gap + 'px');
    container.style.setProperty('--logoloop-logoHeight', opts.logoHeight + 'px');
    // Inherit the site background so the fade matches dark/light mode
    container.style.setProperty('--logoloop-fadeColor', 'var(--bg)');

    var track = document.createElement('div');
    track.className = 'logoloop__track';
    container.appendChild(track);

    function makeList(isHiddenCopy) {
      var ul = document.createElement('ul');
      ul.className = 'logoloop__list';
      ul.setAttribute('role', 'list');
      if (isHiddenCopy) ul.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < logos.length; i++) {
        var item = logos[i];
        var li = document.createElement('li');
        li.className = 'logoloop__item';
        li.setAttribute('role', 'listitem');
        if (item.title) li.setAttribute('title', item.title);
        if (item.html) {
          li.innerHTML = item.html;
        } else if (item.src) {
          var img = document.createElement('img');
          img.src = item.src;
          img.alt = item.alt || item.title || '';
          img.loading = 'lazy';
          img.draggable = false;
          li.appendChild(img);
        }
        ul.appendChild(li);
      }
      return ul;
    }

    var seqWidth = 0;
    var offset   = 0;
    var velocity = 0;
    var isHovered = false;
    var rafId    = null;
    var lastTs   = null;

    function setup() {
      while (track.firstChild) track.removeChild(track.firstChild);
      var firstList = makeList(false);
      track.appendChild(firstList);
      seqWidth = Math.ceil(firstList.getBoundingClientRect().width);
      if (seqWidth === 0) return;
      var copies = Math.max(MIN_COPIES, Math.ceil(container.clientWidth / seqWidth) + COPY_HEADROOM);
      for (var c = 1; c < copies; c++) {
        track.appendChild(makeList(true));
      }
    }

    function tick(ts) {
      if (lastTs === null) lastTs = ts;
      var dt = Math.min((ts - lastTs) / 1000, 0.1);
      lastTs = ts;
      var target = isHovered ? opts.hoverSpeed : opts.speed;
      var ease   = 1 - Math.exp(-dt / SMOOTH_TAU);
      velocity  += (target - velocity) * ease;
      if (seqWidth > 0) {
        offset = ((offset + velocity * dt) % seqWidth + seqWidth) % seqWidth;
        track.style.transform = 'translate3d(' + (-offset) + 'px,0,0)';
      }
      rafId = requestAnimationFrame(tick);
    }

    track.addEventListener('mouseenter', function () { isHovered = true; });
    track.addEventListener('mouseleave', function () { isHovered = false; });

    function start() {
      setup();
      if (seqWidth > 0 && !document.hidden) {
        lastTs = null;
        rafId  = requestAnimationFrame(tick);
      }
    }

    // Two rAF frames to let the layout settle before measuring
    requestAnimationFrame(function () { requestAnimationFrame(start); });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      } else {
        if (!rafId && seqWidth > 0) { lastTs = null; rafId = requestAnimationFrame(tick); }
      }
    });

    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; lastTs = null; }
        requestAnimationFrame(function () { requestAnimationFrame(start); });
      });
      ro.observe(container);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var el = document.getElementById('logo-loop-mount');
    if (!el) return;
    createLogoLoop(el, LOGOS, {
      speed:      80,
      logoHeight: 44,
      gap:        72,
      hoverSpeed: 0,
      fadeOut:    true,
      ariaLabel:  'Technology stack'
    });
  });

})();
