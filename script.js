// Navbar Collapse auto-close & Active Nav Link Highlighting
(function () {
  var navLinks = document.querySelectorAll('.site-header .nav-link');
  var navCollapse = document.getElementById('portfolioNav');

  if (navLinks.length && navCollapse) {
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (navCollapse.classList.contains('show')) {
          var bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
          if (bsCollapse) {
            bsCollapse.hide();
          }
        }
      });
    });
  }

  // Active scroll highlight using IntersectionObserver
  var sections = document.querySelectorAll('main section[id]');
  if (!sections.length || !navLinks.length) return;

  var map = {};
  navLinks.forEach(function (l) {
    var href = l.getAttribute('href');
    if (href && href.startsWith('#')) {
      map[href.substring(1)] = l;
    }
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var link = map[entry.target.id];
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach(function (l) { l.classList.remove('active'); });
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

  sections.forEach(function (s) { observer.observe(s); });
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
