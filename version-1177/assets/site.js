(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function bindNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var menu = document.querySelector('[data-nav-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
            toggle.classList.toggle('is-open');
        });
    }

    function bindHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                play();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }
        play();
    }

    function bindSearch() {
        var input = document.querySelector('[data-search-input]');
        var clear = document.querySelector('[data-search-clear]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
        var status = document.querySelector('[data-search-status]');
        if (!input || !cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (query) {
            input.value = query;
        }

        function apply() {
            var value = input.value.trim().toLowerCase();
            var matched = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-keywords') || card.textContent || '').toLowerCase();
                var visible = !value || text.indexOf(value) !== -1;
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    matched += 1;
                }
            });
            if (status) {
                status.textContent = value ? '已筛选到 ' + matched + ' 部相关影片' : '输入关键词开始筛选影片';
            }
        }

        input.addEventListener('input', apply);
        if (clear) {
            clear.addEventListener('click', function () {
                input.value = '';
                apply();
                input.focus();
            });
        }
        apply();
    }

    function bindPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var cover = player.querySelector('.play-cover');
            var source = player.getAttribute('data-play');
            var started = false;
            var hls = null;
            if (!video || !source) {
                return;
            }

            function hideCover() {
                if (cover) {
                    cover.classList.add('is-hidden');
                }
            }

            function begin() {
                hideCover();
                if (started) {
                    video.play().catch(function () {});
                    return;
                }
                started = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', function () {
                        video.play().catch(function () {});
                    }, { once: true });
                    video.load();
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            video.src = source;
                            video.play().catch(function () {});
                        }
                    });
                    return;
                }
                video.src = source;
                video.play().catch(function () {});
            }

            if (cover) {
                cover.addEventListener('click', begin);
            }
            video.addEventListener('click', function () {
                if (!started) {
                    begin();
                } else if (video.paused) {
                    video.play().catch(function () {});
                } else {
                    video.pause();
                }
            });
            video.addEventListener('play', hideCover);
        });
    }

    ready(function () {
        bindNavigation();
        bindHero();
        bindSearch();
        bindPlayers();
    });
}());
