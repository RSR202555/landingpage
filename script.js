// ========================================
// MENU MOBILE
// ========================================
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.getElementById('navMenu');

mobileMenuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileMenuToggle.classList.toggle('active');
});

// Fechar menu ao clicar em um link
navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
    });
});

// ========================================
// CARROSSEL ANTES/DEPOIS
// ========================================
const carouselTrack = document.getElementById('carouselTrack');
const carouselPrev = document.getElementById('carouselPrev');
const carouselNext = document.getElementById('carouselNext');
const carouselDots = document.getElementById('carouselDots');
const slides = document.querySelectorAll('.carousel-slide');

let currentSlide = 0;
const totalSlides = slides.length;

// Criar dots
for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('div');
    dot.classList.add('carousel-dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    carouselDots.appendChild(dot);
}

const dots = document.querySelectorAll('.carousel-dot');

function updateCarousel() {
    const offset = -currentSlide * 100;
    carouselTrack.style.transform = `translateX(${offset}%)`;

    // Atualizar dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
}

carouselNext.addEventListener('click', nextSlide);
carouselPrev.addEventListener('click', prevSlide);

// Auto-play (opcional - descomente para ativar)
// setInterval(nextSlide, 5000);

// Suporte a swipe no mobile
let touchStartX = 0;
let touchEndX = 0;

carouselTrack.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

carouselTrack.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
        nextSlide();
    }
    if (touchEndX > touchStartX + 50) {
        prevSlide();
    }
}

// ========================================
// DEPOIMENTOS AUTO-SCROLL (OPCIONAL)
// ========================================
const testimonialsGrid = document.getElementById('testimonialsGrid');
let testimonialIndex = 0;

// Função para rotacionar depoimentos (descomente para ativar)
/*
function rotateTestimonials() {
    const cards = testimonialsGrid.querySelectorAll('.testimonial-card');
    cards.forEach((card, index) => {
        card.style.opacity = index === testimonialIndex ? '1' : '0.5';
        card.style.transform = index === testimonialIndex ? 'scale(1.05)' : 'scale(1)';
    });
    testimonialIndex = (testimonialIndex + 1) % cards.length;
}

setInterval(rotateTestimonials, 4000);
*/

// ========================================
// FAQ ACCORDION
// ========================================
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Fechar todos os outros itens
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });

        // Toggle do item clicado
        item.classList.toggle('active');
    });
});

// ========================================
// SCROLL ANIMATIONS
// ========================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observar elementos com animação de fade-in
document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Observar cards de passos
document.querySelectorAll('.step-card').forEach(el => {
    observer.observe(el);
});

// Adicionar classe fade-in aos elementos que devem animar
window.addEventListener('DOMContentLoaded', () => {
    // Seção Antes/Depois
    document.querySelectorAll('.before-after-card').forEach(card => {
        card.classList.add('fade-in');
        observer.observe(card);
    });

    // Depoimentos
    document.querySelectorAll('.testimonial-card').forEach(card => {
        card.classList.add('fade-in');
        observer.observe(card);
    });

    // Cards de planos
    document.querySelectorAll('.pricing-card').forEach(card => {
        card.classList.add('fade-in');
        observer.observe(card);
    });

    // FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.add('fade-in');
        observer.observe(item);
    });
});

// ========================================
// SMOOTH SCROLL PARA LINKS INTERNOS
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ========================================
// HEADER SCROLL EFFECT
// ========================================
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// ========================================
// ANIMAÇÃO DE NÚMEROS (CONTADOR)
// ========================================
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value + (element.dataset.suffix || '');
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Animar estatísticas quando visíveis
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const text = stat.textContent;
                const number = parseInt(text.replace(/\D/g, ''));
                const suffix = text.replace(/[0-9]/g, '');
                stat.dataset.suffix = suffix;
                animateValue(stat, 0, number, 2000);
            });
            entry.target.dataset.animated = 'true';
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// ========================================
// BOTÕES DE PLANOS - REDIRECIONAR PARA CHECKOUT INTERMEDIÁRIO
// ========================================
document.querySelectorAll('.plan-button').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();

        const planId = button.dataset.plan;

        if (!planId) {
            console.error('Botão de plano sem data-plan configurado');
            return;
        }

        window.location.href = `plano-checkout.html?plan=${encodeURIComponent(planId)}`;
    });
});

// ========================================
// PARALLAX EFFECT (OPCIONAL)
// ========================================
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero-background');

    if (heroBackground) {
        heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// ========================================
// LOADING LAZY DE IMAGENS
// ========================================
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    // Fallback para navegadores que não suportam lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// ========================================
// CONSOLE LOG DE BOAS-VINDAS
// ========================================
console.log('%c🚀 Landing Page Filipe Aquino', 'font-size: 20px; font-weight: bold; color: #0ea5e9;');
console.log('%cDesenvolvido com ❤️ para transformar resultados', 'font-size: 12px; color: #94a3b8;');

// ========================================
// UTILITÁRIOS
// ========================================

// Função para detectar se é mobile
function isMobile() {
    return window.innerWidth <= 768;
}

// Função para debounce (otimização de performance)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Otimizar resize events
const handleResize = debounce(() => {
    // Adicionar lógica de resize aqui se necessário
    console.log('Window resized');
}, 250);

window.addEventListener('resize', handleResize);

// ========================================
// INICIALIZAÇÃO
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Landing Page carregada com sucesso!');

    // Adicionar classe ao body quando tudo estiver carregado
    document.body.classList.add('loaded');
});
