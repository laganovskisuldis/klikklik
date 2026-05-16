/* ============================================================
   KKNEW — Klik Klik Global JS v1.0
   Author: 2026.05
   Repository: github.com/laganovskisuldis/klikklik
   CDN: cdn.jsdelivr.net/gh/laganovskisuldis/klikklik@main/kknew.js
   ============================================================ */

(function() {
  'use strict';
  
  window.kknew = window.kknew || {};

  /* A) Dynamic navigation — colour change over light sections */
  kknew.initDynamicNav = function() {
    var nav = document.querySelector('.site-header') 
           || document.querySelector('.kknew-nav') 
           || document.querySelector('header');
    if (!nav) return;
    
    var lightClasses = ['.kknew-section.light', '.kknew-section.lightest'];
    var lightSections = [];
    lightClasses.forEach(function(sel) {
      document.querySelectorAll(sel).forEach(function(el) {
        lightSections.push(el);
      });
    });
    if (!lightSections.length) return;
    
    function updateNav() {
      var onLight = false;
      var threshold = 80;
      lightSections.forEach(function(s) {
        var rect = s.getBoundingClientRect();
        if (rect.top < threshold && rect.bottom > threshold) onLight = true;
      });
      nav.classList.toggle('kknew-nav-light', onLight);
    }
    
    window.addEventListener('scroll', updateNav, { passive: true });
    window.addEventListener('resize', updateNav);
    updateNav();
  };

  /* B) Scroll reveal animations */
  kknew.initScrollReveal = function() {
    var els = document.querySelectorAll('.kknew-reveal');
    if (!els.length || !window.IntersectionObserver) return;
    
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    
    els.forEach(function(el) { observer.observe(el); });
  };

  /* C) Horizontal swipe gallery */
  kknew.initSwipeGallery = function(galleryEl) {
    if (!galleryEl) return;
    
    var wrap = galleryEl.closest('.kknew-gallery-wrap') || galleryEl.parentNode;
    var prevBtn = wrap.querySelector('.kknew-gallery-prev');
    var nextBtn = wrap.querySelector('.kknew-gallery-next');
    var progress = wrap.querySelector('.kknew-gallery-progress-bar');
    
    var isDown = false;
    var startX, scrollLeft;
    
    galleryEl.addEventListener('mousedown', function(e) {
      isDown = true;
      galleryEl.classList.add('is-grabbing');
      startX = e.pageX - galleryEl.offsetLeft;
      scrollLeft = galleryEl.scrollLeft;
    });
    galleryEl.addEventListener('mouseleave', function() {
      isDown = false; galleryEl.classList.remove('is-grabbing');
    });
    galleryEl.addEventListener('mouseup', function() {
      isDown = false; galleryEl.classList.remove('is-grabbing');
    });
    galleryEl.addEventListener('mousemove', function(e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - galleryEl.offsetLeft;
      var walk = (x - startX) * 1.5;
      galleryEl.scrollLeft = scrollLeft - walk;
    });
    
    function getScrollAmount() {
      var first = galleryEl.querySelector(':scope > *');
      if (!first) return 340;
      var styles = getComputedStyle(galleryEl);
      var gap = parseInt(styles.gap) || 20;
      return first.offsetWidth + gap;
    }
    
    if (prevBtn) prevBtn.addEventListener('click', function() {
      galleryEl.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });
    if (nextBtn) nextBtn.addEventListener('click', function() {
      galleryEl.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });
    
    if (progress) {
      galleryEl.addEventListener('scroll', function() {
        var max = galleryEl.scrollWidth - galleryEl.clientWidth;
        var pct = max > 0 ? (galleryEl.scrollLeft / max) * 100 : 0;
        progress.style.width = pct + '%';
      }, { passive: true });
    }
  };
  
  kknew.initAllGalleries = function() {
    document.querySelectorAll('.kknew-gallery').forEach(function(g) {
      kknew.initSwipeGallery(g);
    });
  };

  /* D) Vimeo lightbox */
  kknew.initVimeoLightbox = function() {
    var modal = document.getElementById('kknew-vimeo-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'kknew-vimeo-modal';
      modal.className = 'kknew-vimeo-modal';
      modal.innerHTML = '<div class="kknew-vimeo-modal-inner">' +
        '<button class="kknew-vimeo-close" aria-label="Aizvert">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none">' +
            '<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
          '</svg>' +
        '</button>' +
        '<div class="kknew-vimeo-frame-wrap"></div>' +
        '</div>';
      document.body.appendChild(modal);
    }
    
    var inner = modal.querySelector('.kknew-vimeo-modal-inner');
    var frameWrap = modal.querySelector('.kknew-vimeo-frame-wrap');
    var closeBtn = modal.querySelector('.kknew-vimeo-close');
    
    function openVimeo(vimeoId, isVertical) {
      if (!vimeoId) return;
      inner.classList.toggle('vertical', !!isVertical);
      frameWrap.innerHTML = '<iframe src="https://player.vimeo.com/video/' + vimeoId + 
        '?autoplay=1&title=0&byline=0&portrait=0" frameborder="0" ' +
        'allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function closeVimeo() {
      modal.classList.remove('is-open');
      frameWrap.innerHTML = '';
      document.body.style.overflow = '';
    }
    
    closeBtn.addEventListener('click', closeVimeo);
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeVimeo();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeVimeo();
    });
    
    document.addEventListener('click', function(e) {
      var trigger = e.target.closest('[data-vimeo-id]');
      if (!trigger) return;
      e.preventDefault();
      var id = trigger.getAttribute('data-vimeo-id');
      var vertical = trigger.getAttribute('data-vimeo-vertical') === 'true';
      openVimeo(id, vertical);
    });
    
    kknew.openVimeo = openVimeo;
    kknew.closeVimeo = closeVimeo;
  };

  /* E) Mobile nav */
  kknew.initMobileNav = function() {
    var burger = document.querySelector('.kknew-burger');
    var nav = document.getElementById('kknew-mobile-nav') 
           || document.querySelector('.kknew-mobile-nav');
    if (!burger || !nav) return;
    
    var closeBtn = nav.querySelector('.kknew-mobile-nav-close');
    
    burger.addEventListener('click', function() {
      nav.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
    if (closeBtn) closeBtn.addEventListener('click', function() {
      nav.classList.remove('is-open');
      document.body.style.overflow = '';
    });
    
    nav.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        nav.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  };

  /* F) Contact form */
  kknew.initContactForm = function() {
    var forms = document.querySelectorAll('.kknew-contact-form');
    forms.forEach(function(form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var btn = form.querySelector('[type="submit"]');
        var originalText = btn ? btn.innerHTML : '';
        if (btn) {
          btn.disabled = true;
          btn.innerHTML = 'Suta...';
        }
        
        var formData = new FormData(form);
        var data = {};
        formData.forEach(function(value, key) { data[key] = value; });
        
        var subject = encodeURIComponent('Jauns piedavajums no klikklik.lv - ' + (data.name || 'kontaktforma'));
        var bodyLines = [];
        Object.keys(data).forEach(function(k) {
          bodyLines.push(k.charAt(0).toUpperCase() + k.slice(1) + ': ' + data[k]);
        });
        var body = encodeURIComponent(bodyLines.join('\n\n'));
        window.location.href = 'mailto:info@klikklik.lv?subject=' + subject + '&body=' + body;
        
        setTimeout(function() {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
          }
        }, 2000);
        
        if (typeof fbq !== 'undefined') {
          fbq('track', 'Lead');
        }
      });
    });
  };

  /* G) Testimonial slider */
  kknew.initTestimonialSlider = function() {
    var sliders = document.querySelectorAll('.kknew-testi-slider');
    sliders.forEach(function(slider) {
      var slides = slider.querySelectorAll('.kknew-testi-slide');
      var prev = slider.querySelector('.kknew-testi-prev');
      var next = slider.querySelector('.kknew-testi-next');
      var current = 0;
      
      function show(idx) {
        slides.forEach(function(s, i) {
          s.style.display = i === idx ? '' : 'none';
        });
        current = idx;
      }
      
      if (slides.length === 0) return;
      show(0);
      
      if (prev) prev.addEventListener('click', function() {
        show((current - 1 + slides.length) % slides.length);
      });
      if (next) next.addEventListener('click', function() {
        show((current + 1) % slides.length);
      });
    });
  };

  /* H) Smooth scroll */
  kknew.initSmoothScroll = function() {
    document.addEventListener('click', function(e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  /* Auto-init */
  function initAll() {
    try { kknew.initDynamicNav(); } catch(e) { console.warn('kknew nav:', e); }
    try { kknew.initScrollReveal(); } catch(e) { console.warn('kknew reveal:', e); }
    try { kknew.initAllGalleries(); } catch(e) { console.warn('kknew gallery:', e); }
    try { kknew.initVimeoLightbox(); } catch(e) { console.warn('kknew vimeo:', e); }
    try { kknew.initMobileNav(); } catch(e) { console.warn('kknew mobnav:', e); }
    try { kknew.initContactForm(); } catch(e) { console.warn('kknew form:', e); }
    try { kknew.initTestimonialSlider(); } catch(e) { console.warn('kknew testi:', e); }
    try { kknew.initSmoothScroll(); } catch(e) { console.warn('kknew smooth:', e); }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
  
  /* Watch for dynamically added galleries (Pixieset Flex blocks) */
  if (window.MutationObserver) {
    var mo = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        m.addedNodes.forEach(function(node) {
          if (node.nodeType !== 1) return;
          if (node.classList && node.classList.contains('kknew-gallery')) {
            kknew.initSwipeGallery(node);
          } else if (node.querySelector) {
            var inner = node.querySelectorAll && node.querySelectorAll('.kknew-gallery');
            if (inner && inner.length) {
              inner.forEach(function(g) { kknew.initSwipeGallery(g); });
            }
          }
        });
      });
    });
    mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
  }
  
  console.log('KKNEW v1.0 loaded');
})();
