(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = qs('[data-menu-toggle]');
  var mobileNav = qs('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  qsa('[data-hero-carousel]').forEach(function (carousel) {
    var slides = qsa('[data-hero-slide]', carousel);
    var dots = qsa('[data-hero-dot]', carousel);
    var prev = qs('[data-hero-prev]', carousel);
    var next = qs('[data-hero-next]', carousel);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  qsa('[data-filter-panel]').forEach(function (panel) {
    var search = qs('[data-local-search]', panel);
    var typeFilter = qs('[data-type-filter]', panel);
    var yearFilter = qs('[data-year-filter]', panel);
    var clear = qs('[data-clear-filter]', panel);
    var list = qs('[data-searchable-list]');
    var cards = list ? qsa('[data-movie-card]', list) : [];

    function apply() {
      var keyword = search ? search.value.trim().toLowerCase() : '';
      var typeValue = typeFilter ? typeFilter.value : '';
      var yearValue = yearFilter ? yearFilter.value : '';

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesType = !typeValue || card.getAttribute('data-type') === typeValue;
        var matchesYear = !yearValue || card.getAttribute('data-year') === yearValue;
        card.classList.toggle('is-hidden-by-filter', !(matchesKeyword && matchesType && matchesYear));
      });
    }

    [search, typeFilter, yearFilter].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });

    if (clear) {
      clear.addEventListener('click', function () {
        if (search) {
          search.value = '';
        }
        if (typeFilter) {
          typeFilter.value = '';
        }
        if (yearFilter) {
          yearFilter.value = '';
        }
        apply();
      });
    }
  });
})();

function initDetailPlayer(source) {
  var video = document.getElementById('moviePlayer');
  var overlay = document.getElementById('playOverlay');
  var hlsInstance = null;

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (video.getAttribute('data-source-ready') === 'true') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.setAttribute('data-source-ready', 'true');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      video.setAttribute('data-source-ready', 'true');
      return;
    }

    video.src = source;
    video.setAttribute('data-source-ready', 'true');
  }

  function playVideo() {
    attachSource();
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  attachSource();

  if (overlay) {
    overlay.addEventListener('click', playVideo);
  }

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove('is-hidden');
    }
  });

  video.addEventListener('ended', function () {
    if (overlay) {
      overlay.classList.remove('is-hidden');
    }
  });

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var input = document.getElementById('globalSearchInput');
    var typeFilter = document.getElementById('globalTypeFilter');
    var button = document.getElementById('globalSearchButton');
    var results = document.getElementById('globalSearchResults');
    var status = document.getElementById('globalSearchStatus');

    if (!input || !button || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    function paramsQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function card(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster" href="' + escapeHtml(movie.url) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-type">' + escapeHtml(movie.type) + '</span>',
      '    <span class="poster-year">' + escapeHtml(movie.year) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <a class="movie-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.genre) + '</span>',
      '    </div>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function search() {
    var keyword = input.value.trim().toLowerCase();
    var typeValue = typeFilter ? typeFilter.value : '';
    var pool = window.MOVIE_SEARCH_DATA.filter(function (movie) {
      var text = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags.join(' '),
        movie.category
      ].join(' ').toLowerCase();
      var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchesType = !typeValue || movie.type === typeValue;
      return matchesKeyword && matchesType;
    }).slice(0, 80);

    results.innerHTML = pool.map(card).join('');
    status.textContent = keyword ? '匹配内容' : '精选内容';
  }

    input.value = paramsQuery();
    input.addEventListener('input', search);
    if (typeFilter) {
      typeFilter.addEventListener('change', search);
    }
    button.addEventListener('click', search);
    search();
  });
})();
