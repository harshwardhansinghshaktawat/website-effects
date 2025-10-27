/**
 * Wix Custom Element: Holiday Mouse Effect
 * Tag name: holiday-cursor
 * 
 * This custom element creates beautiful holiday-themed cursor effects
 * with automatic detection of clickable elements, sparkle trails,
 * magnetic hover effects, and festive animations.
 */

class HolidayCursor extends HTMLElement {
  constructor() {
    super();
    this.cursor = null;
    this.cursorDot = null;
    this.cursorRing = null;
    this.particles = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.cursorX = 0;
    this.cursorY = 0;
    this.isHovering = false;
    this.isClicking = false;
    this.clickableElements = [];
    this.animationId = null;
    this.particleCanvas = null;
    this.particleCtx = null;
    this.lastParticleTime = 0;
    this.magneticElement = null;
  }

  connectedCallback() {
    this.createCursorElements();
    this.createParticleCanvas();
    this.setupEventListeners();
    this.detectClickableElements();
    this.startAnimation();
    
    // Observe DOM changes to detect new clickable elements
    this.setupMutationObserver();
  }

  disconnectedCallback() {
    // Clean up
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.cursor && this.cursor.parentNode) {
      this.cursor.parentNode.removeChild(this.cursor);
    }
    
    if (this.particleCanvas && this.particleCanvas.parentNode) {
      this.particleCanvas.parentNode.removeChild(this.particleCanvas);
    }
    
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    
    // Remove event listeners
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('click', this.handleClick);
  }

  createCursorElements() {
    // Create main cursor container
    this.cursor = document.createElement('div');
    this.cursor.id = 'holiday-cursor-container';
    this.cursor.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 99999;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      mix-blend-mode: normal;
    `;

    // Create cursor dot (center point)
    this.cursorDot = document.createElement('div');
    this.cursorDot.id = 'holiday-cursor-dot';
    this.cursorDot.style.cssText = `
      position: absolute;
      width: 8px;
      height: 8px;
      background: linear-gradient(135deg, #ff6b6b, #ffd700);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: transform 0.15s ease, opacity 0.15s ease;
      box-shadow: 0 0 10px rgba(255, 215, 0, 0.6),
                  0 0 20px rgba(255, 107, 107, 0.4);
    `;

    // Create cursor ring (outer circle)
    this.cursorRing = document.createElement('div');
    this.cursorRing.id = 'holiday-cursor-ring';
    this.cursorRing.style.cssText = `
      position: absolute;
      width: 40px;
      height: 40px;
      border: 2px solid;
      border-image: linear-gradient(135deg, #ff6b6b, #ffd700, #4ecdc4, #ff6b6b) 1;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width 0.3s ease, height 0.3s ease, border-width 0.3s ease;
      animation: ringRotate 3s linear infinite;
    `;

    // Add rotation animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ringRotate {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
      }
      
      @keyframes sparkle {
        0%, 100% { opacity: 0; transform: scale(0); }
        50% { opacity: 1; transform: scale(1); }
      }
      
      @keyframes clickPulse {
        0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    this.cursor.appendChild(this.cursorDot);
    this.cursor.appendChild(this.cursorRing);
    document.body.appendChild(this.cursor);
    
    // Hide default cursor
    document.body.style.cursor = 'none';
    document.querySelectorAll('*').forEach(el => {
      if (el !== this.cursor && !this.cursor.contains(el)) {
        el.style.cursor = 'none';
      }
    });
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
      z-index: 99998;
    `;
    
    this.particleCanvas.width = window.innerWidth;
    this.particleCanvas.height = window.innerHeight;
    this.particleCtx = this.particleCanvas.getContext('2d');
    
    document.body.appendChild(this.particleCanvas);
    
    // Handle resize
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
    // Select all clickable elements
    const selectors = [
      'a',
      'button',
      'input[type="button"]',
      'input[type="submit"]',
      '[role="button"]',
      '[onclick]',
      '.clickable',
      'label',
      'select'
    ];

    this.clickableElements = document.querySelectorAll(selectors.join(', '));
    
    // Add hover listeners to clickable elements
    this.clickableElements.forEach(el => {
      el.addEventListener('mouseenter', () => this.onElementHover(el, true), { passive: true });
      el.addEventListener('mouseleave', () => this.onElementHover(el, false), { passive: true });
    });
  }

  setupMutationObserver() {
    // Watch for DOM changes to detect new clickable elements
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

    // Create sparkle trail
    const now = Date.now();
    if (now - this.lastParticleTime > 50) { // Create particle every 50ms
      this.createSparkle(this.mouseX, this.mouseY);
      this.lastParticleTime = now;
    }

    // Check for magnetic effect on hoverable elements
    this.checkMagneticEffect(e);
  }

  onMouseDown() {
    this.isClicking = true;
    
    // Scale down cursor
    this.cursorDot.style.transform = 'translate(-50%, -50%) scale(0.8)';
    this.cursorRing.style.width = '35px';
    this.cursorRing.style.height = '35px';
    this.cursorRing.style.borderWidth = '3px';
  }

  onMouseUp() {
    this.isClicking = false;
    
    // Reset cursor
    if (!this.isHovering) {
      this.cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
      this.cursorRing.style.width = '40px';
      this.cursorRing.style.height = '40px';
      this.cursorRing.style.borderWidth = '2px';
    }
  }

  onClick(e) {
    // Create click burst effect
    this.createClickBurst(e.clientX, e.clientY);
  }

  onElementHover(element, isEntering) {
    this.isHovering = isEntering;
    
    if (isEntering) {
      // Expand cursor ring
      this.cursorRing.style.width = '60px';
      this.cursorRing.style.height = '60px';
      this.cursorRing.style.borderWidth = '3px';
      
      // Scale up dot
      this.cursorDot.style.transform = 'translate(-50%, -50%) scale(1.5)';
      
      // Add glow effect
      this.cursorDot.style.boxShadow = `
        0 0 20px rgba(255, 215, 0, 0.8),
        0 0 40px rgba(255, 107, 107, 0.6),
        0 0 60px rgba(78, 205, 196, 0.4)
      `;
      
      this.magneticElement = element;
    } else {
      // Reset to normal
      this.cursorRing.style.width = '40px';
      this.cursorRing.style.height = '40px';
      this.cursorRing.style.borderWidth = '2px';
      this.cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
      this.cursorDot.style.boxShadow = `
        0 0 10px rgba(255, 215, 0, 0.6),
        0 0 20px rgba(255, 107, 107, 0.4)
      `;
      
      this.magneticElement = null;
    }
  }

  checkMagneticEffect(e) {
    if (!this.magneticElement) return;

    const rect = this.magneticElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distance = Math.sqrt(
      Math.pow(e.clientX - centerX, 2) + 
      Math.pow(e.clientY - centerY, 2)
    );

    // Magnetic pull radius
    const magnetRadius = 100;
    
    if (distance < magnetRadius) {
      // Calculate magnetic force (stronger when closer)
      const force = (magnetRadius - distance) / magnetRadius;
      const pullX = (centerX - e.clientX) * force * 0.3;
      const pullY = (centerY - e.clientY) * force * 0.3;
      
      this.cursorX = e.clientX + pullX;
      this.cursorY = e.clientY + pullY;
    }
  }

  createSparkle(x, y) {
    const colors = [
      '#FFD700', // Gold
      '#FF6B6B', // Red
      '#4ECDC4', // Teal
      '#FFFFFF', // White
      '#FFA500', // Orange
      '#FF1493'  // Pink
    ];

    const particle = {
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2 - 1, // Slight upward bias
      size: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1.0,
      decay: Math.random() * 0.02 + 0.01
    };

    this.particles.push(particle);
  }

  createClickBurst(x, y) {
    // Create burst of particles on click
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const speed = Math.random() * 3 + 2;
      
      const particle = {
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color: ['#FFD700', '#FF6B6B', '#4ECDC4'][Math.floor(Math.random() * 3)],
        life: 1.0,
        decay: 0.02
      };
      
      this.particles.push(particle);
    }

    // Create click ring effect
    const clickRing = document.createElement('div');
    clickRing.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 20px;
      height: 20px;
      border: 2px solid #FFD700;
      border-radius: 50%;
      pointer-events: none;
      z-index: 99997;
      animation: clickPulse 0.5s ease-out forwards;
      box-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
    `;
    
    document.body.appendChild(clickRing);
    setTimeout(() => clickRing.remove(), 500);
  }

  updateParticles() {
    this.particleCtx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // Gravity
      p.life -= p.decay;

      // Remove dead particles
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      // Draw particle
      this.particleCtx.save();
      this.particleCtx.globalAlpha = p.life;
      
      // Create gradient for sparkle effect
      const gradient = this.particleCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(1, 'transparent');
      
      this.particleCtx.fillStyle = gradient;
      this.particleCtx.beginPath();
      this.particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.particleCtx.fill();
      
      // Add sparkle star effect for some particles
      if (Math.random() > 0.9) {
        this.particleCtx.fillStyle = p.color;
        this.particleCtx.fillRect(p.x - 0.5, p.y - p.size * 1.5, 1, p.size * 3);
        this.particleCtx.fillRect(p.x - p.size * 1.5, p.y - 0.5, p.size * 3, 1);
      }
      
      this.particleCtx.restore();
    }
  }

  animate() {
    // Smooth cursor follow with easing
    const ease = 0.15;
    this.cursorX += (this.mouseX - this.cursorX) * ease;
    this.cursorY += (this.mouseY - this.cursorY) * ease;

    // Update cursor position
    this.cursorDot.style.left = this.cursorX + 'px';
    this.cursorDot.style.top = this.cursorY + 'px';
    this.cursorRing.style.left = this.cursorX + 'px';
    this.cursorRing.style.top = this.cursorY + 'px';

    // Update particles
    this.updateParticles();

    // Continue animation
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  startAnimation() {
    this.animate();
  }
}

// Define the custom element
customElements.define('holiday-cursor', HolidayCursor);

// Export for module systems (optional)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HolidayCursor;
}
