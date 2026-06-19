(function () {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.hidden = !mobileMenu.hidden;
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  const prev = document.querySelector("[data-hero-prev]");
  const next = document.querySelector("[data-hero-next]");
  let current = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  function moveSlide(step) {
    showSlide(current + step);
  }

  function startHero() {
    if (timer) {
      clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = setInterval(function () {
        moveSlide(1);
      }, 5200);
    }
  }

  if (slides.length) {
    showSlide(0);
    startHero();

    if (prev) {
      prev.addEventListener("click", function () {
        moveSlide(-1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        moveSlide(1);
        startHero();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        startHero();
      });
    });
  }

  const pageFilter = document.querySelector("[data-page-filter]");
  if (pageFilter) {
    const input = pageFilter.querySelector("[data-filter-keyword]");
    const year = pageFilter.querySelector("[data-filter-year]");
    const region = pageFilter.querySelector("[data-filter-region]");
    const cards = Array.from(document.querySelectorAll("[data-movie-card]"));
    const empty = document.querySelector("[data-empty-state]");

    function applyFilter() {
      const kw = (input && input.value ? input.value : "").trim().toLowerCase();
      const y = year && year.value ? year.value : "";
      const r = region && region.value ? region.value : "";
      let visible = 0;

      cards.forEach(function (card) {
        const text = [
          card.dataset.title || "",
          card.dataset.region || "",
          card.dataset.year || "",
          card.dataset.category || "",
          card.textContent || "",
        ]
          .join(" ")
          .toLowerCase();

        const okKeyword = !kw || text.indexOf(kw) !== -1;
        const okYear = !y || (card.dataset.year || "").indexOf(y) !== -1;
        const okRegion = !r || (card.dataset.region || "").indexOf(r) !== -1;
        const show = okKeyword && okYear && okRegion;

        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible > 0;
      }
    }

    [input, year, region].forEach(function (el) {
      if (el) {
        el.addEventListener("input", applyFilter);
        el.addEventListener("change", applyFilter);
      }
    });
  }

  function bindSearch(input, panel) {
    if (!input || !panel || !window.SEARCH_MOVIES) {
      return;
    }

    function render() {
      const keyword = input.value.trim().toLowerCase();
      panel.innerHTML = "";

      if (!keyword) {
        panel.hidden = true;
        return;
      }

      const results = window.SEARCH_MOVIES.filter(function (movie) {
        return (
          [movie.title, movie.region, movie.year, movie.genre]
            .join(" ")
            .toLowerCase()
            .indexOf(keyword) !== -1
        );
      }).slice(0, 8);

      if (!results.length) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "没有找到匹配内容";
        panel.appendChild(empty);
        panel.hidden = false;
        return;
      }

      results.forEach(function (movie) {
        const link = document.createElement("a");
        link.className = "search-result";
        link.href = movie.url;

        const img = document.createElement("img");
        img.src = movie.cover;
        img.alt = movie.title;

        const text = document.createElement("span");
        const title = document.createElement("strong");
        title.textContent = movie.title;
        const meta = document.createElement("span");
        meta.textContent =
          movie.year + " · " + movie.region + " · " + movie.genre;

        text.appendChild(title);
        text.appendChild(meta);
        link.appendChild(img);
        link.appendChild(text);
        panel.appendChild(link);
      });

      panel.hidden = false;
    }

    input.addEventListener("input", render);
    input.addEventListener("focus", render);
    document.addEventListener("click", function (event) {
      if (!panel.contains(event.target) && event.target !== input) {
        panel.hidden = true;
      }
    });
  }

  bindSearch(
    document.getElementById("global-search-input"),
    document.getElementById("global-search-panel"),
  );

  const mobileSearch = document.getElementById("mobile-search-input");
  if (mobileSearch) {
    mobileSearch.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        const keyword = encodeURIComponent(mobileSearch.value.trim());
        if (keyword) {
          window.location.href = "ranking.html?search=" + keyword;
        }
      }
    });
  }

  const searchParams = new URLSearchParams(window.location.search);
  const searchKeyword = searchParams.get("search");
  const pageKeyword = document.querySelector("[data-filter-keyword]");
  if (searchKeyword && pageKeyword) {
    pageKeyword.value = searchKeyword;
    pageKeyword.dispatchEvent(new Event("input"));
  }
})();
