(function () {
    var body = document.body;
    var menu = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menu) {
        menu.addEventListener('click', function () {
            body.classList.toggle('nav-open');
        });
    }

    if (mobileNav) {
        mobileNav.addEventListener('click', function (event) {
            if (event.target.tagName === 'A') {
                body.classList.remove('nav-open');
            }
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var current = 0;
        var timer = null;

        var show = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        var start = function () {
            if (timer || slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        };

        var stop = function () {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                stop();
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        start();
    }

    var keyword = document.getElementById('movieKeyword');
    var categoryFilter = document.getElementById('categoryFilter');
    var regionFilter = document.getElementById('regionFilter');
    var typeFilter = document.getElementById('typeFilter');
    var searchGrid = document.getElementById('searchGrid');

    if (searchGrid) {
        var cards = Array.prototype.slice.call(searchGrid.querySelectorAll('.movie-card'));
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');

        if (q && keyword) {
            keyword.value = q;
        }

        var normalize = function (value) {
            return String(value || '').toLowerCase().trim();
        };

        var filterCards = function () {
            var term = normalize(keyword && keyword.value);
            var cat = normalize(categoryFilter && categoryFilter.value);
            var region = normalize(regionFilter && regionFilter.value);
            var type = normalize(typeFilter && typeFilter.value);

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.category,
                    card.dataset.tags
                ].join(' '));
                var matched = true;

                if (term && haystack.indexOf(term) === -1) {
                    matched = false;
                }

                if (cat && normalize(card.dataset.category) !== cat) {
                    matched = false;
                }

                if (region && normalize(card.dataset.region) !== region) {
                    matched = false;
                }

                if (type && normalize(card.dataset.type) !== type) {
                    matched = false;
                }

                card.classList.toggle('is-hidden', !matched);
            });
        };

        [keyword, categoryFilter, regionFilter, typeFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', filterCards);
                control.addEventListener('change', filterCards);
            }
        });

        filterCards();
    }

    var backTop = document.querySelector('.back-top');

    if (backTop) {
        var toggleTop = function () {
            backTop.classList.toggle('is-visible', window.scrollY > 620);
        };

        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', toggleTop, { passive: true });
        toggleTop();
    }
})();
