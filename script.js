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
