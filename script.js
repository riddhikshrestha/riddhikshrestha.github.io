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

  // Handle initial page load with clean path or hash
  document.addEventListener('DOMContentLoaded', function () {
    var path = window.location.pathname.replace(/^\//, '') || window.location.hash.replace(/^#\/?/, '');
    if (path && document.getElementById(path)) {
      setTimeout(function () {
        scrollToSection(path, false);
      }, 150);
    }
  });
})();

// Contact Form Handler with EmailJS Delivery to riddhikshrestha@gmail.com
(function () {
  // EmailJS Configuration Constants
  // Replace these placeholders with your actual keys from https://dashboard.emailjs.com/
  var EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';    // Your EmailJS Public Key (e.g. 'user_xxxx')
  var EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';    // Your EmailJS Service ID (e.g. 'service_xxxx')
  var EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // Your EmailJS Template ID (e.g. 'template_xxxx')

  // Initialize EmailJS SDK if public key is configured
  if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  var submitBtn = document.getElementById('contact-submit-btn');

  if (!form || !status) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending...</span> <span class="spinner-border spinner-border-sm ms-1" role="status" aria-hidden="true"></span>';
    }

    status.className = 'form-status text-primary small font-monospace mt-2';
    status.textContent = 'Sending message...';

    var nameVal = form.elements['name'].value;
    var emailVal = form.elements['email'].value;
    var subjectVal = form.elements['subject'].value;
    var messageVal = form.elements['message'].value;

    var templateParams = {
      from_name: nameVal,
      from_email: emailVal,
      reply_to: emailVal,
      to_email: 'riddhikshrestha@gmail.com',
      subject: subjectVal,
      message: messageVal
    };

    // Use EmailJS if keys are configured
    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function () {
          status.className = 'form-status success small font-monospace mt-2';
          status.textContent = '✓ Thank you! Your message has been sent to riddhikshrestha@gmail.com via EmailJS.';
          form.reset();
        })
        .catch(function (error) {
          console.error('EmailJS Error:', error);
          status.className = 'form-status text-danger small font-monospace mt-2';
          status.textContent = '✕ EmailJS Error: Please verify your Service ID, Template ID, and Public Key.';
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Send Message</span> <i class="bi bi-send-fill small"></i>';
          }
        });
    } else {
      // Live AJAX Fallback to ensure instant delivery until EmailJS keys are pasted in
      fetch('https://formsubmit.co/ajax/riddhikshrestha@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: nameVal,
          email: emailVal,
          _replyto: emailVal,
          subject: subjectVal,
          message: messageVal,
          _subject: 'New Contact Inquiry: ' + subjectVal
        })
      })
      .then(function (res) {
        if (res.ok) {
          status.className = 'form-status success small font-monospace mt-2';
          status.textContent = '✓ Thank you! Your message has been sent to riddhikshrestha@gmail.com.';
          form.reset();
        } else {
          throw new Error('Fallback failed');
        }
      })
      .catch(function () {
        var mailtoUrl = 'mailto:riddhikshrestha@gmail.com?subject=' +
          encodeURIComponent(subjectVal) +
          '&body=' + encodeURIComponent('From: ' + nameVal + ' (' + emailVal + ')\n\n' + messageVal);
        window.location.href = mailtoUrl;
        status.className = 'form-status success small font-monospace mt-2';
        status.textContent = 'Opening your email client...';
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Send Message</span> <i class="bi bi-send-fill small"></i>';
        }
      });
    }
  });
})();
