/**
 * Wix Custom Element: Beautiful Holiday Cursor
 * Tag name: holiday-cursor
 * 
 * Professional cursor design with smooth circles, Christmas colors,
 * magnetic effects, and elegant animations inspired by modern web design.
 */

class HolidayCursor extends HTMLElement {
  constructor() {
    super();
    this.cursorDot = null;
    this.cursorCircle = null;
    this.particles = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.dotX = 0;
    this.dotY = 0;
    this.circleX = 0;
    this.circleY = 0;
    this.isHovering = false;
    this.isClicking = false;
    this.clickableElements = [];
    this.animationId = null;
    this.particleCanvas = null;
    this.particleCtx = null;
    this.lastParticleTime = 0;
    this.currentHoverElement = null;
  }

  connectedCallback() {
    this.createCursorElements();
    this.createParticleCanvas();
    this.setupEventListeners();
    this.detectClickableElements();
    this.startAnimation();
    this.setupMutationObserver();
  }

  disconnectedCallback() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.cursorDot && this.cursorDot.parentNode) {
      this.cursorDot.parentNode.removeChild(this.cursorDot);
    }
    
    if (this.cursorCircle && this.cursorCircle.parentNode) {
      this.cursorCircle.parentNode.removeChild(this.cursorCircle);
    }
    
    if (this.particleCanvas && this.particleCanvas.parentNode) {
      this.particleCanvas.parentNode.removeChild(this.particleCanvas);
    }
    
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('click', this.handleClick);
    
    // Restore default cursor
    document.body.style.cursor = '';
    document.querySelectorAll('*').forEach(el => {
      el.style.cursor = '';
    });
  }

  createCursorElements() {
    // Create inner dot (small, fast-following)
    this.cursorDot = document.createElement('div');
    this.cursorDot.id = 'holiday-cursor-dot';
    this.cursorDot.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: #C41E3A;
      border-radius: 50%;
      pointer-events: none;
      z-index: 999999;
      transform: translate(-50%, -50%);
      transition: width 0.2s ease, height 0.2s ease, background 0.2s ease;
      mix-blend-mode: difference;
    `;

    // Create outer circle (large, smooth-following with delay)
    this.cursorCircle = document.createElement('div');
    this.cursorCircle.id = 'holiday-cursor-circle';
    this.cursorCircle.style.cssText = `
      position: fixed;
      width: 40px;
      height: 40px;
      border: 2px solid #165B33;
      border-radius: 50%;
      pointer-events: none;
      z-index: 999998;
      transform: translate(-50%, -50%);
      transition: width 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                  height 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                  border-color 0.3s ease,
                  border-width 0.3s ease,
                  opacity 0.3s ease;
      opacity: 0.8;
    `;

    document.body.appendChild(this.cursorDot);
    document.body.appendChild(this.cursorCircle);
    
    // Hide default cursor
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      * {
        cursor: none !important;
      }
      
      @keyframes particleFade {
        0% {
          opacity: 1;
          transform: scale(1);
        }
        100% {
          opacity: 0;
          transform: scale(0);
        }
      }
      
      @keyframes clickRipple {
        0% {
          transform: translate(-50%, -50%) scale(0.5);
          opacity: 1;
        }
        100% {
          transform: translate(-50%, -50%) scale(2);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(styleSheet);
  }

  createParticleCanvas() {
    this.particleCanvas = document.createElement('canvas');
    this.particleCanvas.id = 'holiday-particle-canvas';
    this.particleCanvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999997;
    `;
    
    this.particleCanvas.width = window.innerWidth;
    this.particleCanvas.height = window.innerHeight;
    this.particleCtx = this.particleCanvas.getContext('2d', { alpha: true });
    
    document.body.appendChild(this.particleCanvas);
    
    window.addEventListener('resize', () => {
      this.particleCanvas.width = window.innerWidth;
      this.particleCanvas.height = window.innerHeight;
    });
  }

  setupEventListeners() {
    this.handleMouseMove = this.onMouseMove.bind(this);
    this.handleMouseDown = this.onMouseDown.bind(this);
    this.handleMouseUp = this.onMouseUp.bind(this);
    this.handleClick = this.onClick.bind(this);

    document.addEventListener('mousemove', this.handleMouseMove, { passive: true });
    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('click', this.handleClick);
  }

  detectClickableElements() {
    const selectors = [
      'a',
      'button',
      'input[type="button"]',
      'input[type="submit"]',
      '[role="button"]',
      '[onclick]',
      '.btn',
      '.button',
      'label',
      'select'
    ];

    this.clickableElements = document.querySelectorAll(selectors.join(', '));
    
    this.clickableElements.forEach(el => {
      el.addEventListener('mouseenter', () => this.onElementHover(el, true), { passive: true });
      el.addEventListener('mouseleave', () => this.onElementHover(el, false), { passive: true });
    });
  }

  setupMutationObserver() {
    this.mutationObserver = new MutationObserver(() => {
      this.detectClickableElements();
    });

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  onMouseMove(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;

    // Create sparkle trail (less frequent for subtlety)
    const now = Date.now();
    if (now - this.lastParticleTime > 80 && !this.isClicking) {
      this.createSparkle(this.mouseX, this.mouseY);
      this.lastParticleTime = now;
    }

    // Magnetic effect
    if (this.currentHoverElement) {
      this.applyMagneticEffect();
    }
  }

  onMouseDown() {
    this.isClicking = true;
    
    // Shrink dot
    this.cursorDot.style.width = '6px';
    this.cursorDot.style.height = '6px';
    this.cursorDot.style.background = '#165B33'; // Green on click
    
    // Shrink circle
    this.cursorCircle.style.width = '35px';
    this.cursorCircle.style.height = '35px';
    this.cursorCircle.style.borderWidth = '3px';
    this.cursorCircle.style.borderColor = '#C41E3A'; // Red border on click
  }

  onMouseUp() {
    this.isClicking = false;
    
    // Reset to hover state or normal state
    if (this.isHovering) {
      this.cursorDot.style.width = '14px';
      this.cursorDot.style.height = '14px';
      this.cursorDot.style.background = '#C41E3A';
    } else {
      this.cursorDot.style.width = '10px';
      this.cursorDot.style.height = '10px';
      this.cursorDot.style.background = '#C41E3A';
    }
    
    this.cursorCircle.style.width = this.isHovering ? '70px' : '40px';
    this.cursorCircle.style.height = this.isHovering ? '70px' : '40px';
    this.cursorCircle.style.borderWidth = '2px';
    this.cursorCircle.style.borderColor = '#165B33';
  }

  onClick(e) {
    // Create elegant click ripple
    this.createClickRipple(e.clientX, e.clientY);
  }

  onElementHover(element, isEntering) {
    this.isHovering = isEntering;
    this.currentHoverElement = isEntering ? element : null;
    
    if (isEntering) {
      // Expand and change colors on hover
      this.cursorDot.style.width = '14px';
      this.cursorDot.style.height = '14px';
      this.cursorDot.style.background = '#C41E3A'; // Christmas red
      
      this.cursorCircle.style.width = '70px';
      this.cursorCircle.style.height = '70px';
      this.cursorCircle.style.borderColor = '#165B33'; // Forest green
      this.cursorCircle.style.borderWidth = '2px';
      this.cursorCircle.style.opacity = '1';
    } else {
      // Return to normal state
      this.cursorDot.style.width = '10px';
      this.cursorDot.style.height = '10px';
      this.cursorDot.style.background = '#C41E3A';
      
      this.cursorCircle.style.width = '40px';
      this.cursorCircle.style.height = '40px';
      this.cursorCircle.style.borderColor = '#165B33';
      this.cursorCircle.style.borderWidth = '2px';
      this.cursorCircle.style.opacity = '0.8';
    }
  }

  applyMagneticEffect() {
    if (!this.currentHoverElement) return;

    const rect = this.currentHoverElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distance = Math.sqrt(
      Math.pow(this.mouseX - centerX, 2) + 
      Math.pow(this.mouseY - centerY, 2)
    );

    const magnetRadius = 80;
    
    if (distance < magnetRadius) {
      const force = Math.max(0, (magnetRadius - distance) / magnetRadius);
      const pullStrength = 0.2;
      
      this.dotX = this.mouseX + (centerX - this.mouseX) * force * pullStrength;
      this.dotY = this.mouseY + (centerY - this.mouseY) * force * pullStrength;
    }
  }

  createSparkle(x, y) {
    // Christmas color palette
    const colors = [
      '#C41E3A', // Christmas red
      '#165B33', // Forest green
      '#FFD700', // Gold
      '#FFFFFF', // White
      '#146B3A', // Emerald green
      '#BB2528'  // Dark red
    ];

    const particle = {
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5 - 0.5,
      size: Math.random() * 2.5 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1.0,
      decay: Math.random() * 0.015 + 0.01
    };

    this.particles.push(particle);
  }

  createClickRipple(x, y) {
    // Create elegant click burst
    const burst = 8;
    for (let i = 0; i < burst; i++) {
      const angle = (Math.PI * 2 * i) / burst;
      const speed = Math.random() * 2 + 1.5;
      
      const particle = {
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 2,
        color: i % 2 === 0 ? '#C41E3A' : '#165B33',
        life: 1.0,
        decay: 0.025
      };
      
      this.particles.push(particle);
    }

    // Create expanding circle ripple
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 30px;
      height: 30px;
      border: 2px solid #C41E3A;
      border-radius: 50%;
      pointer-events: none;
      z-index: 999996;
      animation: clickRipple 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      opacity: 0.8;
    `;
    
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    // Secondary green ripple
    const ripple2 = document.createElement('div');
    ripple2.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 30px;
      height: 30px;
      border: 2px solid #165B33;
      border-radius: 50%;
      pointer-events: none;
      z-index: 999995;
      animation: clickRipple 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      opacity: 0.6;
      animation-delay: 0.1s;
    `;
    
    document.body.appendChild(ripple2);
    setTimeout(() => ripple2.remove(), 900);
  }

  updateParticles() {
    this.particleCtx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // Subtle gravity
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      // Draw particle with glow
      this.particleCtx.save();
      this.particleCtx.globalAlpha = p.life;
      
      // Outer glow
      const gradient = this.particleCtx.createRadialGradient(
        p.x, p.y, 0,
        p.x, p.y, p.size * 2
      );
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(0.5, p.color + '80');
      gradient.addColorStop(1, 'transparent');
      
      this.particleCtx.fillStyle = gradient;
      this.particleCtx.beginPath();
      this.particleCtx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
      this.particleCtx.fill();
      
      // Inner bright core
      this.particleCtx.fillStyle = p.color;
      this.particleCtx.beginPath();
      this.particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.particleCtx.fill();
      
      this.particleCtx.restore();
    }
  }

  animate() {
    // Smooth easing for cursor elements
    const dotEase = 0.18; // Fast following for dot
    const circleEase = 0.08; // Slower, elastic following for circle
    
    // Update dot position (fast, responsive)
    this.dotX += (this.mouseX - this.dotX) * dotEase;
    this.dotY += (this.mouseY - this.dotY) * dotEase;
    
    // Update circle position (slow, smooth)
    this.circleX += (this.mouseX - this.circleX) * circleEase;
    this.circleY += (this.mouseY - this.circleY) * circleEase;

    // Apply positions
    this.cursorDot.style.left = this.dotX + 'px';
    this.cursorDot.style.top = this.dotY + 'px';
    this.cursorCircle.style.left = this.circleX + 'px';
    this.cursorCircle.style.top = this.circleY + 'px';

    // Update particles
    this.updateParticles();

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  startAnimation() {
    // Initialize positions
    this.dotX = this.mouseX;
    this.dotY = this.mouseY;
    this.circleX = this.mouseX;
    this.circleY = this.mouseY;
    
    this.animate();
  }
}

// Define the custom element
customElements.define('holiday-cursor', HolidayCursor);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HolidayCursor;
}
