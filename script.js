/* =========================================================
   PREMPEHTECH PORTFOLIO
   Main JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* -----------------------------------------------------
       1. Smooth scrolling for internal navigation links
       ----------------------------------------------------- */

    const internalLinks = document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach(link => {
        link.addEventListener("click", event => {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (target) {
                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });


    /* -----------------------------------------------------
       2. Header scroll effect
       ----------------------------------------------------- */

    const header = document.querySelector("header");

    function updateHeader() {
        if (!header) return;

        if (window.scrollY > 40) {
            header.classList.add("header-scrolled");
        } else {
            header.classList.remove("header-scrolled");
        }
    }

    updateHeader();

    window.addEventListener("scroll", updateHeader, {
        passive: true
    });


    /* -----------------------------------------------------
       3. Active navigation highlighting
       ----------------------------------------------------- */

    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    function updateActiveNavigation() {

        if (!sections.length || !navLinks.length) {
            return;
        }

        let currentSection = "";

        sections.forEach(section => {

            const sectionTop = section.offsetTop - 180;
            const sectionHeight = section.offsetHeight;

            if (
                window.scrollY >= sectionTop &&
                window.scrollY < sectionTop + sectionHeight
            ) {
                currentSection = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {

            link.classList.remove("active");

            if (
                currentSection &&
                link.getAttribute("href") === `#${currentSection}`
            ) {
                link.classList.add("active");
            }
        });
    }

    updateActiveNavigation();

    window.addEventListener("scroll", updateActiveNavigation, {
        passive: true
    });


    /* -----------------------------------------------------
       4. Scroll reveal animations
       ----------------------------------------------------- */

    const revealElements = document.querySelectorAll(
        ".project-card, .evidence-card, .skill-card, .section-header"
    );

    if ("IntersectionObserver" in window) {

        const revealObserver = new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        revealObserver.unobserve(entry.target);
                    }

                });

            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px"
            }
        );

        revealElements.forEach(element => {

            element.classList.add("reveal");

            revealObserver.observe(element);

        });

    } else {

        revealElements.forEach(element => {
            element.classList.add("visible");
        });

    }


    /* -----------------------------------------------------
       5. External links
       ----------------------------------------------------- */

    const externalLinks = document.querySelectorAll(
        'a[href^="http"]'
    );

    externalLinks.forEach(link => {

        const url = link.getAttribute("href");

        try {

            const linkURL = new URL(url);

            if (linkURL.hostname !== window.location.hostname) {

                link.setAttribute("target", "_blank");
                link.setAttribute("rel", "noopener noreferrer");

            }

        } catch (error) {
            // Ignore invalid URLs
        }

    });


    /* -----------------------------------------------------
       6. Back-to-top button
       ----------------------------------------------------- */

    const backToTop = document.createElement("button");

    backToTop.className = "back-to-top";

    backToTop.setAttribute(
        "aria-label",
        "Back to top"
    );

    backToTop.innerHTML = "↑";

    document.body.appendChild(backToTop);


    function updateBackToTop() {

        if (window.scrollY > 600) {
            backToTop.classList.add("show");
        } else {
            backToTop.classList.remove("show");
        }

    }

    updateBackToTop();

    window.addEventListener("scroll", updateBackToTop, {
        passive: true
    });


    backToTop.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });


    /* -----------------------------------------------------
       7. Project card hover accessibility
       ----------------------------------------------------- */

    const projectCards = document.querySelectorAll(".project-card");

    projectCards.forEach(card => {

        card.addEventListener("mouseenter", () => {
            card.classList.add("card-active");
        });

        card.addEventListener("mouseleave", () => {
            card.classList.remove("card-active");
        });

    });


    /* -----------------------------------------------------
       8. Portfolio loaded
       ----------------------------------------------------- */

    console.log(
        "PrempehTech portfolio loaded successfully."
    );

});
