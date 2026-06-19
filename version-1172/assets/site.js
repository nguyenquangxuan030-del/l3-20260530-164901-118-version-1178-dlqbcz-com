(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var navMenu = document.querySelector("[data-nav-menu]");
    if (navToggle && navMenu) {
      navToggle.addEventListener("click", function () {
        navMenu.classList.toggle("is-open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;
      var show = function (index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      };
      var start = function () {
        clearInterval(timer);
        timer = setInterval(function () {
          show(current + 1);
        }, 5200);
      };
      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });
      show(0);
      start();
    }

    document.querySelectorAll("[data-scroll-left], [data-scroll-right]").forEach(function (button) {
      button.addEventListener("click", function () {
        var targetId = button.getAttribute("data-scroll-left") || button.getAttribute("data-scroll-right");
        var target = document.getElementById(targetId);
        if (!target) {
          return;
        }
        var dir = button.hasAttribute("data-scroll-left") ? -1 : 1;
        target.scrollBy({ left: dir * 360, behavior: "smooth" });
      });
    });

    var filterRoot = document.querySelector(".filter-target");
    if (filterRoot) {
      var keyword = document.querySelector("[data-filter-keyword]");
      var year = document.querySelector("[data-filter-year]");
      var category = document.querySelector("[data-filter-category]");
      var genre = document.querySelector("[data-filter-genre]");
      var cards = Array.prototype.slice.call(filterRoot.querySelectorAll(".movie-card"));
      var apply = function () {
        var q = keyword ? keyword.value.trim().toLowerCase() : "";
        var y = year ? year.value : "";
        var c = category ? category.value : "";
        var g = genre ? genre.value : "";
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-category") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-region") || "",
            card.textContent || ""
          ].join(" ").toLowerCase();
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (y && card.getAttribute("data-year") !== y) {
            ok = false;
          }
          if (c && card.getAttribute("data-category") !== c) {
            ok = false;
          }
          if (g && (card.getAttribute("data-genre") || "").indexOf(g) === -1) {
            ok = false;
          }
          card.classList.toggle("is-hidden", !ok);
        });
      };
      [keyword, year, category, genre].forEach(function (node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });
    }

    document.querySelectorAll(".player-shell").forEach(function (shell) {
      var video = shell.querySelector(".js-player");
      var cover = shell.querySelector(".play-cover");
      if (!video) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var attached = false;
      var attach = function () {
        if (attached || !stream) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          video._hls = hls;
        } else {
          video.src = stream;
        }
      };
      var play = function () {
        attach();
        if (cover) {
          cover.classList.add("is-hidden");
        }
        var p = video.play();
        if (p && typeof p.catch === "function") {
          p.catch(function () {});
        }
      };
      if (cover) {
        cover.addEventListener("click", play);
      }
      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });
      video.addEventListener("click", function () {
        if (!attached) {
          play();
        }
      });
    });
  });
})();
