(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('.player-frame'));

    players.forEach(function (frame) {
        var video = frame.querySelector('video');
        var cover = frame.querySelector('.video-cover');
        var src = frame.getAttribute('data-hls');
        var hlsInstance = null;

        if (!video || !src) {
            return;
        }

        var attach = function () {
            if (video.src || hlsInstance) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
            } else {
                video.src = src;
            }
        };

        var start = function () {
            attach();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    video.controls = true;
                });
            }
        };

        if (cover) {
            cover.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (!video.src && !hlsInstance) {
                start();
                return;
            }
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    });
})();
