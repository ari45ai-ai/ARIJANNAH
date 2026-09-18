// LUMINA GALLERY - INTERACTIVE ANIMATION & LIGHTBOX ENGINE

document.addEventListener('DOMContentLoaded', () => {

    // 1. DYNAMIC CANVAS NEON PARTICLES BACKGROUND
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');

    let particles = [];
    const particleCount = 40;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.radius = Math.random() * 3 + 1;
            this.color = ['#8b5cf6', '#ec4899', '#06b6d4'][Math.floor(Math.random() * 3)];
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.alpha = Math.random() * 0.5 + 0.2;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.restore();
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // 2. DYNAMIC CUSTOM CURSOR
    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 300, fill: "forwards" });
    });

    const interactiveElements = document.querySelectorAll('button, input, .gallery-item, a');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursorOutline.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => cursorOutline.classList.remove('cursor-hover'));
    });

    // 3. 3D TILT EFFECT ON GALLERY CARDS
    const cards = document.querySelectorAll('.gallery-item');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (centerY - y) / 12;
            const rotateY = (x - centerX) / 12;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });

    // 4. CATEGORY FILTERING & SEARCH
    const filterBtns = document.querySelectorAll('.filter-nav .filter-btn');
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');
    const noResults = document.getElementById('no-results');
    const photoCountBadge = document.getElementById('photo-count');

    let currentFilter = 'all';

    function filterGallery() {
        const query = searchInput.value.toLowerCase().trim();
        let visibleCount = 0;

        cards.forEach(card => {
            const title = card.getAttribute('data-title').toLowerCase();
            const location = card.getAttribute('data-location').toLowerCase();

            const matchesCategory = (currentFilter === 'all' || card.classList.contains(currentFilter));
            const matchesSearch = title.includes(query) || location.includes(query);

            if (matchesCategory && matchesSearch) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        photoCountBadge.innerHTML = `<i data-lucide="image"></i> ${visibleCount} Foto`;
        lucide.createIcons();

        if (visibleCount === 0) {
            noResults.classList.remove('hidden');
        } else {
            noResults.classList.add('hidden');
        }
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            filterGallery();
        });
    });

    searchInput.addEventListener('input', () => {
        if (searchInput.value.length > 0) {
            clearSearchBtn.classList.add('active');
        } else {
            clearSearchBtn.classList.remove('active');
        }
        filterGallery();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.classList.remove('active');
        filterGallery();
    });

    // 5. LIGHTBOX MODAL NAVIGATION
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxCategoryBadge = document.getElementById('lightbox-category-badge');
    const lightboxDate = document.getElementById('lightbox-date');
    const lightboxLocation = document.getElementById('lightbox-location');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    let currentIndex = 0;
    let visibleCardsList = [];

    function updateVisibleCards() {
        visibleCardsList = Array.from(cards).filter(c => c.style.display !== 'none');
    }

    function openLightbox(index) {
        updateVisibleCards();
        if (visibleCardsList.length === 0) return;

        currentIndex = index;
        const currentCard = visibleCardsList[currentIndex];

        const imgSrc = currentCard.querySelector('img').getAttribute('src');
        const title = currentCard.getAttribute('data-title');
        const category = currentCard.getAttribute('data-category');
        const date = currentCard.getAttribute('data-date');
        const location = currentCard.getAttribute('data-location');

        lightboxImg.src = imgSrc;
        lightboxTitle.innerText = title;
        lightboxCategoryBadge.innerHTML = `<i data-lucide="tag"></i> ${category}`;
        lightboxDate.innerText = date;
        lightboxLocation.innerText = location;

        lucide.createIcons();
        lightbox.classList.add('active');
    }

    cards.forEach((card) => {
        card.addEventListener('click', () => {
            updateVisibleCards();
            const index = visibleCardsList.indexOf(card);
            openLightbox(index !== -1 ? index : 0);
        });
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
    }

    lightboxClose.addEventListener('click', closeLightbox);
    document.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);

    lightboxPrev.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + visibleCardsList.length) % visibleCardsList.length;
        openLightbox(currentIndex);
    });

    lightboxNext.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % visibleCardsList.length;
        openLightbox(currentIndex);
    });

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') lightboxPrev.click();
        if (e.key === 'ArrowRight') lightboxNext.click();
    });

    // Toast Actions
    document.getElementById('download-sim-btn').addEventListener('click', () => {
        alert("Simulasi Download: Memulai unduhan foto kualitas tinggi...");
    });

    document.getElementById('share-sim-btn').addEventListener('click', () => {
        alert("Simulasi Share: Tautan foto telah disalin ke clipboard!");
    });
});