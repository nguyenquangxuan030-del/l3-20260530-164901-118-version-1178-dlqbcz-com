(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    var startTimer = function () {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        showSlide(index);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  var normalize = function (value) {
    return String(value || '').trim().toLowerCase();
  };

  var filterScopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
  filterScopes.forEach(function (scope) {
    var panel = scope.querySelector('[data-filter-panel]');
    var grid = scope.querySelector('[data-filterable]');
    if (!panel || !grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.children);
    var searchInput = panel.querySelector('[data-card-search]');
    var regionSelect = panel.querySelector('[data-region-filter]');
    var yearSelect = panel.querySelector('[data-year-filter]');
    var sortSelect = panel.querySelector('[data-sort-filter]');
    var emptyState = scope.querySelector('[data-empty-state]');

    var applyQueryFromLocation = function () {
      if (!searchInput) {
        return;
      }
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        searchInput.value = query;
      }
    };

    var sortCards = function () {
      if (!sortSelect) {
        return;
      }
      var mode = sortSelect.value;
      var sorted = cards.slice();
      if (mode === 'year-desc') {
        sorted.sort(function (a, b) {
          return normalize(b.dataset.year).localeCompare(normalize(a.dataset.year), 'zh-CN');
        });
      }
      if (mode === 'title-asc') {
        sorted.sort(function (a, b) {
          return normalize(a.dataset.title).localeCompare(normalize(b.dataset.title), 'zh-CN');
        });
      }
      if (mode === 'default') {
        sorted = cards.slice();
      }
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    };

    var applyFilters = function () {
      var query = normalize(searchInput && searchInput.value);
      var region = normalize(regionSelect && regionSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var visible = 0;

      sortCards();

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.year,
          card.textContent
        ].join(' '));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesRegion = !region || normalize(card.dataset.region) === region;
        var matchesYear = !year || normalize(card.dataset.year) === year;
        var active = matchesQuery && matchesRegion && matchesYear;

        card.classList.toggle('is-hidden', !active);
        if (active) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    };

    applyQueryFromLocation();
    applyFilters();

    [searchInput, regionSelect, yearSelect, sortSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var streamUrl = player.getAttribute('data-stream');
    var attached = false;

    var attachStream = function () {
      if (!video || !streamUrl || attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        attached = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        attached = true;
        return;
      }

      video.src = streamUrl;
      attached = true;
    };

    var playVideo = function () {
      attachStream();
      player.classList.add('is-playing');
      if (video) {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
    };

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('play', function () {
        attachStream();
        player.classList.add('is-playing');
      }, { once: true });
    }
  });
})();
