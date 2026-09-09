// Highlight the active nav link based on scroll position.
(function () {
  var sections = document.querySelectorAll('main section[id]');
  var links = document.querySelectorAll('.nav-links a');
  if (!sections.length || !links.length) return;

  var map = {};
  links.forEach(function (l) {
    var id = l.getAttribute('href').replace('#', '');
    map[id] = l;
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var link = map[entry.target.id];
      if (!link) return;
      if (entry.isIntersecting) {
        links.forEach(function (l) { l.style.color = ''; l.style.borderColor = 'transparent'; });
        link.style.color = 'var(--amber-dark)';
        link.style.borderColor = 'var(--amber)';
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(function (s) { observer.observe(s); });
})();

// Mobile Navigation Toggle
(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');
  if (!navToggle || !navLinks) return;

  navToggle.addEventListener('click', function () {
    var isOpen = navToggle.classList.toggle('open');
    navLinks.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

// Animated Neural Network Canvas Background
(function () {
  var canvas = document.getElementById('neural-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var hero = canvas.parentElement;
  var width, height;
  var nodes = [];
  var pulses = [];
  var mouse = { x: null, y: null, radius: 170 };

  function resize() {
    width = canvas.width = hero.offsetWidth;
    height = canvas.height = hero.offsetHeight;
    initNodes();
  }

  function initNodes() {
    nodes = [];
    var count = Math.floor((width * height) / 11000);
    count = Math.max(35, Math.min(count, 85));

    for (var i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2 + 1.5,
        color: Math.random() > 0.35 ? '#D9822B' : (Math.random() > 0.5 ? '#4C8B72' : '#A9BDCF')
      });
    }
  }

  function spawnPulse(n1, n2) {
    if (Math.random() < 0.012) {
      pulses.push({
        x1: n1.x, y1: n1.y,
        x2: n2.x, y2: n2.y,
        progress: 0,
        speed: 0.012 + Math.random() * 0.018
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    var maxDist = 145;

    // Update & draw nodes and synaptic connections
    for (var i = 0; i < nodes.length; i++) {
      var n1 = nodes[i];

      n1.x += n1.vx;
      n1.y += n1.vy;

      if (n1.x < 0 || n1.x > width) n1.vx *= -1;
      if (n1.y < 0 || n1.y > height) n1.vy *= -1;

      // Mouse proximity interaction
      if (mouse.x !== null) {
        var dxMouse = n1.x - mouse.x;
        var dyMouse = n1.y - mouse.y;
        var distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < mouse.radius) {
          var alphaM = (1 - distMouse / mouse.radius) * 0.45;
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = 'rgba(217, 130, 43, ' + alphaM + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Connect node pairs within maxDist
      for (var j = i + 1; j < nodes.length; j++) {
        var n2 = nodes[j];
        var dx = n1.x - n2.x;
        var dy = n1.y - n2.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          var alpha = (1 - dist / maxDist) * 0.35;
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.strokeStyle = 'rgba(127, 160, 188, ' + alpha + ')';
          ctx.lineWidth = 1;
          ctx.stroke();

          spawnPulse(n1, n2);
        }
      }

      // Render node dot
      ctx.beginPath();
      ctx.arc(n1.x, n1.y, n1.radius, 0, Math.PI * 2);
      ctx.fillStyle = n1.color;
      ctx.shadowColor = n1.color;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Render traveling neural signal pulses
    for (var p = pulses.length - 1; p >= 0; p--) {
      var pulse = pulses[p];
      pulse.progress += pulse.speed;
      if (pulse.progress >= 1) {
        pulses.splice(p, 1);
        continue;
      }

      var px = pulse.x1 + (pulse.x2 - pulse.x1) * pulse.progress;
      var py = pulse.y1 + (pulse.y2 - pulse.y1) * pulse.progress;

      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFC107';
      ctx.shadowColor = '#D9822B';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    requestAnimationFrame(animate);
  }

  hero.addEventListener('mousemove', function (e) {
    var rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  hero.addEventListener('mouseleave', function () {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', resize);
  resize();
  animate();
})();

// Contact Form Handler
(function () {
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  if (!form || !status) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form-status success';
    status.textContent = '✓ Thank you! Your message has been sent successfully.';
    form.reset();
  });
})();
