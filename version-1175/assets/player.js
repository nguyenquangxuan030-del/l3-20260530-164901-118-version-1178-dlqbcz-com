(function () {
    function attachPlayer(shell) {
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('.player-overlay');
        var stream = shell.getAttribute('data-stream');
        var prepared = false;

        if (!video || !overlay || !stream) {
            return;
        }

        function prepare() {
            if (prepared) {
                return Promise.resolve();
            }

            prepared = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                video.hlsInstance = hls;
                return new Promise(function (resolve) {
                    video.addEventListener('loadedmetadata', resolve, { once: true });
                    window.setTimeout(resolve, 1200);
                });
            }

            video.src = stream;
            return Promise.resolve();
        }

        function play() {
            overlay.classList.add('is-hidden');
            prepare().then(function () {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            });
        }

        overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        video.addEventListener('ended', function () {
            overlay.classList.remove('is-hidden');
        });
    }

    document.querySelectorAll('.player-shell[data-stream]').forEach(attachPlayer);
})();
