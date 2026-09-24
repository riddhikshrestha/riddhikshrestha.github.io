// Clean HTML5 History API Routing (No visible hash tags) & Smooth Scrolling
(function () {
  var navLinksList = document.querySelectorAll('.site-header .nav-link, .sidebar-links a, a[href="about"], a[href="experience"], a[href="research"], a[href="projects"], a[href="teaching"], a[href="skills"], a[href="education"], a[href="contact"]');
  var sections = document.querySelectorAll('main section[id]');

  function getSectionIdFromHref(href) {
    if (!href) return null;
    var clean = href.replace(/^#\/?/, '').replace(/^\//, '');
    return clean || 'top';
  }

  function scrollToSection(sectionId, updateHistory, historyMethod) {
    var targetEl = sectionId === 'top' ? document.getElementById('top') : document.getElementById(sectionId);
    if (!targetEl) return;

    var headerOffset = 75;
    var elementPosition = targetEl.getBoundingClientRect().top;
    var offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    if (updateHistory) {
      var cleanPath = (sectionId === 'top' || sectionId === '') ? '/' : '/' + sectionId;
      if (window.location.pathname !== cleanPath && window.location.hash !== '#' + sectionId) {
        if (historyMethod === 'replace') {
          history.replaceState({ section: sectionId }, '', cleanPath);
        } else {
          history.pushState({ section: sectionId }, '', cleanPath);
        }
      }
    }
  }

  // Intercept clicks on internal navigation links
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a');
    if (!link) return;

    var href = link.getAttribute('href');
    if (!href) return;

    var sectionId = getSectionIdFromHref(href);
    var targetSection = document.getElementById(sectionId);

    if (targetSection || sectionId === 'top' || href === '/') {
      e.preventDefault();

      // Close mobile navbar collapse if open
      var navCollapse = document.getElementById('portfolioNav');
      if (navCollapse && navCollapse.classList.contains('show')) {
        var bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
        if (bsCollapse) bsCollapse.hide();
      }

      scrollToSection(sectionId === 'top' ? 'top' : sectionId, true, 'push');
    }
  });

  // Handle browser Back & Forward button navigation
  window.addEventListener('popstate', function () {
    var path = window.location.pathname.replace(/^\//, '') || window.location.hash.replace(/^#\/?/, '');
    var sectionId = path || 'top';
    scrollToSection(sectionId, false);
  });

  // Active section highlighting & clean URL sync on scroll
  var sectionMap = {};
  navLinksList.forEach(function (l) {
    var href = l.getAttribute('href');
    var sId = getSectionIdFromHref(href);
    if (sId) sectionMap[sId] = l;
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var sId = entry.target.id;
        var activeLink = sectionMap[sId];
        if (activeLink) {
          navLinksList.forEach(function (l) { l.classList.remove('active'); });
          activeLink.classList.add('active');

          var cleanPath = '/' + sId;
          if (window.location.pathname !== cleanPath && window.location.hash !== '#' + sId) {
            history.replaceState({ section: sId }, '', cleanPath);
          }
        }
      }
    });
  }, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });

  sections.forEach(function (s) { observer.observe(s); });

  // Handle initial page load with clean path, 404 session redirect, or hash
  document.addEventListener('DOMContentLoaded', function () {
    var redirectedUrl = sessionStorage.getItem('spa_redirect');
    if (redirectedUrl) {
      sessionStorage.removeItem('spa_redirect');
      try {
        var parsed = new URL(redirectedUrl);
        var cleanPath = parsed.pathname.replace(/^\//, '') || parsed.hash.replace(/^#\/?/, '');
        if (cleanPath && document.getElementById(cleanPath)) {
          history.replaceState({ section: cleanPath }, '', '/' + cleanPath);
          setTimeout(function () {
            scrollToSection(cleanPath, false);
          }, 100);
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }

    var path = window.location.pathname.replace(/^\//, '') || window.location.hash.replace(/^#\/?/, '');
    if (path && document.getElementById(path)) {
      setTimeout(function () {
        scrollToSection(path, false);
      }, 150);
    }
  });
})();

// Footer Dynamic Last Updated Date & Visitor Counter Logic
(function () {
  function formatDDMMYYYY(dateObj) {
    var d = String(dateObj.getDate()).padStart(2, '0');
    var m = String(dateObj.getMonth() + 1).padStart(2, '0');
    var y = dateObj.getFullYear();
    return d + '-' + m + '-' + y;
  }

  function initFooterData() {
    // 1. Dynamic Fetch of Last Updated Date from GitHub REST API
    var lastUpdatedEl = document.getElementById('last-updated-date');
    if (lastUpdatedEl) {
      fetch('https://api.github.com/repos/riddhikshrestha/riddhikshrestha.github.io/commits?per_page=1')
        .then(function (res) {
          if (!res.ok) throw new Error('GitHub API returned status ' + res.status);
          return res.json();
        })
        .then(function (data) {
          var dateStr = (data && data[0] && data[0].commit && data[0].commit.committer && data[0].commit.committer.date) ||
                         (data && data.commit && data.commit.committer && data.commit.committer.date);
          if (dateStr) {
            var commitDate = new Date(dateStr);
            lastUpdatedEl.textContent = formatDDMMYYYY(commitDate);
          } else {
            throw new Error('Invalid commit date payload');
          }
        })
        .catch(function (err) {
          console.warn('GitHub API fetch failed, using document.lastModified:', err);
          var fallbackDate = new Date(document.lastModified);
          if (!isNaN(fallbackDate.getTime())) {
            lastUpdatedEl.textContent = formatDDMMYYYY(fallbackDate);
          }
        });
    }

    // 2. Fetch & Display Unique Visitor Count if element exists
    var visitorCountEl = document.getElementById('visitor-count');
    if (visitorCountEl) {
      var hasVisited = localStorage.getItem('riddhik_portfolio_visited');
      var cachedCount = localStorage.getItem('riddhik_portfolio_count');

      if (!hasVisited) {
        fetch('https://counterapi.com/api/v1/counter?key=riddhikshrestha_portfolio_unique_visitors')
          .then(function (res) {
            if (!res.ok) throw new Error('Counter API error');
            return res.json();
          })
          .then(function (data) {
            var count = data && (data.value || data.count);
            if (count) {
              visitorCountEl.textContent = Number(count).toLocaleString();
              localStorage.setItem('riddhik_portfolio_visited', 'true');
              localStorage.setItem('riddhik_portfolio_count', count);
            }
          })
          .catch(function (err) {
            console.warn('Counter API error:', err);
            if (cachedCount) visitorCountEl.textContent = Number(cachedCount).toLocaleString();
          });
      } else if (cachedCount) {
        visitorCountEl.textContent = Number(cachedCount).toLocaleString();
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooterData);
  } else {
    initFooterData();
  }
})();



(function () {
  // Initialize with your Public Key
  emailjs.init("fqG6NfrLG9644WIwd");
})();

document.getElementById('contact-form').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent page reload

  // Send form data directly
  emailjs.sendForm('service_cpai3x4', 'template_b5miq05', this)
    .then(function () {
      console.log('SUCCESS!');
      alert('Email sent successfully!');
    }, function (error) {
      console.log('FAILED...', error);
      alert('Failed to send email.');
    });
});

