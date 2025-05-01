import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Environment,
  ContactShadows,
  Text,
  Float,
  MeshReflectorMaterial,
  OrbitControls,
  useTexture,
  PerspectiveCamera
} from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { gsap } from 'gsap';

// Fallback image for non-WebGL browsers
const FALLBACK_IMAGE = '/nfc-card-fallback.jpg';

// Connection nodes animation component
const ConnectionNodes = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const textPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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

      // Update positions based on viewport
      const centerX = canvas.width / 2;
      const cardY = canvas.height * 0.45; // Card is now higher in the viewport
      const textY = canvas.height * 0.85; // Text is at the bottom

      cardPositionRef.current = { x: centerX, y: cardY };
      textPositionRef.current = { x: centerX, y: textY };
    };

    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);

    // Node properties
    const nodeCount = 30;
    const nodes: {
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      direction: number;
      connectToCard: boolean;
    }[] = [];

    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.5 + 0.1,
        direction: Math.random() * Math.PI * 2,
        connectToCard: Math.random() > 0.5
      });
    }

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      nodes.forEach(node => {
        // Move node
        node.x += Math.cos(node.direction) * node.speed;
        node.y += Math.sin(node.direction) * node.speed;

        // Wrap around edges
        if (node.x < 0) node.x = canvas.width;
        if (node.x > canvas.width) node.x = 0;
        if (node.y < 0) node.y = canvas.height;
        if (node.y > canvas.height) node.y = 0;

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${node.opacity})`;
        ctx.fill();

        // Draw connection line to card or text
        const targetPosition = node.connectToCard
          ? cardPositionRef.current
          : textPositionRef.current;

        const distance = Math.sqrt(
          Math.pow(node.x - targetPosition.x, 2) +
          Math.pow(node.y - targetPosition.y, 2)
        );

        // Only draw connection if within range
        if (distance < 200) {
          const opacity = 0.2 * (1 - distance / 200);
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(targetPosition.x, targetPosition.y);
          ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
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
      className="absolute inset-0 z-0 opacity-30"
    />
  );
};

// NFC Card Ring Effect
const NFCRingEffect = ({ active }: { active: boolean }) => {
  const ringRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!ringRef.current) return;

    if (active) {
      // Reset scale and opacity
      gsap.set(ringRef.current.scale, { x: 1, y: 1, z: 1 });
      gsap.set(ringRef.current.material, { opacity: 0.8 });

      // Animate ring expanding and fading
      gsap.to(ringRef.current.scale, {
        x: 2,
        y: 2,
        z: 2,
        duration: 1,
        ease: 'power2.out'
      });

      gsap.to(ringRef.current.material, {
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
      });
    }
  }, [active]);

  return (
    <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.025, 0]}>
      <ringGeometry args={[1.1, 1.2, 32]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0} side={THREE.DoubleSide} />
    </mesh>
  );
};

// Edge effect for the card
const CardEdge = ({ active }: { active: boolean }) => {
  const edgeRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!edgeRef.current) return;

    if (active) {
      gsap.to(edgeRef.current.material, {
        emissiveIntensity: 1.5,
        duration: 0.5,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    }
  }, [active]);

  return (
    <mesh ref={edgeRef} position={[0, 0, 0]}>
      <boxGeometry args={[5.5, 3.4, 0.06]} />
      <meshStandardMaterial
        color="#000000"
        emissive="#ffffff"
        emissiveIntensity={0.2}
        transparent
        opacity={0.9}
        side={THREE.BackSide}
      />
    </mesh>
  );
};

// Reflection plane that responds to mouse position
const DynamicReflectionPlane = () => {
  const planeRef = useRef<THREE.Mesh>(null);
  const { mouse } = useThree();

  useFrame(() => {
    if (planeRef.current) {
      // Adjust reflection plane based on mouse position
      planeRef.current.rotation.x = -Math.PI / 2 + mouse.y * 0.2;
      planeRef.current.rotation.y = mouse.x * 0.2;
    }
  });

  return (
    <mesh ref={planeRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
      <planeGeometry args={[10, 10]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={30}
        roughness={0.8}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#0F172A"
        metalness={0.7}
      />
    </mesh>
  );
};

// NFC Card model
const NFCCardModel = ({ onTap }: { onTap: () => void }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [isRotating, setIsRotating] = useState(true);

  // Handle hover effect
  useEffect(() => {
    if (!meshRef.current) return;

    if (hovered) {
      setIsRotating(false);
      gsap.to(meshRef.current.rotation, {
        x: -0.1,
        duration: 0.5,
        ease: 'power2.out'
      });
    } else {
      setIsRotating(true);
    }
  }, [hovered]);

  // Auto-rotation (20s full rotation)
  useFrame(({ clock }) => {
    if (meshRef.current && isRotating) {
      meshRef.current.rotation.y = clock.getElapsedTime() * (Math.PI / 10); // 2π / 20s = π/10 rad/s
    }
  });

  // Handle device orientation for gyro effect
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (!groupRef.current || !event.beta || !event.gamma) return;

      // Convert degrees to radians and limit the range
      const betaRadians = THREE.MathUtils.degToRad(Math.min(Math.max(event.beta, -30), 30));
      const gammaRadians = THREE.MathUtils.degToRad(Math.min(Math.max(event.gamma, -30), 30));

      // Apply smooth rotation
      gsap.to(groupRef.current.rotation, {
        x: betaRadians * 0.1, // Tilt forward/backward
        y: gammaRadians * 0.1, // Tilt left/right
        duration: 0.5,
        ease: 'power2.out'
      });
    };

    // Add event listener for device orientation
    window.addEventListener('deviceorientation', handleOrientation);

    // Cleanup
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Handle tap effect
  const handleTap = () => {
    if (!meshRef.current) return;

    // Trigger tap animation
    setTapped(true);

    // Elevate card
    gsap.to(meshRef.current.position, {
      y: 0.2,
      duration: 0.3,
      ease: 'power2.out',
      onComplete: () => {
        // Return to original position
        gsap.to(meshRef.current.position, {
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)',
          delay: 0.2
        });

        // Call the onTap callback
        onTap();

        // Reset tapped state after animation
        setTimeout(() => {
          setTapped(false);
        }, 1000);
      }
    });
  };

  return (
    <group ref={groupRef}>
      {/* NFC Ring Effect */}
      <NFCRingEffect active={tapped} />

      {/* Card Edge */}
      <CardEdge active={tapped} />

      {/* Main card */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleTap}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[5.4, 3.3, 0.05]} />
        <meshPhysicalMaterial
          color="#0f172a"
          roughness={0.7}
          metalness={0.2}
          clearcoat={0.4}
          clearcoatRoughness={0.1}
          reflectivity={0.6}
          transparent={true}
          opacity={0.98}
        />

        {/* Card content - front side */}
        <group position={[0, 0, 0.03]}>
          {/* Logo */}
          <mesh position={[0, 1.0, 0.01]}>
            <planeGeometry args={[3, 0.7]} />
            <meshBasicMaterial transparent opacity={0.9}>
              <canvasTexture attach="map" image={createLogoTexture()} />
            </meshBasicMaterial>
          </mesh>

          {/* NFC icon */}
          <mesh position={[0, -0.5, 0.01]}>
            <circleGeometry args={[0.4, 32]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
          </mesh>

          {/* Tap to connect text */}
          <Text
            position={[0, -1.1, 0.01]}
            fontSize={0.18}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            Tap to connect
          </Text>
        </group>
      </mesh>
    </group>
  );
};

// Create logo texture
function createLogoTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, 512, 128);
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, 512, 128);

    // Draw Smart Card Tunisia text
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw "Smart Card" in white
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Smart Card', 180, 64);

    // Draw "Tunisia" in white
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Tunisia', 340, 64);
  }

  return canvas;
}

// 3D Card Component
const Card3D = ({ onTap }: { onTap: () => void }) => {
  const [loaded, setLoaded] = useState(false);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // WebGL detection
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setWebGLSupported(!!gl);
    } catch (e) {
      setWebGLSupported(false);
    }
  }, []);

  // Fallback to static image if WebGL is not supported
  if (!webGLSupported) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <img
          src={FALLBACK_IMAGE}
          alt="NFC Business Card"
          className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
        />
      </div>
    );
  }

  return (
    <div
      className={`w-full h-full transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      style={{ touchAction: 'none' }}
    >
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 45 }}>
        <color attach="background" args={[0, 0, 0, 0]} />

        {/* Lighting */}
        <ambientLight intensity={0.7} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.2} castShadow />
        <pointLight position={[-10, -10, -10]} color="#ffffff" intensity={0.7} />
        <pointLight position={[10, -5, -10]} color="#ffffff" intensity={0.5} />

        <Suspense fallback={null}>
          {/* Main card with floating effect */}
          <Float
            speed={1.5}
            rotationIntensity={0.1}
            floatIntensity={0.2}
            floatingRange={[-0.03, 0.03]}
            position={[0, 0, 0]}
          >
            <NFCCardModel onTap={onTap} />
          </Float>

          {/* Dynamic reflection plane */}
          <DynamicReflectionPlane />

          {/* Environment lighting */}
          <Environment preset="city" />
        </Suspense>

        {/* Post-processing effects */}
        <EffectComposer>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            blendFunction={BlendFunction.SCREEN}
          />
          <ChromaticAberration
            offset={[0.0005, 0.0005]}
            blendFunction={BlendFunction.NORMAL}
            radialModulation={true}
            modulationOffset={0.5}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

// Main hero section component
const EnhancedHeroSection: React.FC = () => {
  const [showNFCEffect, setShowNFCEffect] = useState(false);

  // Handle card tap
  const handleCardTap = () => {
    setShowNFCEffect(true);

    // Reset after animation completes
    setTimeout(() => {
      setShowNFCEffect(false);
    }, 2000);
  };

  // Setup button animations
  useEffect(() => {
    // Add button hover effects with JavaScript for better performance
    const buttons = document.querySelectorAll('.hero-button');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', () => {
        gsap.to(button, {
          scale: 1.05,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      button.addEventListener('mouseleave', () => {
        gsap.to(button, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });

    // Cleanup
    return () => {
      buttons.forEach(button => {
        button.removeEventListener('mouseenter', () => {});
        button.removeEventListener('mouseleave', () => {});
      });
    };
  }, []);

  return (
    <section className="relative h-screen overflow-hidden bg-gradient-to-b from-[#0F172A] to-[#1E293B]">
      {/* NFC activation effect overlay */}
      {showNFCEffect && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500 rounded-full opacity-20 blur-xl animate-ping"></div>
        </div>
      )}

      {/* Full-screen 3D Card container */}
      <div className="absolute inset-0 z-[1]">
        <Card3D onTap={handleCardTap} />
      </div>

      {/* Content overlay at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/90 to-transparent pt-16 pb-6 z-[2]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="neon-blue">Smart Card</span><span className="neon-pink"> Tunisia</span>
            </h1>
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              Create Your Digital Business Card
            </h2>
            <p className="text-lg mb-4">
              Design custom NFC business cards with our easy-to-use drag-and-drop editor.
              Share your contact info, social media, and more with a simple tap.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Link
                to="/register"
                className="hero-button bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="hero-button bg-transparent hover:bg-white/10 text-white border border-white/30 font-bold py-2 px-6 rounded-lg transition-all duration-300 hover:border-white/50"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedHeroSection;
