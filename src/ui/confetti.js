/**
 * Confetti animations
 */

import { elements } from './elements.js';

/**
 * Mini confetti burst for streak milestones
 */
export function launchStreakConfetti() {
    const canvas = elements.confettiCanvas;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#ff6b35', '#f7c548', '#ff8c42', '#ffd166', '#ff9f1c'];

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < 50; i++) {
        const angle = (Math.PI * 2 * i) / 50;
        const velocity = Math.random() * 8 + 4;
        particles.push({
            x: centerX,
            y: centerY,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedX: Math.cos(angle) * velocity,
            speedY: Math.sin(angle) * velocity,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5,
            alpha: 1
        });
    }

    let animationId;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let activeParticles = 0;

        particles.forEach(p => {
            if (p.alpha > 0) {
                activeParticles++;

                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                ctx.restore();

                p.x += p.speedX;
                p.y += p.speedY;
                p.speedY += 0.15;
                p.rotation += p.rotationSpeed;
                p.alpha -= 0.02;
            }
        });

        if (activeParticles > 0) {
            animationId = requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    animate();

    setTimeout(() => {
        cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 2000);
}

export function launchConfetti() {
    const canvas = elements.confettiCanvas;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#c9a227', '#e8c547', '#2ecc71', '#3498db', '#e74c3c', '#9b59b6'];

    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 3 + 2,
            speedX: Math.random() * 2 - 1,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5
        });
    }

    let animationId;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let activeParticles = 0;

        particles.forEach(p => {
            if (p.y < canvas.height + 50) {
                activeParticles++;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                ctx.restore();

                p.y += p.speedY;
                p.x += p.speedX;
                p.rotation += p.rotationSpeed;
                p.speedY += 0.05;
            }
        });

        if (activeParticles > 0) {
            animationId = requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    animate();

    setTimeout(() => {
        cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 5000);
}
