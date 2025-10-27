/**
 * Wix Custom Element: Holiday Cursor (SVG Design)
 * Tag name: holiday-cursor
 * 
 * Based on modern cursor design with SVG circles,
 * blend mode effects, and Christmas holiday colors.
 */

class HolidayCursor extends HTMLElement {
  constructor() {
    super();
    this.bigBall = null;
    this.smallBall = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.bigBallX = 0;
    this.bigBallY = 0;
    this.smallBallX = 0;
    this.smallBallY = 0;
    this.scale = 1;
    this.targetScale = 1;
    this.animationId = null;
    this.hoverables = [];
  }

  connectedCallback() {
    this.createCursorElements();
    this.setupEventListeners();
    this.detectHoverableElements();
    this.startAnimation();
    this.setupMutationObserver();
  }

  disconnectedCallback() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.cursorContainer && this.cursorContainer.parentNode) {
      this.cursorContainer.parentNode.removeChild(this.cursorContainer);
    }
    
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    
    document.removeEventListener('mousemove', this.handleMouseMove);
    
    // Restore default cursor
    document.body.style.cursor = '';
    const styleElement = document.getElementById('holiday-cursor-styles');
    if (styleElement) {
      styleElement.remove();
    }
  }

  createCursorElements() {
    // Create styles
    const styleSheet = document.createElement('style');
    styleSheet.id = 'holiday-cursor-styles';
    styleSheet.textContent = `
      * {
        cursor: none !important;
      }
      
      .holiday-cursor-container {
        pointer-events: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 999999;
      }
      
      .holiday-cursor__ball {
        position: fixed;
        top: 0;
        left: 0;
        mix-blend-mode: difference;
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      
      .holiday-cursor__ball circle {
        transition: fill 0.3s ease;
      }
      
      .holiday-cursor__ball--big circle {
        fill: #C41E3A;
      }
      
      .holiday-cursor__ball--small circle {
        fill: #165B33;
      }
    `;
    document.head.appendChild(styleSheet);

    // Create cursor container
    this.cursorContainer = document.createElement('div');
    this.cursorContainer.className = 'holiday-cursor-container';

    // Create big ball (outer circle)
    this.bigBall = document.createElement('div');
    this.bigBall.className = 'holiday-cursor__ball holiday-cursor__ball--big';
    this.bigBall.innerHTML = `
      <svg height="40" width="40">
        <circle cx="20" cy="20" r="16" stroke-width="0"></circle>
      </svg>
    `;

    // Create small ball (inner dot)
    this.smallBall = document.createElement('div');
    this.smallBall.className = 'holiday-cursor__ball holiday-cursor__ball--small';
    this.smallBall.innerHTML = `
      <svg height="12" width="12">
        <circle cx="6" cy="6" r="5" stroke-width="0"></circle>
      </svg>
    `;

    this.cursorContainer.appendChild(this.bigBall);
    this.cursorContainer.appendChild(this.smallBall);
    document.body.appendChild(this.cursorContainer);
  }

  setupEventListeners() {
    this.handleMouseMove = this.onMouseMove.bind(this);
    document.addEventListener('mousemove', this.handleMouseMove, { passive: true });
  }

  detectHoverableElements() {
    // Common selectors for hoverable elements
    const selectors = [
      'a',
      'button',
      'input[type="button"]',
      'input[type="submit"]',
      'input[type="reset"]',
      '[role="button"]',
      '[onclick]',
      '.btn',
      '.button',
      'label',
      'select',
      '.hoverable'
    ];

    // Remove old listeners
    this.hoverables.forEach(el => {
      if (el._hoverEnter) el.removeEventListener('mouseenter', el._hoverEnter);
      if (el._hoverLeave) el.removeEventListener('mouseleave', el._hoverLeave);
    });

    // Get new hoverable elements
    this.hoverables = document.querySelectorAll(selectors.join(', '));
    
    // Add new listeners
    this.hoverables.forEach(el => {
      el._hoverEnter = () => this.onMouseHover();
      el._hoverLeave = () => this.onMouseHoverOut();
      
      el.addEventListener('mouseenter', el._hoverEnter, { passive: true });
      el.addEventListener('mouseleave', el._hoverLeave, { passive: true });
    });
  }

  setupMutationObserver() {
    this.mutationObserver = new MutationObserver(() => {
      this.detectHoverableElements();
    });

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  onMouseMove(e) {
    this.mouseX = e.pageX;
    this.mouseY = e.pageY;
  }

  onMouseHover() {
    this.targetScale = 4;
    
    // Change colors on hover for visual feedback
    const bigCircle = this.bigBall.querySelector('circle');
    const smallCircle = this.smallBall.querySelector('circle');
    
    bigCircle.style.fill = '#FFD700'; // Gold on hover
    smallCircle.style.fill = '#C41E3A'; // Red on hover
  }

  onMouseHoverOut() {
    this.targetScale = 1;
    
    // Reset colors
    const bigCircle = this.bigBall.querySelector('circle');
    const smallCircle = this.smallBall.querySelector('circle');
    
    bigCircle.style.fill = '#C41E3A'; // Red (Christmas)
    smallCircle.style.fill = '#165B33'; // Green (Forest)
  }

  animate() {
    // Smooth easing for cursor movement
    const bigEase = 0.15;
    const smallEase = 0.25;
    const scaleEase = 0.15;

    // Update positions with easing
    this.bigBallX += (this.mouseX - this.bigBallX) * bigEase;
    this.bigBallY += (this.mouseY - this.bigBallY) * bigEase;
    
    this.smallBallX += (this.mouseX - this.smallBallX) * smallEase;
    this.smallBallY += (this.mouseY - this.smallBallY) * smallEase;
    
    // Update scale with easing
    this.scale += (this.targetScale - this.scale) * scaleEase;

    // Apply transforms
    this.bigBall.style.transform = `translate(${this.bigBallX - 20}px, ${this.bigBallY - 20}px) scale(${this.scale})`;
    this.smallBall.style.transform = `translate(${this.smallBallX - 6}px, ${this.smallBallY - 6}px)`;

    // Continue animation loop
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  startAnimation() {
    // Initialize positions to avoid jump on load
    this.bigBallX = this.mouseX;
    this.bigBallY = this.mouseY;
    this.smallBallX = this.mouseX;
    this.smallBallY = this.mouseY;
    
    this.animate();
  }
}

// Define the custom element
customElements.define('holiday-cursor', HolidayCursor);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HolidayCursor;
}
