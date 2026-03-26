/* =====================================================
   SISTEMA DE PARTÍCULAS DE CHAKRA CON CANVAS
   ===================================================== */

class ChakraParticle {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 1;
        this.speedY = (Math.random() - 0.5) * 1;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.color = this.getRandomChakraColor();
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    }

    getRandomChakraColor() {
        const colors = [
            'rgba(255, 107, 53, ',  // Naranja
            'rgba(255, 70, 87, ',   // Rojo
            'rgba(255, 152, 0, ',   // Naranja dorado
            'rgba(231, 76, 60, '    // Rojo-naranja
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        // Bordes envolventes
        if (this.x < 0) this.x = this.canvas.width;
        if (this.x > this.canvas.width) this.x = 0;
        if (this.y < 0) this.y = this.canvas.height;
        if (this.y > this.canvas.height) this.y = 0;

        // Oscilación de opacidad
        this.opacity += (Math.random() - 0.5) * 0.02;
        this.opacity = Math.max(0.2, Math.min(0.8, this.opacity));
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Dibujar partícula como pequeña espiral
        ctx.fillStyle = this.color + this.opacity + ')';
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Pequeño brillo
        ctx.fillStyle = 'rgba(255, 200, 100, ' + (this.opacity * 0.5) + ')';
        ctx.beginPath();
        ctx.arc(this.size * 0.3, -this.size * 0.3, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

class ChakraBackground {
    constructor() {
        this.canvas = document.getElementById('chakraCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.Init();
    }

    Init() {
        // Ajustar tamaño del canvas
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Crear partículas
        for (let i = 0; i < 50; i++) {
            this.particles.push(new ChakraParticle(this.canvas));
        }

        // Iniciar animación
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    animate() {
        // Limpiar canvas con efecto de rastro
        this.ctx.fillStyle = 'rgba(10, 14, 39, 0.15)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Dibujar gradiente de fondo sutil
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2,
            this.canvas.height / 2,
            0,
            this.canvas.width / 2,
            this.canvas.height / 2,
            this.canvas.width
        );
        gradient.addColorStop(0, 'rgba(255, 107, 53, 0.05)');
        gradient.addColorStop(1, 'rgba(10, 14, 39, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Actualizar y dibujar partículas
        this.particles.forEach(particle => {
            particle.update();
            particle.draw(this.ctx);
        });

        // Dibujar conexiones entre partículas cercanas (líneas de chakra)
        this.drawConnections();

        requestAnimationFrame(() => this.animate());
    }

    drawConnections() {
        const maxDistance = 150;

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const opacity = 0.2 * (1 - distance / maxDistance);
                    this.ctx.strokeStyle = 'rgba(255, 107, 53, ' + opacity + ')';
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
}

/* =====================================================
   SISTEMA DE NAVEGACIÓN Y CONTROL DE SECCIONES
   ===================================================== */

class MessageExperience {
    constructor() {
        this.currentSection = 0;
        this.totalSections = 10;
        this.isAnimating = false;

        // Referencias a elementos del DOM
        this.nextBtn = document.getElementById('nextBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.scrollContainer = document.querySelector('.scroll-container');
        this.finalEffect = document.querySelector('.final-effect');

        // Event listeners
        this.setupEventListeners();

        // Mostrar la primera sección
        this.showSection(0);
    }

    setupEventListeners() {
        // Botones
        this.nextBtn.addEventListener('click', () => this.nextSection());
        this.prevBtn.addEventListener('click', () => this.previousSection());

        // Teclado (Enter o Espacio para siguiente)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.nextSection();
            }
            if (e.key === 'ArrowRight') {
                this.nextSection();
            }
            if (e.key === 'ArrowLeft') {
                this.previousSection();
            }
        });

        // Click en el scroll container para continuar
        this.scrollContainer.addEventListener('click', (e) => {
            // Solo si no clickeó en un botón
            if (!e.target.closest('.control-btn')) {
                this.nextSection();
            }
        });
    }

    showSection(index) {
        if (this.isAnimating) return;
        if (index < 0 || index >= this.totalSections) return;

        this.isAnimating = true;

        // Desactivar sección actual
        const currentActive = document.querySelector('.message-section.active');
        if (currentActive) {
            currentActive.classList.remove('active');
        }

        // SetTimeout para permitir que se completen las transiciones CSS
        setTimeout(() => {
            // Activar nueva sección
            const newSection = document.querySelector(`[data-section="${index}"]`);
            if (newSection) {
                newSection.classList.add('active');
            }

            this.currentSection = index;
            this.updateButtons();
            this.triggerSectionEffects(index);
            this.scrollToTop();

            this.isAnimating = false;
        }, 100);
    }

    nextSection() {
        if (this.currentSection < this.totalSections - 1) {
            this.showSection(this.currentSection + 1);
        } else {
            // Mostrar efecto final
            this.showFinalEffect();
        }
    }

    previousSection() {
        if (this.currentSection > 0) {
            this.showSection(this.currentSection - 1);
        }
    }

    updateButtons() {
        // Actualizar estado del botón Anterior
        this.prevBtn.disabled = this.currentSection === 0;

        // Actualizar estado del botón Siguiente
        const isLastSection = this.currentSection === this.totalSections - 1;
        this.nextBtn.disabled = false;
        this.nextBtn.textContent = isLastSection ? '✨ Finalizar ✨' : 'Siguiente →';
    }

    scrollToTop() {
        this.scrollContainer.scrollTop = 0;
    }

    triggerSectionEffects(index) {
        // Efectos especiales para secciones importantes
        const section = document.querySelector(`[data-section="${index}"]`);

        // Sección 5 (enfática)
        if (index === 5) {
            section.querySelector('.message-text')?.classList.add('glow-effect');
        }

        // Sección final (declaración de amor)
        if (index === this.totalSections - 1) {
            this.addFinalSectionEffects();
        }
    }

    addFinalSectionEffects() {
        const finalSection = document.querySelector(`[data-section="${this.totalSections - 1}"]`);
        if (finalSection) {
            // Agregar clase para efectos especiales
            finalSection.classList.add('final-message-active');

            // Crear partículas flotantes de corazón alrededor del mensaje
            this.createHeartParticles();
        }
    }

    createHeartParticles() {
        const scrollContainer = this.scrollContainer;
        const containerRect = scrollContainer.getBoundingClientRect();

        for (let i = 0; i < 10; i++) {
            const heart = document.createElement('div');
            heart.style.position = 'fixed';
            heart.style.left = (containerRect.left + containerRect.width / 2 + (Math.random() - 0.5) * 100) + 'px';
            heart.style.top = (containerRect.top + containerRect.height / 2) + 'px';
            heart.style.fontSize = '24px';
            heart.style.pointerEvents = 'none';
            heart.style.zIndex = '5';
            heart.textContent = '❤️';

            document.body.appendChild(heart);

            // Animar el corazón flotante
            const startX = parseFloat(heart.style.left);
            const startY = parseFloat(heart.style.top);
            const randomX = (Math.random() - 0.5) * 200;
            const randomVel = Math.random() * 2 + 1;

            let frame = 0;
            const animateHeart = () => {
                frame++;
                const progress = frame / 60;

                if (progress > 1) {
                    heart.remove();
                    return;
                }

                heart.style.left = (startX + randomX * progress) + 'px';
                heart.style.top = (startY - 150 * progress) + 'px';
                heart.style.opacity = 1 - progress;

                requestAnimationFrame(animateHeart);
            };

            animateHeart();
        }
    }

    showFinalEffect() {
        this.finalEffect.classList.add('active');

        // Play confetti-like effect
        this.createConfetti();

        setTimeout(() => {
            this.finalEffect.classList.remove('active');
        }, 1500);
    }

    createConfetti() {
        const confettiCount = 30;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.fontSize = '24px';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '998';

            const symbols = ['❤️', '✨', '🥷', '⚔️', '🕷️'];
            confetti.textContent = symbols[Math.floor(Math.random() * symbols.length)];

            document.body.appendChild(confetti);

            const duration = Math.random() * 2 + 2;
            const xMove = (Math.random() - 0.5) * 200;
            const rotation = Math.random() * 360;

            let frame = 0;
            const animate = () => {
                frame++;
                const progress = frame / (duration * 60);

                if (progress > 1) {
                    confetti.remove();
                    return;
                }

                confetti.style.top = (progress * 100 * window.innerHeight / 100) + 'px';
                confetti.style.left = (parseFloat(confetti.style.left) + xMove * 0.01) + 'px';
                confetti.style.transform = `rotate(${rotation * progress}deg)`;
                confetti.style.opacity = 1 - progress;

                requestAnimationFrame(animate);
            };

            animate();
        }
    }
}

/* =====================================================
   INICIALIZACIÓN
   ===================================================== */

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar sistema de partículas de chakra
    new ChakraBackground();

    // Inicializar experiencia del mensaje
    new MessageExperience();

    // Agregar efecto de entrada suave
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 1s ease-in';
        document.body.style.opacity = '1';
    }, 100);
});

console.log('✨ Experiencia interactiva cargada exitosamente ✨');
