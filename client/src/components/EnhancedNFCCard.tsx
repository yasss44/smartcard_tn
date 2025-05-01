import React, { useRef, useState, useEffect, Suspense } from 'react';
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
const FALLBACK_IMAGE = '/nfc-card-fallback.png';

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
      const cardY = canvas.height * 0.35;
      const textY = canvas.height * 0.7;

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

// NFC Ring Effect
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
    <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <ringGeometry args={[3.5, 3.8, 32]} />
      <meshBasicMaterial color="#3B82F6" transparent opacity={0} side={THREE.DoubleSide} />
    </mesh>
  );
};

// Holographic edge effect for the card
const HolographicEdge = ({ active }: { active: boolean }) => {
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

  // Animate edge glow
  useFrame(({ clock }) => {
    if (edgeRef.current && edgeRef.current.material) {
      const material = edgeRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
    }
  });

  return (
    <mesh ref={edgeRef} position={[0, 0, 0]}>
      <boxGeometry args={[10.44, 7.88, 0.12]} />
      <meshStandardMaterial
        color="#000000"
        emissive="#3B82F6"
        emissiveIntensity={0.5}
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
    <mesh ref={planeRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.0, 0]}>
      <planeGeometry args={[10, 10]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={40}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#0F172A"
        metalness={0.6}
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
  const [isDragging, setIsDragging] = useState(false);

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

  // Create holographic texture for the edge
  const [holographicTexture] = useState(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Create rainbow gradient
      const gradient = ctx.createLinearGradient(0, 0, 512, 512);
      gradient.addColorStop(0, '#3B82F6');
      gradient.addColorStop(0.33, '#8B5CF6');
      gradient.addColorStop(0.66, '#EC4899');
      gradient.addColorStop(1, '#3B82F6');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);
    }

    return new THREE.CanvasTexture(canvas);
  });

  // Animate holographic texture
  useFrame(({ clock }) => {
    holographicTexture.offset.x = Math.sin(clock.getElapsedTime() * 0.5) * 0.2;
    holographicTexture.offset.y = Math.cos(clock.getElapsedTime() * 0.5) * 0.2;
  });

  // Handle pointer down/up for drag detection
  const handlePointerDown = () => {
    setIsDragging(false);
  };

  const handlePointerUp = () => {
    if (!isDragging && meshRef.current) {
      handleTap();
    }
    setIsDragging(false);
  };

  const handlePointerMove = (e: THREE.Event) => {
    if (e.buttons > 0) {
      setIsDragging(true);
    }
  };

  return (
    <group ref={groupRef}>
      {/* NFC Ring Effect */}
      <NFCRingEffect active={tapped} />

      {/* Holographic Edge */}
      <HolographicEdge active={tapped} />

      {/* Main card */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[10.24, 7.68, 0.1]} />
        <meshPhysicalMaterial
          color="#0f172a"
          roughness={0.9}
          metalness={0.1}
          clearcoat={0.3}
          clearcoatRoughness={0.2}
          reflectivity={0.5}
          transparent={true}
          opacity={0.95}
        />

        {/* Card content - front side */}
        <group position={[0, 0, 0.03]}>
          {/* Logo */}
          <mesh position={[0, 2.5, 0.02]}>
            <planeGeometry args={[8, 2]} />
            <meshBasicMaterial transparent opacity={0.9}>
              <canvasTexture attach="map" image={createLogoTexture()} />
            </meshBasicMaterial>
          </mesh>

          {/* NFC icon */}
          <mesh position={[0, -1.0, 0.02]}>
            <circleGeometry args={[1.0, 32]} />
            <meshBasicMaterial color="#3B82F6" transparent opacity={0.8} />
          </mesh>

          {/* Tap to connect text */}
          <Text
            position={[0, -2.8, 0.02]}
            fontSize={0.4}
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
  canvas.width = 1024;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, 1024, 768);
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, 1024, 768);

    // Add gradient background for the text
    const gradient = ctx.createLinearGradient(0, 0, 1024, 0);
    gradient.addColorStop(0, '#3B82F6');
    gradient.addColorStop(0.5, '#8B5CF6');
    gradient.addColorStop(1, '#EC4899');

    // Draw Smart Card Tunisia text with shadow
    ctx.shadowColor = 'rgba(59, 130, 246, 0.6)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw "Smart Card" in blue
    ctx.font = 'bold 200px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#3B82F6';
    ctx.fillText('Smart Card', 360, 384);

    // Draw "Tunisia" in pink
    ctx.fillStyle = '#EC4899';
    ctx.fillText('Tunisia', 680, 384);

    // Add subtle glow effect
    ctx.shadowColor = 'rgba(236, 72, 153, 0.4)';
    ctx.shadowBlur = 30;

    // Add NFC icon
    ctx.beginPath();
    ctx.arc(512, 600, 60, 0, Math.PI * 2);
    ctx.fillStyle = '#3B82F6';
    ctx.fill();

    // Add rings around NFC icon
    ctx.beginPath();
    ctx.arc(512, 600, 80, 0, Math.PI * 2);
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  return canvas;
}

// 3D Card Component
const Card3D = ({ onTap }: { onTap: () => void }) => {
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Set touch-action to none for better touch handling
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.touchAction = 'none';
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
      ref={containerRef}
      className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      style={{ width: '582px', height: '550px', touchAction: 'none' }}
    >
      <Canvas
        dpr={1}
        camera={{ position: [8, 8, 8], fov: 60 }}
        gl={{ antialias: true }}
        onCreated={({ gl, size, viewport }) => {
          gl.setClearColor(0x000000, 0); // Transparent background
          gl.physicallyCorrectLights = true;

          // Force exact canvas dimensions and style
          const canvas = gl.domElement;
          canvas.width = 582;
          canvas.height = 550;

          // Set individual style properties instead of using setAttribute
          canvas.style.display = 'block';
          canvas.style.width = '582px';
          canvas.style.height = '550px';

          canvas.setAttribute('data-engine', 'three.js r175');
        }}
      >
        <color attach="background" args={[0, 0, 0, 0]} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} color="#3B82F6" intensity={0.5} />
        <pointLight position={[10, -5, -10]} color="#EC4899" intensity={0.3} />

        <Suspense fallback={null}>
          {/* Camera controls */}
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
            rotateSpeed={0.5}
            dampingFactor={0.1}
            enableDamping={true}
          />

          {/* Boundaries visualization */}
          <gridHelper args={[10, 10, 0x888888, 0x444444]} />
          <axesHelper args={[5]} />

          {/* Test cubes at different positions */}
          <mesh position={[3, 0, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>

          <mesh position={[0, 3, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>

          <mesh position={[0, 0, 3]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#0000ff" />
          </mesh>

          {/* Main card with floating effect */}
          <Float
            speed={1.5}
            rotationIntensity={0.1}
            floatIntensity={0.3}
            floatingRange={[-0.05, 0.05]}
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

// Main component
const EnhancedNFCCard: React.FC = () => {
  const [showNFCEffect, setShowNFCEffect] = useState(false);
  const getStartedBtnRef = useRef<HTMLAnchorElement>(null);
  const moreBtnRef = useRef<HTMLAnchorElement>(null);

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
    // Get Started button glow pulse
    const pulseAnimation = () => {
      if (getStartedBtnRef.current) {
        gsap.to(getStartedBtnRef.current, {
          boxShadow: '0 0 20px 5px rgba(59, 130, 246, 0.5)',
          duration: 1,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut',
          onComplete: () => {
            // Schedule next pulse
            setTimeout(pulseAnimation, 5000);
          }
        });
      }
    };

    // Start pulse animation
    pulseAnimation();

    // More button floating animation
    if (moreBtnRef.current) {
      gsap.to(moreBtnRef.current, {
        y: -5,
        duration: 1.5,
        yoyo: true,
        repeat: -1,
        ease: 'power1.inOut'
      });
    }

    // Cleanup
    return () => {
      gsap.killTweensOf(getStartedBtnRef.current);
      gsap.killTweensOf(moreBtnRef.current);
    };
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0F172A] to-[#1E293B]">
      {/* Connection nodes animation */}
      <ConnectionNodes />

      {/* NFC activation effect overlay */}
      {showNFCEffect && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500 rounded-full opacity-20 blur-xl animate-ping"></div>
        </div>
      )}

      <div className="container mx-auto px-4 py-16 relative z-1">
        <div className="flex flex-col items-center">
          {/* 3D Card container */}
          <div className="w-full h-full relative" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'auto', cursor: 'default' }}>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
            <div style={{ width: '100%', height: '100%' }}>
              <canvas data-engine="three.js r175" width="582" height="550" style={{ display: 'block', width: '582px', height: '550px' }}></canvas>
            </div>
          </div>

          {/* Content section */}
          <div className="max-w-3xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="neon-blue">Link</span><span className="neon-pink">Forge</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Create Your Digital Business Card
            </h2>
            <p className="text-xl mb-8">
              Design custom NFC business cards with our easy-to-use drag-and-drop editor.
              Share your contact info, social media, and more with a simple tap.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <a
                ref={getStartedBtnRef}
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </a>
              <a
                ref={moreBtnRef}
                href="/login"
                className="bg-transparent hover:bg-white/10 text-white border border-white/30 font-bold py-3 px-8 rounded-lg transition-all duration-300"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedNFCCard;
