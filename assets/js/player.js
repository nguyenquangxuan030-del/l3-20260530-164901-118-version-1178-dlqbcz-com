(function () {
  var shell = document.querySelector('[data-player]');

  if (!shell) {
    return;
  }

  var video = shell.querySelector('video');
  var button = shell.querySelector('[data-play-toggle]');
  var muteButton = shell.querySelector('[data-mute-toggle]');
  var fullButton = shell.querySelector('[data-fullscreen]');
  var message = shell.querySelector('[data-player-message]');
  var stream = shell.getAttribute('data-stream');
  var hlsInstance = null;

  function setMessage(text) {
    if (!message) {
      return;
    }

    message.textContent = text;
    message.classList.toggle('show', Boolean(text));
  }

  function updateState() {
    var isPlaying = video && !video.paused && !video.ended;
    shell.classList.toggle('playing', Boolean(isPlaying));

    if (button) {
      button.textContent = isPlaying ? '❚❚' : '▶';
      button.setAttribute('aria-label', isPlaying ? '暂停' : '播放');
    }

    if (muteButton) {
      muteButton.textContent = video && video.muted ? '静音' : '声音';
    }
  }

  function loadStream() {
    if (!video || !stream) {
      setMessage('暂无可播放内容');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setMessage('');
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setMessage('视频加载失败');
        }
      });
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      setMessage('');
      return;
    }

    setMessage('浏览器不支持此播放格式');
  }

  function togglePlay() {
    if (!video) {
      return;
    }

    if (video.paused || video.ended) {
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          setMessage('点击播放按钮后即可继续播放');
        });
      }
    } else {
      video.pause();
    }
  }

  if (button) {
    button.addEventListener('click', togglePlay);
  }

  if (video) {
    video.addEventListener('click', togglePlay);
    video.addEventListener('play', updateState);
    video.addEventListener('pause', updateState);
    video.addEventListener('ended', updateState);
    video.addEventListener('loadedmetadata', updateState);
  }

  if (muteButton) {
    muteButton.addEventListener('click', function () {
      if (!video) {
        return;
      }

      video.muted = !video.muted;
      updateState();
    });
  }

  if (fullButton) {
    fullButton.addEventListener('click', function () {
      if (video && video.requestFullscreen) {
        video.requestFullscreen();
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });

  loadStream();
  updateState();
}());
