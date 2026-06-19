(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;

  function showHeroSlide(index) {
    if (!heroSlides.length) {
      return;
    }

    activeSlide = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeSlide);
    });
    heroDots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeSlide);
    });
  }

  if (heroSlides.length) {
    heroDots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showHeroSlide(index);
      });
    });
    showHeroSlide(0);
    window.setInterval(function () {
      showHeroSlide(activeSlide + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterRegion = document.querySelector('[data-filter-region]');
  var filterCategory = document.querySelector('[data-filter-category]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(filterInput && filterInput.value);
    var year = normalize(filterYear && filterYear.value);
    var region = normalize(filterRegion && filterRegion.value);
    var category = normalize(filterCategory && filterCategory.value);
    var shown = 0;

    cards.forEach(function (card) {
      var text = normalize(card.textContent + ' ' + card.dataset.title + ' ' + card.dataset.tags + ' ' + card.dataset.region);
      var cardYear = normalize(card.dataset.year);
      var cardRegion = normalize(card.dataset.region);
      var cardCategory = normalize(card.dataset.category);
      var matched = true;

      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      if (region && cardRegion.indexOf(region) === -1) {
        matched = false;
      }

      if (category && cardCategory !== category) {
        matched = false;
      }

      card.style.display = matched ? '' : 'none';
      if (matched) {
        shown += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', shown === 0);
    }
  }

  [filterInput, filterYear, filterRegion, filterCategory].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  var backTop = document.createElement('button');
  backTop.className = 'back-top';
  backTop.type = 'button';
  backTop.setAttribute('aria-label', '回到顶部');
  backTop.textContent = '↑';
  document.body.appendChild(backTop);
  backTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', function () {
    backTop.classList.toggle('show', window.scrollY > 480);
  }, { passive: true });
}());
