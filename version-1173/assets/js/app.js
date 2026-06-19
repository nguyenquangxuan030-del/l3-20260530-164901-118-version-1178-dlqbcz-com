(function () {
    const hlsCdnUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js";
    let hlsLoadingPromise = null;

    function selectAll(selector, parent) {
        return Array.from((parent || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        const button = document.querySelector("[data-menu-toggle]");
        const panel = document.querySelector("[data-mobile-menu]");
        if (!button || !panel) {
            return;
        }

        button.addEventListener("click", function () {
            panel.classList.toggle("open");
            document.body.classList.toggle("menu-open", panel.classList.contains("open"));
        });
    }

    function initHero() {
        const hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        const slides = selectAll("[data-hero-slide]", hero);
        const dots = selectAll("[data-hero-dot]", hero);
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let activeIndex = 0;
        let timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === activeIndex);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5000);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(activeIndex - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(activeIndex + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                const index = Number(dot.getAttribute("data-hero-dot"));
                showSlide(index);
                startTimer();
            });
        });

        hero.addEventListener("mouseenter", stopTimer);
        hero.addEventListener("mouseleave", startTimer);
        showSlide(0);
        startTimer();
    }

    function initHorizontalRows() {
        selectAll("[data-scroll-left]").forEach(function (button) {
            button.addEventListener("click", function () {
                const name = button.getAttribute("data-scroll-left");
                const row = document.querySelector('[data-scroll-row="' + name + '"]');
                if (row) {
                    row.scrollBy({ left: -360, behavior: "smooth" });
                }
            });
        });

        selectAll("[data-scroll-right]").forEach(function (button) {
            button.addEventListener("click", function () {
                const name = button.getAttribute("data-scroll-right");
                const row = document.querySelector('[data-scroll-row="' + name + '"]');
                if (row) {
                    row.scrollBy({ left: 360, behavior: "smooth" });
                }
            });
        });
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function getMovieIndex() {
        return Array.isArray(window.MOVIE_INDEX) ? window.MOVIE_INDEX : [];
    }

    function renderSuggestions(input, panel) {
        const query = normalize(input.value);
        const movies = getMovieIndex();

        if (!query) {
            panel.classList.remove("open");
            panel.innerHTML = "";
            return;
        }

        const results = movies.filter(function (movie) {
            const searchText = normalize([
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.category,
                (movie.tags || []).join(" ")
            ].join(" "));
            return searchText.includes(query);
        }).slice(0, 8);

        if (!results.length) {
            panel.innerHTML = '<div class="suggest-empty">没有找到相关影片</div>';
            panel.classList.add("open");
            return;
        }

        panel.innerHTML = results.map(function (movie) {
            return [
                '<a class="suggest-item" href="' + movie.url + '">',
                '    <img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, "&quot;") + '">',
                '    <span>',
                '        <strong>' + movie.title + '</strong>',
                '        <small>' + movie.year + ' · ' + movie.category + '</small>',
                '    </span>',
                '</a>'
            ].join("");
        }).join("");
        panel.classList.add("open");
    }

    function initSiteSearch() {
        selectAll("[data-site-search]").forEach(function (input) {
            const form = input.closest("form");
            const panel = form ? form.querySelector("[data-search-suggestions]") : null;
            if (!panel) {
                return;
            }

            input.addEventListener("input", function () {
                renderSuggestions(input, panel);
            });

            input.addEventListener("focus", function () {
                renderSuggestions(input, panel);
            });
        });

        document.addEventListener("click", function (event) {
            selectAll("[data-search-suggestions]").forEach(function (panel) {
                if (!panel.parentElement || !panel.parentElement.contains(event.target)) {
                    panel.classList.remove("open");
                }
            });
        });
    }

    function initSearchPage() {
        const page = document.querySelector("[data-search-page]");
        const grid = document.querySelector("[data-search-grid]");
        if (!page || !grid) {
            return;
        }

        const queryInput = page.querySelector("[data-filter-query]");
        const categorySelect = page.querySelector("[data-filter-category]");
        const yearSelect = page.querySelector("[data-filter-year]");
        const count = page.querySelector("[data-filter-count]");
        const cards = selectAll("[data-search-card]", grid);
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q") || "";

        if (queryInput && initialQuery) {
            queryInput.value = initialQuery;
        }

        function filterCards() {
            const query = normalize(queryInput ? queryInput.value : "");
            const category = normalize(categorySelect ? categorySelect.value : "");
            const year = normalize(yearSelect ? yearSelect.value : "");
            let visible = 0;

            cards.forEach(function (card) {
                const searchText = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-category"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-tags")
                ].join(" "));
                const matchQuery = !query || searchText.includes(query);
                const matchCategory = !category || normalize(card.getAttribute("data-category")) === category;
                const matchYear = !year || normalize(card.getAttribute("data-year")) === year;
                const shouldShow = matchQuery && matchCategory && matchYear;

                card.hidden = !shouldShow;
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible + " 部影片";
            }
        }

        [queryInput, categorySelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", filterCards);
                control.addEventListener("change", filterCards);
            }
        });

        filterCards();
    }

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsLoadingPromise) {
            return hlsLoadingPromise;
        }

        hlsLoadingPromise = new Promise(function (resolve, reject) {
            const script = document.createElement("script");
            script.src = hlsCdnUrl;
            script.async = true;
            script.onload = function () {
                if (window.Hls) {
                    resolve(window.Hls);
                } else {
                    reject(new Error("HLS library unavailable"));
                }
            };
            script.onerror = function () {
                reject(new Error("HLS library failed to load"));
            };
            document.head.appendChild(script);
        });

        return hlsLoadingPromise;
    }

    function initPlayers() {
        selectAll("[data-player]").forEach(function (player) {
            const video = player.querySelector("video");
            const overlay = player.querySelector(".player-overlay");
            const card = player.closest(".player-card");
            const status = card ? card.querySelector("[data-player-status]") : null;
            const source = player.getAttribute("data-src");
            let attached = false;
            let hlsInstance = null;

            if (!video || !source) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function hideOverlay() {
                if (overlay) {
                    overlay.classList.add("hidden");
                }
            }

            function attachNative() {
                video.src = source;
                attached = true;
                return Promise.resolve();
            }

            function attachHls(HlsConstructor) {
                if (!HlsConstructor || !HlsConstructor.isSupported()) {
                    return attachNative();
                }

                hlsInstance = new HlsConstructor({ enableWorker: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                attached = true;

                return new Promise(function (resolve) {
                    hlsInstance.on(HlsConstructor.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    window.setTimeout(resolve, 1600);
                });
            }

            function playVideo() {
                setStatus("正在加载播放源…");
                const attachPromise = attached
                    ? Promise.resolve()
                    : (video.canPlayType("application/vnd.apple.mpegurl") ? attachNative() : loadHlsLibrary().then(attachHls).catch(attachNative));

                attachPromise.then(function () {
                    return video.play();
                }).then(function () {
                    hideOverlay();
                    setStatus("正在播放");
                }).catch(function () {
                    setStatus("播放源加载中，请再次点击播放或更换浏览器重试");
                });
            }

            if (overlay) {
                overlay.addEventListener("click", playVideo);
            }

            player.addEventListener("click", function (event) {
                if (event.target === video || event.target === player) {
                    playVideo();
                }
            });

            video.addEventListener("play", hideOverlay);
            video.addEventListener("playing", function () {
                setStatus("正在播放");
            });
            video.addEventListener("pause", function () {
                setStatus("已暂停");
            });
            video.addEventListener("error", function () {
                setStatus("当前播放源暂时无法加载");
            });

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initHero();
        initHorizontalRows();
        initSiteSearch();
        initSearchPage();
        initPlayers();
    });
})();
