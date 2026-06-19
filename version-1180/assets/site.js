(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-nav-links]');

    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    var searchInput = document.querySelector('[data-site-search]');
    var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-key]'));
    var searchableItems = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
    var emptyState = document.querySelector('[data-empty]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        if (!searchableItems.length) {
            return;
        }

        var query = normalize(searchInput ? searchInput.value : '');
        var visibleCount = 0;

        searchableItems.forEach(function (item) {
            var matched = true;
            var searchable = normalize(item.getAttribute('data-search'));

            if (query && searchable.indexOf(query) === -1) {
                matched = false;
            }

            selects.forEach(function (select) {
                var key = select.getAttribute('data-filter-key');
                var value = normalize(select.value);
                var itemValue = normalize(item.getAttribute('data-' + key));

                if (value && itemValue !== value) {
                    matched = false;
                }
            });

            item.hidden = !matched;

            if (matched) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visibleCount === 0);
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    selects.forEach(function (select) {
        select.addEventListener('change', applyFilters);
    });
})();

function setupPlayer(videoId, buttonId, coverId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var cover = document.getElementById(coverId);
    var errorBox = document.getElementById('player-error');
    var connected = false;
    var hlsInstance = null;

    if (!video || !button || !cover || !streamUrl) {
        return;
    }

    function showError() {
        if (errorBox) {
            errorBox.textContent = '视频暂时无法播放，请稍后再试';
        }
    }

    function playVideo() {
        var result = video.play();

        if (result && typeof result.catch === 'function') {
            result.catch(function () {
                cover.classList.remove('is-hidden');
            });
        }
    }

    function connectVideo() {
        if (connected) {
            playVideo();
            return;
        }

        connected = true;

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });

            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                playVideo();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showError();
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            video.addEventListener('loadedmetadata', playVideo, { once: true });
        } else {
            video.src = streamUrl;
            video.addEventListener('loadedmetadata', playVideo, { once: true });
        }
    }

    function startPlayer() {
        cover.classList.add('is-hidden');
        connectVideo();
        window.setTimeout(playVideo, 650);
    }

    button.addEventListener('click', startPlayer);
    cover.addEventListener('click', startPlayer);
    video.addEventListener('error', showError);

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
