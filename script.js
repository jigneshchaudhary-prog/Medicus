(function () {
    "use strict";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- UNIVERSAL 3D MOUSE TRACKING ENGINE (SUBDUED & PREMIUM) ---------- */
    // Selects only the specific cards, leaving the main body completely alone
    const cards3D = document.querySelectorAll('.card-3d');

    if (!reduceMotion && window.innerWidth > 980) {
        
        cards3D.forEach(card => {
            let rafId; 

            card.addEventListener('mousemove', (e) => {
                cancelAnimationFrame(rafId);
                
                rafId = requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    // ULTRA SUBDUED INTENSITY: Exactly like high-end agency sites (3 degrees max)
                    const rotateX = ((y - centerY) / centerY) * -3; 
                    const rotateY = ((x - centerX) / centerX) * 3;

                    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
                    
                    // Very subtle pop for inner elements
                    const inners = card.querySelectorAll('.inner-3d');
                    inners.forEach(inner => {
                        inner.style.transform = `translateZ(15px)`;
                    });
                });
            });

            card.addEventListener('mouseleave', () => {
                cancelAnimationFrame(rafId);
                
                // Snap perfectly back to flat
                card.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                
                const inners = card.querySelectorAll('.inner-3d');
                inners.forEach(inner => {
                    if(inner.classList.contains('hero__badge')) {
                        inner.style.transform = `translateZ(15px)`; 
                    } else {
                        inner.style.transform = `translateZ(0px)`;
                    }
                });
            });
        });

        /* Subtle Ambient Parallax Background */
        document.addEventListener('mousemove', (e) => {
            const bg = document.getElementById('ambient-bg');
            if(bg) {
                const x = (e.clientX / window.innerWidth - 0.5) * 15;
                const y = (e.clientY / window.innerHeight - 0.5) * 15;
                bg.style.transform = `translate(${x}px, ${y}px)`;
            }
        });
    }

    /* ---------- CINEMATIC SPATIAL Z-AXIS SCROLL REVEALS ---------- */
    // Elements zoom out of the deep Z-axis depths as you scroll down
    const revealElements = document.querySelectorAll('.scroll-reveal-3d');
    
    if ("IntersectionObserver" in window && !reduceMotion) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-revealed");
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -100px 0px" });

        revealElements.forEach(el => {
            revealObserver.observe(el);
        });
    }

    /* ---------- TAB LOGIC ---------- */
    const setupTabs = (containerId, tabClass, panelClass, panelPrefix = "") => {
        const container = document.getElementById(containerId);
        if (!container) return;
        const tabs = container.querySelectorAll(tabClass);
        tabs.forEach(btn => {
            btn.addEventListener("click", () => {
                tabs.forEach(b => b.classList.remove("is-active"));
                document.querySelectorAll(panelClass).forEach(p => p.classList.remove("is-active"));
                
                btn.classList.add("is-active");
                const targetId = panelPrefix ? panelPrefix + btn.getAttribute("data-role") : btn.getAttribute("data-panel");
                const panel = document.getElementById(targetId);
                if (panel) panel.classList.add("is-active");
            });
        });
    };
    
    setupTabs("frameTabs", ".frame__tab", ".frame__panel");
    setupTabs("roleTabs", ".role-tab", ".role-panel", "role-");

})();