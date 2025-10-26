/**
 * Wix Custom Element: Optimized Realistic Snowfall Effect
 * Tag name: snowfall-effect
 * 
 * This custom element creates a beautiful, realistic snowfall effect
 * that covers the entire page with optimized performance.
 */

class SnowfallEffect extends HTMLElement {
  constructor() {
    super();
    this.snowflakes = [];
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
    this.resizeTimeout = null;
    this.isVisible = true;
  }

  connectedCallback() {
    // Create and inject the snowfall canvas into the page
    this.createSnowfallCanvas();
    this.initializeSnowflakes();
    this.startAnimation();
    
    // Handle window resize with debouncing
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
    
    // Use Intersection Observer for better performance
    this.setupVisibilityObserver();
  }

  disconnectedCallback() {
    // Clean up when element is removed
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    window.removeEventListener('resize', this.handleResize);
    
    if (this.visibilityObserver) {
      this.visibilityObserver.disconnect();
    }
  }

  createSnowfallCanvas() {
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'snowfall-canvas';
    
    // Style the canvas to cover the entire page
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none'; // Allow clicks to pass through
    this.canvas.style.zIndex = '9999'; // Ensure it's on top
    this.canvas.style.opacity = '0.9';
    
    // Set canvas dimensions with device pixel ratio for crisp rendering
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for performance
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    
    // Get 2D context
    this.ctx = this.canvas.getContext('2d', {
      alpha: true,
      desynchronized: true // Better performance
    });
    
    // Scale context to match device pixel ratio
    this.ctx.scale(dpr, dpr);
    
    // Inject canvas into the body (not inside the custom element)
    document.body.appendChild(this.canvas);
  }

  setupVisibilityObserver() {
    // Pause animation when page is not visible to save resources
    if ('hidden' in document) {
      this.handleVisibilityChange = () => {
        this.isVisible = !document.hidden;
      };
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  initializeSnowflakes() {
    // Adaptive snowflake count based on screen size and device capability
    const screenArea = window.innerWidth * window.innerHeight;
    const isMobile = window.innerWidth < 768;
    const divisor = isMobile ? 15000 : 10000; // Fewer flakes on mobile
    
    const snowflakeCount = Math.floor(screenArea / divisor);
    const maxSnowflakes = isMobile ? 50 : 100; // Cap for performance
    
    const finalCount = Math.min(snowflakeCount, maxSnowflakes);
    
    for (let i = 0; i < finalCount; i++) {
      this.snowflakes.push(this.createSnowflake());
    }
  }

  createSnowflake(isNew = false) {
    const size = Math.random() * 3.5 + 1; // Size between 1-4.5px (slightly smaller)
    const x = isNew ? Math.random() * window.innerWidth : Math.random() * window.innerWidth;
    const y = isNew ? -10 : Math.random() * window.innerHeight;
    
    return {
      x: x,
      y: y,
      size: size,
      speedY: Math.random() * 0.8 + 0.4, // Falling speed (0.4-1.2) - slightly slower
      speedX: Math.random() * 0.3 - 0.15, // Horizontal drift (-0.15 to 0.15)
      opacity: Math.random() * 0.5 + 0.5, // Opacity (0.5-1.0)
      swing: Math.random() * 1.5, // Swinging motion amplitude (reduced)
      swingSpeed: Math.random() * 0.008 + 0.004, // Speed of swing (reduced)
      angle: Math.random() * Math.PI * 2, // Current swing angle
      depth: Math.random() * 0.5 + 0.5 // For parallax effect (0.5-1, where 1 is closest)
    };
  }

  drawSnowflake(snowflake) {
    // Simple, efficient rendering
    this.ctx.globalAlpha = snowflake.opacity;
    
    // Use simple circle for better performance
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.arc(snowflake.x, snowflake.y, snowflake.size, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Add subtle glow for larger snowflakes only
    if (snowflake.size > 3) {
      this.ctx.globalAlpha = snowflake.opacity * 0.3;
      this.ctx.beginPath();
      this.ctx.arc(snowflake.x, snowflake.y, snowflake.size * 1.5, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.globalAlpha = 1;
  }

  updateSnowflake(snowflake) {
    // Update swing angle
    snowflake.angle += snowflake.swingSpeed;
    
    // Update position with swinging motion
    snowflake.y += snowflake.speedY * snowflake.depth;
    snowflake.x += snowflake.speedX + Math.sin(snowflake.angle) * snowflake.swing * 0.05;
    
    // Simplified wind effect (less computation)
    snowflake.x += Math.sin(snowflake.angle * 0.5) * 0.1;
    
    // Reset snowflake when it goes off screen
    if (snowflake.y > window.innerHeight + 10) {
      snowflake.y = -10;
      snowflake.x = Math.random() * window.innerWidth;
    }
    
    // Wrap horizontally
    if (snowflake.x > window.innerWidth + 10) {
      snowflake.x = -10;
    } else if (snowflake.x < -10) {
      snowflake.x = window.innerWidth + 10;
    }
  }

  animate() {
    // Only animate if page is visible
    if (!this.isVisible) {
      this.animationId = requestAnimationFrame(() => this.animate());
      return;
    }
    
    // Clear canvas efficiently
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
    // Update and draw all snowflakes in one pass
    for (let i = 0; i < this.snowflakes.length; i++) {
      this.updateSnowflake(this.snowflakes[i]);
      this.drawSnowflake(this.snowflakes[i]);
    }
    
    // Continue animation
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  startAnimation() {
    this.animate();
  }

  handleResize() {
    // Debounce resize events to prevent performance issues
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      
      this.canvas.width = window.innerWidth * dpr;
      this.canvas.height = window.innerHeight * dpr;
      this.canvas.style.width = window.innerWidth + 'px';
      this.canvas.style.height = window.innerHeight + 'px';
      
      this.ctx.scale(dpr, dpr);
      
      // Adjust snowflake count based on new screen size
      const screenArea = window.innerWidth * window.innerHeight;
      const isMobile = window.innerWidth < 768;
      const divisor = isMobile ? 15000 : 10000;
      const maxSnowflakes = isMobile ? 50 : 100;
      
      const targetCount = Math.min(Math.floor(screenArea / divisor), maxSnowflakes);
      const currentCount = this.snowflakes.length;
      
      if (targetCount > currentCount) {
        // Add more snowflakes
        for (let i = currentCount; i < targetCount; i++) {
          this.snowflakes.push(this.createSnowflake(true));
        }
      } else if (targetCount < currentCount) {
        // Remove excess snowflakes
        this.snowflakes.length = targetCount;
      }
    }, 250);
  }
}

// Define the custom element
customElements.define('snowfall-effect', SnowfallEffect);

// Export for module systems (optional)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SnowfallEffect;
}
