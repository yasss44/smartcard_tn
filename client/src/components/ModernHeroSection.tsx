import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import RealisticNFCCard from './RealisticNFCCard';

// Particle animation component
const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);

    // Particle properties
    const particleCount = 100;
    const particles: {
      x: number;
      y: number;
      radius: number;
      color: string;
      speed: number;
      direction: number;
      opacity: number;
    }[] = [];

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.5,
        color: '#3B82F6',
        speed: Math.random() * 0.2 + 0.1,
        direction: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach(particle => {
        // Move particle
        particle.x += Math.cos(particle.direction) * particle.speed;
        particle.y += Math.sin(particle.direction) * particle.speed;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full z-0 opacity-30"
    />
  );
};

// Phone mockup component
const PhoneMockup = ({ visible, url }: { visible: boolean; url: string }) => {
  const phoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!phoneRef.current) return;

    if (visible) {
      gsap.fromTo(
        phoneRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
    } else {
      gsap.to(phoneRef.current, {
        y: 100,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in'
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={phoneRef}
      className="absolute bottom-24 right-8 md:right-16 lg:right-24 z-30 transform transition-all duration-300"
      style={{ perspective: '1000px' }}
    >
      <div className="relative w-[200px] h-[400px] bg-gray-900 rounded-3xl overflow-hidden shadow-xl border border-gray-800">
        {/* Phone notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-10"></div>

        {/* Phone screen */}
        <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black p-3 pt-8">
          {/* Profile header */}
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xl font-bold">
              {url.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-white text-lg font-bold">{url.split('/').pop()}</h3>
            <p className="text-gray-400 text-xs">Digital Business Card</p>
          </div>

          {/* Social links */}
          <div className="flex justify-center space-x-3 mb-4">
            {['#4267B2', '#1DA1F2', '#E1306C'].map((color, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: color }}
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" clipRule="evenodd" />
                </svg>
              </div>
            ))}
          </div>

          {/* Contact buttons */}
          <div className="space-y-2">
            <div className="bg-gray-800 rounded-lg p-3 flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-white text-sm">Email</span>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="text-white text-sm">Phone</span>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 flex items-center">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <span className="text-white text-sm">Website</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main hero section component
const ModernHeroSection: React.FC = () => {
  const [showPhone, setShowPhone] = useState(false);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle card tap
  const handleCardTap = () => {
    setShowPhone(true);

    // Hide phone after 5 seconds
    setTimeout(() => {
      setShowPhone(false);
    }, 5000);
  };

  // Setup edge glow pulse animation
  useEffect(() => {
    const startPulseAnimation = () => {
      if (!cardContainerRef.current) return;

      // Add pulse class
      cardContainerRef.current.classList.add('pulse-glow');

      // Remove pulse class after animation completes
      setTimeout(() => {
        if (cardContainerRef.current) {
          cardContainerRef.current.classList.remove('pulse-glow');
        }
      }, 2000);

      // Schedule next pulse
      pulseTimeoutRef.current = setTimeout(startPulseAnimation, 5000);
    };

    // Start pulse animation
    startPulseAnimation();

    // Cleanup
    return () => {
      if (pulseTimeoutRef.current) {
        clearTimeout(pulseTimeoutRef.current);
      }
    };
  }, []);

  // Handle mouse move for card tilt
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardContainerRef.current) return;

    const rect = cardContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate tilt values
    const tiltX = (y / rect.height - 0.5) * 20;
    const tiltY = (x / rect.width - 0.5) * -20;

    // Apply tilt with GSAP
    gsap.to(cardContainerRef.current, {
      rotationX: tiltX,
      rotationY: tiltY,
      duration: 0.5,
      ease: 'power2.out'
    });
  };

  // Reset tilt on mouse leave
  const handleMouseLeave = () => {
    if (!cardContainerRef.current) return;

    gsap.to(cardContainerRef.current, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.5,
      ease: 'power2.out'
    });
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0F172A] flex flex-col justify-center items-center">
      {/* Particle background */}
      <ParticleBackground />

      {/* Main content */}
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
        {/* 3D Card container */}
        <div
          ref={cardContainerRef}
          className="w-full max-w-md h-[500px] mx-auto mb-16 relative transform-gpu"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="w-full h-full">
            <RealisticNFCCard
              material="holographic"
              color="#0f172a"
              name="Your Name"
              title="Your Position"
              website="smartcardtunisia.com/yourname"
              autoRotate={false}
              onTap={handleCardTap}
            />
          </div>
        </div>

        {/* Phone mockup */}
        <PhoneMockup visible={showPhone} url="smartcardtunisia.com/yourname" />
      </div>

      {/* Bottom text overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0F172A] to-transparent pt-20 pb-8 z-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 font-['Manrope']">
              <span className="text-white">Smart Card Tunisia – </span>
              <span className="text-[#3B82F6]">Create Your Digital Business Card</span>
            </h1>

            <p className="text-gray-300 text-lg md:text-xl mb-6 max-w-2xl font-light">
              Share your professional profile with a simple tap. Our NFC cards connect the physical and digital worlds seamlessly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="bg-[#3B82F6] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 uppercase tracking-wide"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="bg-transparent hover:bg-white/10 text-white border border-white/30 font-bold py-3 px-6 rounded-lg transition-all duration-300 uppercase tracking-wide"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for pulse glow effect */}
      <style jsx>{`
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 5px 0px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 20px 5px rgba(59, 130, 246, 0.8); }
          100% { box-shadow: 0 0 5px 0px rgba(59, 130, 246, 0.5); }
        }

        .pulse-glow {
          animation: pulse-glow 2s ease-in-out;
        }
      `}</style>
    </section>
  );
};

export default ModernHeroSection;
