document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("site-header");
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    const mobileMenuClose = document.querySelector(".mobile-menu-close");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isMenuOpen = false;
    let lastScrollY = window.scrollY;
    let ticking = false;

    const normalizeHref = (href) => {
        if (!href) {
            return "";
        }

        return href.replace(/^\.?\//, "").split("#")[0].split("?")[0].toLowerCase();
    };

    const currentPage = (() => {
        const fileName = window.location.pathname.split("/").pop();
        return (fileName || "coceli.html").toLowerCase();
    })();

    const activePageMap = {
        "coceli-actualites.html": "coceli-formations.html",
        "coceli-partenaires.html": "coceli-contact.html",
        "coceli-inscription.html": "coceli-formations.html"
    };

    const navPage = activePageMap[currentPage] || currentPage;

    const isActiveLink = (href) => {
        if (!href || href === "#") {
            return false;
        }

        if (navPage === "coceli.html") {
            return href === "coceli.html" || href === "#accueil";
        }

        return normalizeHref(href) === navPage;
    };

    const setActiveLinks = () => {
        if (!header) {
            return;
        }

        header.querySelectorAll("nav a[href]").forEach((link) => {
            const active = isActiveLink(link.getAttribute("href"));
            const isMobileLink = Boolean(link.closest("#mobile-menu"));

            link.classList.toggle("nav-link-active", active && !isMobileLink);
            link.classList.toggle("mobile-nav-link-active", active && isMobileLink);

            if (active) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    };

    let progressBar = null;

    if (header) {
        progressBar = document.createElement("div");
        progressBar.className = "scroll-progress";
        document.body.appendChild(progressBar);
    }

    const setHeaderVisible = (visible) => {
        if (!header) {
            return;
        }

        header.classList.toggle("site-header-hidden", !visible);
    };

    const updateHeaderState = () => {
        const currentY = window.scrollY;
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? Math.min(currentY / scrollableHeight, 1) : 0;

        if (progressBar) {
            progressBar.style.transform = `scaleX(${progress})`;
        }

        if (header) {
            if (currentY > 40) {
                header.classList.add("shadow-lg");
                header.classList.remove("bg-white/90");
                header.classList.add("bg-white/95");
            } else {
                header.classList.remove("shadow-lg");
                header.classList.remove("bg-white/95");
                header.classList.add("bg-white/90");
            }

            if (isMenuOpen || currentY <= 20) {
                setHeaderVisible(true);
            } else if (currentY > lastScrollY && currentY > 120) {
                setHeaderVisible(false);
            } else if (currentY < lastScrollY) {
                setHeaderVisible(true);
            }
        }

        lastScrollY = Math.max(currentY, 0);
        ticking = false;
    };

    const requestHeaderUpdate = () => {
        if (!ticking) {
            window.requestAnimationFrame(updateHeaderState);
            ticking = true;
        }
    };

    const setupScrollAnimations = () => {
        if (prefersReducedMotion.matches || !window.gsap || !window.ScrollTrigger) {
            return;
        }

        const { gsap, ScrollTrigger } = window;
        gsap.registerPlugin(ScrollTrigger);

        const uniqueVisible = (elements) =>
            Array.from(new Set(elements)).filter((element) => {
                if (!element) {
                    return false;
                }

                const style = window.getComputedStyle(element);
                return style.display !== "none" && style.visibility !== "hidden";
            });

        const revealGroup = (targets, options = {}) => {
            if (!targets.length) {
                return;
            }

            gsap.from(targets, {
                opacity: 0,
                y: options.y ?? 32,
                scale: options.scale ?? 1,
                rotate: options.rotate ?? 0,
                duration: options.duration ?? 0.8,
                stagger: options.stagger ?? 0.08,
                ease: options.ease ?? "power3.out",
                clearProps: "transform,opacity",
                scrollTrigger: {
                    trigger: options.trigger ?? targets[0].closest("section, footer") ?? targets[0],
                    start: options.start ?? "top 82%",
                    once: true
                }
            });
        };

        const heroSection = document.querySelector("main section:first-of-type");
        if (heroSection) {
            const heroPrimary = uniqueVisible([
                ...heroSection.querySelectorAll(".soft-badge, h1, h2, p"),
                ...heroSection.querySelectorAll(".btn-primary-shared, .btn-outline-shared")
            ]);
            const heroSecondary = uniqueVisible([
                ...heroSection.querySelectorAll(".metric-box, img, .card-surface, .page-card"),
                ...heroSection.querySelectorAll(".soft-badge i, .btn-primary-shared i, .btn-outline-shared i")
            ]);

            if (heroPrimary.length) {
                gsap.from(heroPrimary, {
                    opacity: 0,
                    y: 42,
                    duration: 0.95,
                    stagger: 0.1,
                    ease: "power3.out",
                    clearProps: "transform,opacity",
                    delay: 0.2
                });
            }

            if (heroSecondary.length) {
                gsap.from(heroSecondary, {
                    opacity: 0,
                    y: 24,
                    scale: 0.96,
                    duration: 0.85,
                    stagger: 0.08,
                    ease: "power3.out",
                    clearProps: "transform,opacity",
                    delay: 0.35
                });
            }
        }

        gsap.utils.toArray("main section, footer").forEach((section, index) => {
            if (index === 0 && section === heroSection) {
                return;
            }

            const textTargets = uniqueVisible([
                ...section.querySelectorAll(".soft-badge, h2, h3, h4, p, li, label, blockquote"),
                ...section.querySelectorAll(".contact-chip span, .timeline-item")
            ]);
            const cardTargets = uniqueVisible([
                ...section.querySelectorAll("article, .page-card, .card-surface, .metric-box, .contact-chip, form, img"),
                ...section.querySelectorAll("input, select, textarea")
            ]);
            const actionTargets = uniqueVisible([
                ...section.querySelectorAll(".btn-primary-shared, .btn-outline-shared, button, a.inline-flex"),
                ...section.querySelectorAll(".btn-primary-shared i, .btn-outline-shared i, button i, a.inline-flex i, .soft-badge i, article i, .contact-chip i")
            ]);

            revealGroup(textTargets, { trigger: section, y: 28, stagger: 0.05 });
            revealGroup(cardTargets, { trigger: section, y: 42, scale: 0.97, stagger: 0.09, start: "top 80%" });
            revealGroup(actionTargets, { trigger: section, y: 20, scale: 0.94, rotate: -3, stagger: 0.06, start: "top 78%" });
        });

        window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
    };

    const setupHeroTitleCycle = () => {
        const title = document.getElementById("hero-rotating-title");
        if (!title) {
            return;
        }

        const phrases = (() => {
            try {
                return JSON.parse(title.dataset.phrases || "[]");
            } catch {
                return [];
            }
        })();

        const colors = (() => {
            try {
                return JSON.parse(title.dataset.colors || "[]");
            } catch {
                return [];
            }
        })();

        if (!phrases.length) {
            return;
        }

        const renderPhrase = (phrase, colorClass) => {
            title.innerHTML = "";

            const line = document.createElement("span");
            line.className = `hero-rotating-line ${colorClass || ""}`.trim();

            const letters = [];
            phrase.split(" ").forEach((word, wordIndex, wordList) => {
                const wordWrap = document.createElement("span");
                wordWrap.className = "hero-rotating-word";

                Array.from(word).forEach((character) => {
                    const letter = document.createElement("span");
                    letter.className = "hero-rotating-letter";
                    letter.textContent = character;
                    wordWrap.appendChild(letter);
                    letters.push(letter);
                });

                line.appendChild(wordWrap);
            });

            title.appendChild(line);
            return letters;
        };

        if (prefersReducedMotion.matches || !window.gsap) {
            renderPhrase(phrases[0], colors[0]);
            title.querySelectorAll(".hero-rotating-letter").forEach((letter) => {
                letter.style.opacity = "1";
            });
            return;
        }

        const { gsap } = window;

        const runPhrase = (index) => {
            const letters = renderPhrase(phrases[index], colors[index % Math.max(colors.length, 1)]);
            const reversedLetters = [...letters].reverse();

            gsap.timeline({
                onComplete: () => runPhrase((index + 1) % phrases.length)
            })
                .to(letters, {
                    opacity: 1,
                    y: 0,
                    duration: 0.42,
                    stagger: 0.045,
                    ease: "power1.inOut"
                })
                .to({}, {
                    duration: 7
                })
                .to(reversedLetters, {
                    opacity: 0,
                    y: -18,
                    duration: 0.36,
                    stagger: 0.04,
                    ease: "power1.inOut"
                });
        };

        runPhrase(0);
    };

    const setupCounters = () => {
        const counters = document.querySelectorAll(".stats-counter[data-target]");
        if (!counters.length || prefersReducedMotion.matches || !window.gsap || !window.ScrollTrigger) {
            return;
        }

        const { gsap } = window;

        counters.forEach((counter) => {
            const target = Number(counter.dataset.target);
            if (Number.isNaN(target)) {
                return;
            }

            counter.textContent = "0";

            const state = { value: 0 };
            const trigger = counter.closest("section, article, .card-surface") || counter;

            gsap.to(state, {
                value: target,
                duration: 1.3,
                ease: "power2.out",
                snap: { value: 1 },
                scrollTrigger: {
                    trigger,
                    start: "top 82%",
                    once: true
                },
                onUpdate: () => {
                    counter.textContent = `${state.value.toFixed(0)}`;
                }
            });
        });
    };

    const setupFormationFilters = () => {
        const searchInput = document.getElementById("formation-search");
        const typeFilter = document.getElementById("formation-type-filter");
        const durationFilter = document.getElementById("formation-duration-filter");
        const resetButton = document.getElementById("formation-reset");
        const cards = Array.from(document.querySelectorAll(".formation-card"));
        const counter = document.getElementById("formation-results-count");
        const emptyState = document.getElementById("formations-empty-state");
        const grid = document.getElementById("formations-grid");

        if (!searchInput || !typeFilter || !durationFilter || !cards.length || !counter || !emptyState || !grid) {
            return;
        }

        const updateResults = () => {
            const searchValue = searchInput.value.trim().toLowerCase();
            const typeValue = typeFilter.value;
            const durationValue = durationFilter.value;

            let visibleCount = 0;

            cards.forEach((card) => {
                const searchMatch = !searchValue || (card.dataset.search || "").toLowerCase().includes(searchValue);
                const typeMatch = typeValue === "all" || (card.dataset.type || "") === typeValue;
                const durationMatch = durationValue === "all" || (card.dataset.duration || "").toLowerCase() === durationValue.toLowerCase();
                const visible = searchMatch && typeMatch && durationMatch;

                card.classList.toggle("hidden", !visible);

                if (visible) {
                    visibleCount += 1;
                }
            });

            counter.textContent = `${visibleCount} formation${visibleCount > 1 ? "s" : ""} affichee${visibleCount > 1 ? "s" : ""}`;
            emptyState.classList.toggle("hidden", visibleCount !== 0);
            grid.classList.toggle("hidden", visibleCount === 0);
        };

        searchInput.addEventListener("input", updateResults);
        typeFilter.addEventListener("change", updateResults);
        durationFilter.addEventListener("change", updateResults);

        if (resetButton) {
            resetButton.addEventListener("click", () => {
                searchInput.value = "";
                typeFilter.value = "all";
                durationFilter.value = "all";
                updateResults();
            });
        }

        updateResults();
    };

    const setupRegistrationPrefill = () => {
        const programField = document.getElementById("registration-program");
        const summaryTitle = document.getElementById("registration-summary-title");
        const summaryType = document.getElementById("registration-summary-type");
        const summaryDuration = document.getElementById("registration-summary-duration");
        const summaryPrice = document.getElementById("registration-summary-price");

        if (!programField || !summaryTitle || !summaryType || !summaryDuration || !summaryPrice) {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const formation = params.get("formation") || "";
        const type = params.get("type") || "";
        const duree = params.get("duree") || "";
        const prix = params.get("prix") || "";
        const programCatalog = {
            "Coupe couture": { type: "principale", duree: "12 mois", prix: "1400 HTG" },
            "Haute couture": { type: "principale", duree: "36 mois", prix: "1400 HTG" },
            "Electricite du batiment": { type: "principale", duree: "6 mois", prix: "1000 HTG" },
            "Carrelage": { type: "principale", duree: "6 mois", prix: "1000 HTG" },
            "Plomberie sanitaire": { type: "principale", duree: "6 mois", prix: "1500 HTG" },
            "Installation panneaux solaires": { type: "principale", duree: "Session pratique", prix: "1200 HTG" },
            "Auto-école": { type: "principale", duree: "3 mois", prix: "3000 HTG" },
            "Informatique bureautique": { type: "speciale", duree: "3 mois", prix: "2500 HTG" },
            "Beat maker": { type: "speciale", duree: "3 mois", prix: "2500 HTG" },
            "Depannage ordinateurs et telephones": { type: "speciale", duree: "3 mois", prix: "2500 HTG" }
        };

        if (formation) {
            const existingOption = Array.from(programField.options).find((option) => option.value === formation || option.text === formation);

            if (!existingOption) {
                const option = document.createElement("option");
                option.value = formation;
                option.textContent = formation;
                programField.appendChild(option);
            }

            programField.value = formation;
        }

        const renderSummary = () => {
            const selectedFormation = programField.value || "Aucune formation selectionnee";
            const selectedData = programCatalog[programField.value] || {};
            const useQueryValues = Boolean(formation) && programField.value === formation;
            summaryTitle.textContent = selectedFormation;
            summaryType.textContent = useQueryValues ? (type || selectedData.type || "A definir") : (selectedData.type || "A definir");
            summaryDuration.textContent = useQueryValues ? (duree || selectedData.duree || "A definir") : (selectedData.duree || "A definir");
            summaryPrice.textContent = useQueryValues ? (prix || selectedData.prix || "A definir") : (selectedData.prix || "A definir");
        };

        programField.addEventListener("change", renderSummary);
        renderSummary();
    };

    if (mobileMenuBtn && mobileMenu) {
        const openMenu = () => {
            isMenuOpen = true;
            mobileMenu.classList.remove("translate-x-full");
            mobileMenuBtn.innerHTML = '<i class="fas fa-times text-xl"></i>';
            document.body.style.overflow = "hidden";
            setHeaderVisible(true);
        };

        const closeMenu = () => {
            isMenuOpen = false;
            mobileMenu.classList.add("translate-x-full");
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars text-xl"></i>';
            document.body.style.overflow = "";
            requestHeaderUpdate();
        };

        mobileMenuBtn.addEventListener("click", () => {
            if (isMenuOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        if (mobileMenuClose) {
            mobileMenuClose.addEventListener("click", closeMenu);
        }

        mobileMenu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", closeMenu);
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth >= 1024 && isMenuOpen) {
                closeMenu();
            }
        });
    }

    setActiveLinks();
    updateHeaderState();
    window.addEventListener("scroll", requestHeaderUpdate, { passive: true });
    setupFormationFilters();
    setupRegistrationPrefill();
    setupHeroTitleCycle();
    setupScrollAnimations();
    setupCounters();
});
