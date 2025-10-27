/**
 * Wix Custom Element: Concentric Circles Cursor with Blend Mode
 * Tag name: holiday-cursor
 * 
 * Two concentric circles that invert colors using CSS blend modes.
 * Professional, clean design that works beautifully with any content.
 */

class HolidayCursor extends HTMLElement {
  constructor() {
    super();
    this.innerCircle = null;
    this.outerCircle = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.innerX = 0;
    this.innerY = 0;
    this.outerX = 0;
    this.outerY = 0;
    this.isHovering = false;
    this.clickableElements = [];
    this.animationId = null;
  }

  connectedCallback() {
    this.createCursorElements();
    this.setupEventListeners();
    this.detectClickableElements();
    this.startAnimation();
    this.setupMutationObserver();
  }

  disconnectedCallback() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.innerCircle && this.innerCircle.parentNode) {
      this.innerCircle.parentNode.removeChild(this.innerCircle);
    }
    
    if (this.outerCircle && this.outerCircle.parentNode) {
      this.outerCircle.parentNode.removeChild(this.outerCircle);
    }
    
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mouseup', this.handleMouseUp);
    
    // Restore default cursor
    document.body.style.cursor = '';
    document.querySelectorAll('*').forEach(el => {
      el.style.cursor = '';
    });
  }

  createCursorElements() {
    // Create inner circle (small, fast)
    this.innerCircle = document.createElement('div');
    this.innerCircle.id = 'cursor-inner-circle';
    this.innerCircle.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background-color: #fff;
      border-radius: 50%;
      pointer-events: none;
      z-index: 999999;
      transform: translate(-50%, -50%);
      mix-blend-mode: difference;
      transition: width 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                  height 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;

    // Create outer circle (large, slow with delay)
    this.outerCircle = document.createElement('div');
    this.outerCircle.id = 'cursor-outer-circle';
    this.outerCircle.style.cssText = `
      position: fixed;
      width: 40px;
      height: 40px;
      border: 2px solid #fff;
      border-radius: 50%;
      pointer-events: none;
      z-index: 999998;
      transform: translate(-50%, -50%);
      mix-blend-mode: difference;
      transition: width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                  height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                  border-width 0.3s ease;
    `;

    document.body.appendChild(this.innerCircle);
    document.body.appendChild(this.outerCircle);
    
    // Hide default cursor
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      * {
        cursor: none !important;
      }
      
      @keyframes cursorPulse {
        0%, 100% {
          transform: translate(-50%, -50%) scale(1);
        }
        50% {
          transform: translate(-50%, -50%) scale(0.9);
        }
      }
    `;
    document.head.appendChild(styleSheet);
  }

  setupEventListeners() {
    this.handleMouseMove = this.onMouseMove.bind(this);
    this.handleMouseDown = this.onMouseDown.bind(this);
    this.handleMouseUp = this.onMouseUp.bind(this);

    document.addEventListener('mousemove', this.handleMouseMove, { passive: true });
    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  detectClickableElements() {
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
      'textarea',
      'input[type="text"]',
      'input[type="email"]',
      'input[type="search"]'
    ];

    this.clickableElements = document.querySelectorAll(selectors.join(', '));
    
    this.clickableElements.forEach(el => {
      el.addEventListener('mouseenter', () => this.onElementHover(true), { passive: true });
      el.addEventListener('mouseleave', () => this.onElementHover(false), { passive: true });
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
  }

  onMouseDown() {
    // Shrink both circles on click
    this.innerCircle.style.width = '4px';
    this.innerCircle.style.height = '4px';
    this.outerCircle.style.width = '35px';
    this.outerCircle.style.height = '35px';
    this.outerCircle.style.borderWidth = '3px';
  }

  onMouseUp() {
    // Return to normal or hover state
    if (this.isHovering) {
      this.innerCircle.style.width = '12px';
      this.innerCircle.style.height = '12px';
      this.outerCircle.style.width = '60px';
      this.outerCircle.style.height = '60px';
      this.outerCircle.style.borderWidth = '2px';
    } else {
      this.innerCircle.style.width = '8px';
      this.innerCircle.style.height = '8px';
      this.outerCircle.style.width = '40px';
      this.outerCircle.style.height = '40px';
      this.outerCircle.style.borderWidth = '2px';
    }
  }

  onElementHover(isEntering) {
    this.isHovering = isEntering;
    
    if (isEntering) {
      // Expand on hover
      this.innerCircle.style.width = '12px';
      this.innerCircle.style.height = '12px';
      this.outerCircle.style.width = '60px';
      this.outerCircle.style.height = '60px';
    } else {
      // Return to normal
      this.innerCircle.style.width = '8px';
      this.innerCircle.style.height = '8px';
      this.outerCircle.style.width = '40px';
      this.outerCircle.style.height = '40px';
    }
  }

  animate() {
    // Smooth easing with different speeds for depth effect
    const innerEase = 0.2;  // Fast and responsive
    const outerEase = 0.1;  // Slower, creates elastic lag effect
    
    // Update inner circle position (fast)
    this.innerX += (this.mouseX - this.innerX) * innerEase;
    this.innerY += (this.mouseY - this.innerY) * innerEase;
    
    // Update outer circle position (slow, smooth lag)
    this.outerX += (this.mouseX - this.outerX) * outerEase;
    this.outerY += (this.mouseY - this.outerY) * outerEase;

    // Apply positions
    this.innerCircle.style.left = this.innerX + 'px';
    this.innerCircle.style.top = this.innerY + 'px';
    this.outerCircle.style.left = this.outerX + 'px';
    this.outerCircle.style.top = this.outerY + 'px';

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  startAnimation() {
    // Initialize positions
    this.innerX = this.mouseX;
    this.innerY = this.mouseY;
    this.outerX = this.mouseX;
    this.outerY = this.mouseY;
    
    this.animate();
  }
}

// Define the custom element
customElements.define('holiday-cursor', HolidayCursor);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HolidayCursor;
}
