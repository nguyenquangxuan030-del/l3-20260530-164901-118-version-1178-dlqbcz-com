(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
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

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('.content-section').forEach(function (section) {
        var rail = section.querySelector('[data-horizontal-rail]');
        var left = section.querySelector('[data-scroll-left]');
        var right = section.querySelector('[data-scroll-right]');

        if (!rail) {
            return;
        }

        if (left) {
            left.addEventListener('click', function () {
                rail.scrollBy({ left: -320, behavior: 'smooth' });
            });
        }

        if (right) {
            right.addEventListener('click', function () {
                rail.scrollBy({ left: 320, behavior: 'smooth' });
            });
        }
    });

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var input = panel.querySelector('[data-search-input]');
        var yearSelect = panel.querySelector('[data-filter-year]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var scope = panel.closest('main') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';

            cards.forEach(function (card) {
                var meta = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-meta') || ''
                ].join(' ').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var cardType = card.getAttribute('data-type') || '';
                var ok = true;

                if (query && meta.indexOf(query) === -1) {
                    ok = false;
                }

                if (year && cardYear !== year) {
                    ok = false;
                }

                if (type && cardType !== type) {
                    ok = false;
                }

                card.classList.toggle('is-hidden-card', !ok);
            });
        }

        if (input) {
            input.addEventListener('input', apply);
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', apply);
        }

        if (typeSelect) {
            typeSelect.addEventListener('change', apply);
        }
    });
})();
