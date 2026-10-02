// Clean HTML5 History API Routing (No visible hash tags) & Smooth Scrolling
(function () {
  var navLinksList = document.querySelectorAll(
    '.site-header .nav-link, .sidebar-links a, a[href="#about"], a[href="#experience"], ' +
    'a[href="#research"], a[href="#projects"], a[href="#teaching"], a[href="#skills"], ' +
    'a[href="#education"], a[href="#contact"]'
  );
  var sections = document.querySelectorAll('main section[id]');

  function getSectionIdFromHref(href) {
    if (!href) return null;
    // Handle #section-id anchors
    var hashMatch = href.match(/^#(.+)$/);
    if (hashMatch) return hashMatch[1];
    // Handle bare paths (legacy) or root
    var clean = href.replace(/^\//, '');
    return clean || 'main-content';
  }

  function scrollToSection(sectionId, updateHistory, historyMethod) {
    var targetEl = (sectionId === 'top' || sectionId === 'main-content')
      ? document.getElementById('main-content')
      : document.getElementById(sectionId);
    if (!targetEl) return;

    var headerOffset = 75;
    var elementPosition = targetEl.getBoundingClientRect().top;
    var offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    if (updateHistory) {
      var cleanPath = (sectionId === 'top' || sectionId === 'main-content' || sectionId === '') ? '/' : '/' + sectionId;
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

    if (targetSection || sectionId === 'top' || sectionId === 'main-content' || href === '/') {
      e.preventDefault();

      // Close mobile navbar collapse if open
      var navCollapse = document.getElementById('portfolioNav');
      if (navCollapse && navCollapse.classList.contains('show')) {
        var bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
        if (bsCollapse) bsCollapse.hide();
      }

      scrollToSection(sectionId === 'top' ? 'main-content' : sectionId, true, 'push');
    }
  });

  // Handle browser Back & Forward button navigation
  window.addEventListener('popstate', function () {
    var path = window.location.pathname.replace(/^\//, '') || window.location.hash.replace(/^#\/?/, '');
    var sectionId = path || 'main-content';
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
        // Silently ignore redirect parse errors
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
        .catch(function () {
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
          .catch(function () {
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


// EmailJS Initialization
(function () {
  emailjs.init('fqG6NfrLG9644WIwd');
})();

// Contact Form — EmailJS submission with in-page status feedback
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('contact-form');
  var statusEl = document.getElementById('form-status');
  var submitBtn = document.getElementById('contact-submit-btn');

  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    // Basic client-side validation
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Disable button while sending
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Sending…';
    statusEl.textContent = '';
    statusEl.className = 'form-status mt-3';

    emailjs.sendForm('service_cpai3x4', 'template_b5miq05', form)
      .then(function () {
        statusEl.textContent = '✓ Message sent successfully! I\'ll get back to you shortly.';
        statusEl.className = 'form-status mt-3 success';
        form.reset();
      })
      .catch(function () {
        statusEl.textContent = '✗ Failed to send message. Please email me directly at contact@riddikshrestha.com.np';
        statusEl.className = 'form-status mt-3 error';
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = 'Send Message';
      });
  });
});
