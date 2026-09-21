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

// Footer Unique Visitor Counter & Last Updated Date Logic
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    function formatDDMMYYYY(dateObj) {
      var d = String(dateObj.getDate()).padStart(2, '0');
      var m = String(dateObj.getMonth() + 1).padStart(2, '0');
      var y = dateObj.getFullYear();
      return d + '-' + m + '-' + y;
    }

    // 1. Fetch & Display Last Updated Date from GitHub API
    var lastUpdatedEl = document.getElementById('last-updated-date');
    if (lastUpdatedEl) {
      fetch('https://api.github.com/repos/riddhikshrestha/riddhikshrestha.github.io/commits?per_page=1')
        .then(function (res) {
          if (!res.ok) throw new Error('GitHub API response not OK');
          return res.json();
        })
        .then(function (data) {
          if (data && data[0] && data[0].commit && data[0].commit.committer && data[0].commit.committer.date) {
            var commitDate = new Date(data[0].commit.committer.date);
            lastUpdatedEl.textContent = formatDDMMYYYY(commitDate);
          } else {
            throw new Error('Invalid commit payload');
          }
        })
        .catch(function (err) {
          console.warn('Could not fetch GitHub commit date, using fallback:', err);
          var fallbackDate = new Date(document.lastModified);
          if (!isNaN(fallbackDate.getTime())) {
            lastUpdatedEl.textContent = formatDDMMYYYY(fallbackDate);
          } else {
            lastUpdatedEl.textContent = '17-09-2026';
          }
        });
    }

    // 2. Fetch & Display Unique Visitor Count
    var visitorCountEl = document.getElementById('visitor-count');
    if (visitorCountEl) {
      var hasVisited = localStorage.getItem('riddhik_portfolio_visited');
      var cachedCount = localStorage.getItem('riddhik_portfolio_count');

      if (!hasVisited) {
        // Unique new visitor -> Increment counter via CounterAPI
        fetch('https://counterapi.com/api/v1/counter?key=riddhikshrestha_portfolio_unique_visitors')
          .then(function (res) {
            if (!res.ok) throw new Error('Counter API response not OK');
            return res.json();
          })
          .then(function (data) {
            var count = data && (data.value || data.count);
            if (count) {
              visitorCountEl.textContent = Number(count).toLocaleString();
              localStorage.setItem('riddhik_portfolio_visited', 'true');
              localStorage.setItem('riddhik_portfolio_count', count);
            } else {
              throw new Error('Invalid counter payload');
            }
          })
          .catch(function (err) {
            console.warn('Counter API error, using fallback:', err);
            var fallback = cachedCount ? Number(cachedCount) : 1;
            visitorCountEl.textContent = fallback.toLocaleString();
          });
      } else {
        // Returning visitor -> Display cached count
        var count = cachedCount ? Number(cachedCount) : 1;
        visitorCountEl.textContent = count.toLocaleString();
      }
    }
  });
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

// Contact Form Handler with EmailJS Delivery to riddhikshrestha@gmail.com
// (function () {
//   var EMAILJS_PUBLIC_KEY = 'fqG6NfrLG9644WIwd';
//   var EMAILJS_SERVICE_ID = 'service_cpai3x4';
//   var EMAILJS_TEMPLATE_ID = 'template_b5miq05';

//   // Initialize EmailJS SDK
//   if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
//     try {
//       emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
//     } catch (e) {
//       console.error('EmailJS init error:', e);
//     }
//   }

//   var form = document.getElementById('contact-form');
//   var status = document.getElementById('form-status');
//   var submitBtn = document.getElementById('contact-submit-btn');

//   if (!form || !status) return;

//   form.addEventListener('submit', function (e) {
//     e.preventDefault();

//     if (submitBtn) {
//       submitBtn.disabled = true;
//       submitBtn.innerHTML = '<span>Sending...</span> <span class="spinner-border spinner-border-sm ms-1" role="status" aria-hidden="true"></span>';
//     }

//     status.className = 'form-status text-primary small font-monospace mt-2';
//     status.textContent = 'Sending message via EmailJS...';

//     var nameVal = form.elements['name'].value;
//     var emailVal = form.elements['email'].value;
//     var subjectVal = form.elements['subject'].value;
//     var messageVal = form.elements['message'].value;

//     var templateParams = {
//       from_name: nameVal,
//       from_email: emailVal,
//       reply_to: emailVal,
//       to_email: 'riddhikshrestha@gmail.com',
//       subject: subjectVal,
//       message: messageVal,
//       name: nameVal,
//       email: emailVal
//     };

//     if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
//       emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
//         .then(function (response) {
//           console.log('EmailJS Success:', response.status, response.text);
//           status.className = 'form-status success small font-monospace mt-2';
//           status.textContent = '✓ Thank you! Your message has been sent to riddhikshrestha@gmail.com via EmailJS.';
//           form.reset();
//         })
//         .catch(function (error) {
//           console.error('EmailJS Error:', error);
//           var errMsg = error && (error.text || error.message) ? (error.text || error.message) : 'Please check EmailJS template variables';
//           status.className = 'form-status text-danger small font-monospace mt-2';
//           status.textContent = '✕ EmailJS Error: ' + errMsg;
//         })
//         .finally(function () {
//           if (submitBtn) {
//             submitBtn.disabled = false;
//             submitBtn.innerHTML = '<span>Send Message</span> <i class="bi bi-send-fill small"></i>';
//           }
//         });
//     } else {
//       // Fallback
//       fetch('https://formsubmit.co/ajax/riddhikshrestha@gmail.com', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
//         body: JSON.stringify({
//           name: nameVal,
//           email: emailVal,
//           _replyto: emailVal,
//           subject: subjectVal,
//           message: messageVal,
//           _subject: 'New Contact Inquiry: ' + subjectVal
//         })
//       })
//         .then(function (res) {
//           if (res.ok) {
//             status.className = 'form-status success small font-monospace mt-2';
//             status.textContent = '✓ Thank you! Your message has been sent to riddhikshrestha@gmail.com.';
//             form.reset();
//           } else {
//             throw new Error('Fallback failed');
//           }
//         })
//         .catch(function () {
//           var mailtoUrl = 'mailto:riddhikshrestha@gmail.com?subject=' +
//             encodeURIComponent(subjectVal) +
//             '&body=' + encodeURIComponent('From: ' + nameVal + ' (' + emailVal + ')\n\n' + messageVal);
//           window.location.href = mailtoUrl;
//           status.className = 'form-status success small font-monospace mt-2';
//           status.textContent = 'Opening your email client...';
//         })
//         .finally(function () {
//           if (submitBtn) {
//             submitBtn.disabled = false;
//             submitBtn.innerHTML = '<span>Send Message</span> <i class="bi bi-send-fill small"></i>';
//           }
//         });
//     }
//   });
// })();
