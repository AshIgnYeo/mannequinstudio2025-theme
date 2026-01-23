import { useEffect, useRef } from "react";

// Bubble class for creating animated bubbles
class Bubble {
  constructor(canvas, spawnFromBottom = false) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    // Random size between 40 and 160 pixels
    this.baseRadius = Math.random() * 120 + 40;
    this.radius = 0; // Start at 0 for growth animation
    this.targetRadius = this.baseRadius;
    this.growthSpeed = 0.05;
    this.isGrowing = true;

    // Starting position
    if (spawnFromBottom) {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + this.baseRadius;
    } else {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
    }

    // Upward floating velocity with high variance
    this.upwardSpeed = Math.random() * 1.5 + 0.3; // 0.3 to 1.8 pixels per frame (much faster, wide variance)
    this.horizontalDrift = (Math.random() - 0.5) * 0.3; // Gentle horizontal drift

    // Current velocity
    this.vx = this.horizontalDrift;
    this.vy = -this.upwardSpeed;

    // Organic deformation properties - slower and more subtle
    this.deformX = 1;
    this.deformY = 1;
    this.deformSpeed = Math.random() * 0.008 + 0.003; // Much slower
    this.deformPhase = Math.random() * Math.PI * 2;
    this.deformOffset = Math.random() * Math.PI * 2; // Different starting points

    // Color with transparency
    const isPurple = Math.random() > 0.8;
    if (isPurple) {
      const red = Math.random() * 30 + 180;
      const green = Math.random() * 20 + 170;
      const blue = Math.random() * 30 + 200;
      this.color = `rgba(${red}, ${green}, ${blue}, 0.3)`;
    } else {
      const grayValue = Math.random() * 150 + 80;
      this.color = `rgba(${grayValue}, ${grayValue}, ${grayValue}, 0.3)`;
    }
  }

  update(scrollDirection = { x: 0, y: 0 }, scrollIntensity = 0) {
    // Handle growth animation
    if (this.isGrowing) {
      this.radius += this.growthSpeed * this.targetRadius;
      if (this.radius >= this.targetRadius) {
        this.radius = this.targetRadius;
        this.isGrowing = false;
      }
    }

    // Update velocity based on scroll - MUCH gentler reaction
    if (scrollIntensity > 0) {
      // Gentle scroll reaction: only 0.5x to 2.0x speed increase
      const scrollMultiplier = 0.5 + scrollIntensity * 1.5;
      this.vx = this.horizontalDrift - scrollDirection.x * scrollMultiplier * 0.3;
      this.vy = -this.upwardSpeed - scrollDirection.y * scrollMultiplier * 0.5;
    } else {
      // Smoothly return to default movement
      const returnSpeed = 0.05;
      this.vx += (this.horizontalDrift - this.vx) * returnSpeed;
      this.vy += (-this.upwardSpeed - this.vy) * returnSpeed;
    }

    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Wrap around horizontally instead of disappearing
    if (this.x + this.radius < 0) {
      this.x = this.canvas.width + this.radius;
    } else if (this.x - this.radius > this.canvas.width) {
      this.x = -this.radius;
    }

    // Only return offScreen if bubble goes off TOP
    if (this.y + this.radius < 0) {
      return "offScreen";
    }

    // Organic, subtle deformation using multiple sine waves
    this.deformPhase += this.deformSpeed;

    // Layer multiple slow sine waves for organic movement
    const wave1 = Math.sin(this.deformPhase);
    const wave2 = Math.sin(this.deformPhase * 0.7 + this.deformOffset);
    const wave3 = Math.cos(this.deformPhase * 1.3);

    // Very subtle deformation (max 15% instead of 30%)
    this.deformX = 1 + (wave1 * 0.1 + wave2 * 0.05);
    this.deformY = 1 + (wave3 * 0.1 + wave1 * 0.05);

    // Subtle size variation
    if (!this.isGrowing) {
      this.radius = this.targetRadius + Math.sin(this.deformPhase * 0.3) * 3;
    }
  }

  draw() {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.scale(this.deformX, this.deformY);

    // Main bubble body - subtle gradient from center to edge
    const bodyGradient = this.ctx.createRadialGradient(
      this.radius * 0.1,
      -this.radius * 0.1,
      0,
      0,
      0,
      this.radius
    );
    bodyGradient.addColorStop(0, this.color.replace("0.3", "0.15")); // Very transparent center
    bodyGradient.addColorStop(0.5, this.color.replace("0.3", "0.2"));
    bodyGradient.addColorStop(0.85, this.color.replace("0.3", "0.35")); // Slightly more opaque
    bodyGradient.addColorStop(1, this.color.replace("0.3", "0.08")); // Fade at edges

    this.ctx.fillStyle = bodyGradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Rim light effect (bubbles catch light on edges)
    const rimGradient = this.ctx.createRadialGradient(
      this.radius * 0.4,
      -this.radius * 0.4,
      this.radius * 0.3,
      this.radius * 0.4,
      -this.radius * 0.4,
      this.radius * 0.95
    );
    rimGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
    rimGradient.addColorStop(0.7, "rgba(255, 255, 255, 0.15)");
    rimGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    this.ctx.fillStyle = rimGradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Primary highlight (bright spot)
    const highlightGradient = this.ctx.createRadialGradient(
      -this.radius * 0.35,
      -this.radius * 0.35,
      0,
      -this.radius * 0.35,
      -this.radius * 0.35,
      this.radius * 0.4
    );
    highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.7)");
    highlightGradient.addColorStop(0.3, "rgba(255, 255, 255, 0.3)");
    highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    this.ctx.fillStyle = highlightGradient;
    this.ctx.beginPath();
    this.ctx.arc(
      -this.radius * 0.35,
      -this.radius * 0.35,
      this.radius * 0.4,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Secondary smaller highlight for depth
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    this.ctx.beginPath();
    this.ctx.arc(
      -this.radius * 0.25,
      -this.radius * 0.4,
      this.radius * 0.12,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Subtle reflection on opposite side
    const reflectionGradient = this.ctx.createRadialGradient(
      this.radius * 0.3,
      this.radius * 0.25,
      0,
      this.radius * 0.3,
      this.radius * 0.25,
      this.radius * 0.25
    );
    reflectionGradient.addColorStop(0, "rgba(255, 255, 255, 0.15)");
    reflectionGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    this.ctx.fillStyle = reflectionGradient;
    this.ctx.beginPath();
    this.ctx.arc(
      this.radius * 0.3,
      this.radius * 0.25,
      this.radius * 0.25,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    this.ctx.restore();
  }
}

// Custom hook for bubble animation
export const useBubbleAnimation = (options = {}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const bubblesRef = useRef([]);
  const scrollDirectionRef = useRef({ x: 0, y: 0 });
  const scrollIntensityRef = useRef(0);
  const lastScrollRef = useRef({ x: 0, y: 0 });
  const lastScrollTimeRef = useRef(Date.now());

  const {
    bubbleCount = 8,
    minBubbles = 6, // Always maintain at least this many bubbles
    background = "transparent",
    className = "",
    style = {},
  } = options;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Scroll tracking with reduced sensitivity
    const handleScroll = () => {
      const currentScroll = {
        x: window.scrollX,
        y: window.scrollY,
      };

      const deltaX = currentScroll.x - lastScrollRef.current.x;
      const deltaY = currentScroll.y - lastScrollRef.current.y;

      const currentTime = Date.now();
      const timeDelta = currentTime - lastScrollTimeRef.current;
      const scrollDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Much lower sensitivity
      const scrollSensitivity = 1.0; // Reduced from 4.0
      const intensitySensitivity = 0.3; // Reduced from 1.0

      if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
        scrollDirectionRef.current = {
          x: Math.max(-1, Math.min(1, deltaX * scrollSensitivity)),
          y: Math.max(-1, Math.min(1, deltaY * scrollSensitivity)),
        };
      }

      if (timeDelta > 0 && scrollDistance > 0) {
        const scrollSpeed = scrollDistance / timeDelta;
        scrollIntensityRef.current = Math.min(
          1,
          scrollSpeed * intensitySensitivity
        );
      }

      lastScrollRef.current = currentScroll;
      lastScrollTimeRef.current = currentTime;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Create initial bubbles
    bubblesRef.current = [];
    for (let i = 0; i < bubbleCount; i++) {
      bubblesRef.current.push(new Bubble(canvas, false));
    }

    // Function to maintain minimum bubble count
    const ensureMinimumBubbles = () => {
      while (bubblesRef.current.length < minBubbles) {
        bubblesRef.current.push(new Bubble(canvas, true));
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Gradual scroll intensity decay
      const currentTime = Date.now();
      const timeSinceLastScroll = currentTime - lastScrollTimeRef.current;

      if (timeSinceLastScroll > 50) {
        const decelerationRate = 0.03;
        scrollIntensityRef.current = Math.max(
          0,
          scrollIntensityRef.current - decelerationRate
        );
      }

      // Update and draw bubbles
      const bubblesToRemove = [];
      bubblesRef.current.forEach((bubble, index) => {
        const result = bubble.update(
          scrollDirectionRef.current,
          scrollIntensityRef.current
        );
        if (result === "offScreen") {
          bubblesToRemove.push(index);
        } else {
          bubble.draw();
        }
      });

      // Remove off-screen bubbles
      if (bubblesToRemove.length > 0) {
        bubblesToRemove.reverse().forEach((index) => {
          bubblesRef.current.splice(index, 1);
        });
      }

      // Ensure we always have minimum bubbles
      ensureMinimumBubbles();

      // Occasionally spawn new bubbles (if not at max)
      if (
        bubblesRef.current.length < bubbleCount &&
        Math.random() < 0.01 // 1% chance per frame (~every 1.5 seconds at 60fps)
      ) {
        bubblesRef.current.push(new Bubble(canvas, true));
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", handleScroll);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [bubbleCount, minBubbles]);

  return {
    canvasRef,
    canvasProps: {
      ref: canvasRef,
      className,
      style: {
        background,
        ...style,
      },
    },
  };
};

// Component for easy bubble animation integration
export const BubbleCanvas = ({
  bubbleCount = 8,
  minBubbles = 6,
  background = "transparent",
  className = "",
  style = {},
  ...props
}) => {
  const { canvasProps } = useBubbleAnimation({
    bubbleCount,
    minBubbles,
    background,
    className,
    style,
  });

  return <canvas {...canvasProps} {...props} />;
};

export default useBubbleAnimation;
