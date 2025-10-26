/**
 * Wix Custom Element: Realistic Snowfall Effect
 * Tag name: snowfall-effect
 * 
 * This custom element creates a beautiful, realistic snowfall effect
 * that covers the entire page when added to any Wix site.
 */

class SnowfallEffect extends HTMLElement {
  constructor() {
    super();
    this.snowflakes = [];
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
    this.resizeTimeout = null;
  }

  connectedCallback() {
    // Create and inject the snowfall canvas into the page
    this.createSnowfallCanvas();
    this.initializeSnowflakes();
    this.startAnimation();
    
    // Handle window resize
    window.addEventListener('resize', () => this.handleResize());
    
    // Handle page scroll for parallax effect
    window.addEventListener('scroll', () => this.handleScroll());
  }

  disconnectedCallback() {
    // Clean up when element is removed
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    window.removeEventListener('resize', () => this.handleResize());
    window.removeEventListener('scroll', () => this.handleScroll());
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
    
    // Set canvas dimensions
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Get 2D context
    this.ctx = this.canvas.getContext('2d');
    
    // Inject canvas into the body (not inside the custom element)
    document.body.appendChild(this.canvas);
  }

  initializeSnowflakes() {
    // Create snowflakes with varied properties for realism
    const snowflakeCount = Math.floor((window.innerWidth * window.innerHeight) / 8000);
    
    for (let i = 0; i < snowflakeCount; i++) {
      this.snowflakes.push(this.createSnowflake());
    }
  }

  createSnowflake(isNew = false) {
    const size = Math.random() * 4 + 1; // Size between 1-5px
    const x = isNew ? Math.random() * this.canvas.width : Math.random() * this.canvas.width;
    const y = isNew ? -10 : Math.random() * this.canvas.height;
    
    return {
      x: x,
      y: y,
      size: size,
      speedY: Math.random() * 1 + 0.5, // Falling speed (0.5-1.5)
      speedX: Math.random() * 0.5 - 0.25, // Horizontal drift (-0.25 to 0.25)
      opacity: Math.random() * 0.6 + 0.4, // Opacity (0.4-1.0)
      swing: Math.random() * 2, // Swinging motion amplitude
      swingSpeed: Math.random() * 0.01 + 0.005, // Speed of swing
      angle: Math.random() * Math.PI * 2, // Current swing angle
      blur: size > 3 ? 1 : 0, // Larger snowflakes have slight blur
      depth: Math.random() // For parallax effect (0-1, where 1 is closest)
    };
  }

  drawSnowflake(snowflake) {
    this.ctx.save();
    
    // Apply blur for depth effect on larger snowflakes
    if (snowflake.blur > 0) {
      this.ctx.filter = `blur(${snowflake.blur}px)`;
    }
    
    // Set opacity
    this.ctx.globalAlpha = snowflake.opacity;
    
    // Draw snowflake as a circle with gradient for more realistic look
    const gradient = this.ctx.createRadialGradient(
      snowflake.x, snowflake.y, 0,
      snowflake.x, snowflake.y, snowflake.size
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(snowflake.x, snowflake.y, snowflake.size, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Add a subtle sparkle effect for some snowflakes
    if (snowflake.size > 2.5 && Math.random() > 0.98) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.fillRect(snowflake.x - 0.5, snowflake.y - 0.5, 1, 1);
    }
    
    this.ctx.restore();
  }

  updateSnowflake(snowflake) {
    // Update swing angle
    snowflake.angle += snowflake.swingSpeed;
    
    // Update position with swinging motion
    snowflake.y += snowflake.speedY * snowflake.depth;
    snowflake.x += snowflake.speedX + Math.sin(snowflake.angle) * snowflake.swing * 0.1;
    
    // Add gentle wind effect
    const wind = Math.sin(Date.now() * 0.0001) * 0.2;
    snowflake.x += wind * snowflake.depth;
    
    // Reset snowflake when it goes off screen
    if (snowflake.y > this.canvas.height + 10) {
      snowflake.y = -10;
      snowflake.x = Math.random() * this.canvas.width;
    }
    
    // Wrap horizontally
    if (snowflake.x > this.canvas.width + 10) {
      snowflake.x = -10;
    } else if (snowflake.x < -10) {
      snowflake.x = this.canvas.width + 10;
    }
  }

  animate() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and draw all snowflakes
    this.snowflakes.forEach(snowflake => {
      this.updateSnowflake(snowflake);
      this.drawSnowflake(snowflake);
    });
    
    // Continue animation
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  startAnimation() {
    this.animate();
  }

  handleResize() {
    // Debounce resize events
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      
      // Adjust snowflake count based on new screen size
      const targetCount = Math.floor((window.innerWidth * window.innerHeight) / 8000);
      const currentCount = this.snowflakes.length;
      
      if (targetCount > currentCount) {
        // Add more snowflakes
        for (let i = currentCount; i < targetCount; i++) {
          this.snowflakes.push(this.createSnowflake(true));
        }
      } else if (targetCount < currentCount) {
        // Remove excess snowflakes
        this.snowflakes = this.snowflakes.slice(0, targetCount);
      }
    }, 250);
  }

  handleScroll() {
    // Optional: Add subtle parallax effect based on scroll
    const scrollY = window.scrollY;
    this.snowflakes.forEach(snowflake => {
      // Deeper snowflakes (higher depth value) move more with scroll
      snowflake.y += scrollY * 0.0001 * snowflake.depth;
    });
  }
}

// Define the custom element
customElements.define('snowfall-effect', SnowfallEffect);

// Export for module systems (optional)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SnowfallEffect;
}
