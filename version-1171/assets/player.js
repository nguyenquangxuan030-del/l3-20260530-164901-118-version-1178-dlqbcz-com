(function () {
  window.initVideoPlayer = function (videoId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var ready = false;
    var hls = null;

    if (!video || !streamUrl) {
      return;
    }

    function prepare() {
      if (ready) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      ready = true;
    }

    function play() {
      prepare();

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          video.controls = true;
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    video.addEventListener("ended", function () {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
