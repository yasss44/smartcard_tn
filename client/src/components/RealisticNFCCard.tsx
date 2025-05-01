import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Environment,
  ContactShadows,
  Text,
  Float,
  MeshReflectorMaterial,
  OrbitControls
} from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { gsap } from 'gsap';

// Fallback image for non-WebGL browsers
const FALLBACK_IMAGE = '/nfc-card-fallback.jpg';

// Card material types
type CardMaterial = 'matte' | 'gloss' | 'holographic';

// Card props interface
interface CardProps {
  material?: CardMaterial;
  color?: string;
  logo?: string;
  name?: string;
  title?: string;
  website?: string;
  autoRotate?: boolean;
  onTap?: () => void;
}

// Phone popup component
const PhonePopup = ({ visible, url }: { visible: boolean; url: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useEffect(() => {
    if (!groupRef.current) return;

    if (visible) {
      // Animate phone appearing
      gsap.to(groupRef.current.position, {
        y: 2,
        duration: 0.5,
        ease: 'power2.out'
      });
      gsap.to(groupRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.5,
        ease: 'back.out(1.7)'
      });
    } else {
      // Animate phone disappearing
      gsap.to(groupRef.current.position, {
        y: -2,
        duration: 0.3,
        ease: 'power2.in'
      });
      gsap.to(groupRef.current.scale, {
        x: 0.5,
        y: 0.5,
        z: 0.5,
        duration: 0.3,
        ease: 'power2.in'
      });
    }
  }, [visible]);

  // Initialize position
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.y = -2;
      groupRef.current.scale.set(0.5, 0.5, 0.5);
    }
  }, []);

  // Always face the camera
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, -2, 0]}
      scale={[0.5, 0.5, 0.5]}
    >
      {/* Phone frame */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 4, 0.2]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* Phone screen */}
      <mesh position={[0, 0, 0.11]}>
        <planeGeometry args={[1.8, 3.6]} />
        <meshBasicMaterial color="#0a0a0a">
          {/* We could load an actual screenshot texture here */}
          {/* <textureLoader attach="map" url={screenshotTexture} /> */}
        </meshBasicMaterial>
      </mesh>

      {/* Website URL */}
      <Text
        position={[0, 1.5, 0.12]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.6}
        textAlign="center"
      >
        {url}
      </Text>

      {/* Profile content mockup */}
      <mesh position={[0, 0, 0.12]}>
        <planeGeometry args={[1.6, 1.6]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>

      {/* Social buttons mockup */}
      {[-0.6, 0, 0.6].map((x, i) => (
        <mesh key={i} position={[x, -1.2, 0.12]}>
          <circleGeometry args={[0.2, 32]} />
          <meshBasicMaterial color={['#4267B2', '#1DA1F2', '#E1306C'][i]} />
        </mesh>
      ))}
    </group>
  );
};

// Card edge glow effect
const CardGlow = ({ active, color = '#3b82f6' }: { active: boolean; color?: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!meshRef.current || !meshRef.current.material) return;

    // Ensure material is properly typed
    const material = meshRef.current.material as THREE.MeshStandardMaterial;

    if (active) {
      // Pulse animation
      gsap.to(material, {
        emissiveIntensity: 2,
        duration: 0.5,
        yoyo: true,
        repeat: 3,
        ease: 'power2.inOut'
      });
    } else {
      // Reset
      gsap.to(material, {
        emissiveIntensity: 0.2,
        duration: 0.3
      });
    }
  }, [active]);

  // Initialize emissive intensity
  useEffect(() => {
    if (meshRef.current && meshRef.current.material) {
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
    }
  }, []);

  return (
    <mesh ref={meshRef} position={[0, 0, -0.03]} scale={[3.5, 2.2, 1]}>
      <planeGeometry />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.2}
        transparent
        opacity={0.1}
      />
    </mesh>
  );
};

// NFC Card model
const NFCCardModel = ({
  material = 'matte',
  color = '#0f172a',
  logo = '',
  name = 'John Doe',
  title = 'Software Engineer',
  website = 'smartcardtunisia.com/card/demo',
  onTap
}: CardProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  // Material properties based on card type
  const materialProps = {
    matte: { roughness: 0.9, metalness: 0.1, clearcoat: 0 },
    gloss: { roughness: 0.1, metalness: 0.2, clearcoat: 1 },
    holographic: { roughness: 0.3, metalness: 0.8, clearcoat: 1 }
  };

  // Handle hover effect with GSAP
  useEffect(() => {
    if (!meshRef.current) return;

    if (hovered) {
      gsap.to(meshRef.current.rotation, {
        x: -0.2,
        y: 0.1,
        duration: 0.5,
        ease: 'power2.out'
      });
    } else {
      gsap.to(meshRef.current.rotation, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'power2.out'
      });
    }
  }, [hovered]);

  // Handle tap effect
  const handleTap = () => {
    if (!meshRef.current) return;

    // Trigger tap animation
    setTapped(true);

    // Slight push down effect
    gsap.to(meshRef.current.position, {
      z: -0.1,
      duration: 0.1,
      ease: 'power2.in',
      onComplete: () => {
        gsap.to(meshRef.current.position, {
          z: 0,
          duration: 0.2,
          ease: 'power2.out',
          onComplete: () => {
            // Show phone popup after tap animation
            setShowPhone(true);

            // Call the onTap callback if provided
            if (onTap) onTap();

            // Reset tapped state after animation
            setTimeout(() => {
              setTapped(false);

              // Hide phone after a few seconds
              setTimeout(() => {
                setShowPhone(false);
              }, 5000);
            }, 500);
          }
        });
      }
    });
  };

  // Create holographic effect for holographic cards
  const [holographicTexture] = useState(() => {
    if (material !== 'holographic') return null;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Create rainbow gradient
      const gradient = ctx.createLinearGradient(0, 0, 512, 512);
      gradient.addColorStop(0, '#ff00ff');
      gradient.addColorStop(0.33, '#00ffff');
      gradient.addColorStop(0.66, '#ffff00');
      gradient.addColorStop(1, '#ff00ff');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);
    }

    return new THREE.CanvasTexture(canvas);
  });

  // Animate holographic effect
  useFrame(({ clock }) => {
    if (material === 'holographic' && holographicTexture) {
      holographicTexture.offset.x = Math.sin(clock.getElapsedTime() * 0.5) * 0.2;
      holographicTexture.offset.y = Math.cos(clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  return (
    <group>
      {/* Card glow effect */}
      <CardGlow active={tapped} color={color} />

      {/* Main card */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleTap}
        castShadow
        receiveShadow
      >
        {/* Card geometry */}
        <boxGeometry args={[3.4, 2.1, 0.05]} />

        {/* Card material based on type */}
        <meshPhysicalMaterial
          color={color}
          {...materialProps[material]}
          map={material === 'holographic' ? holographicTexture : undefined}
          transparent={true}
          opacity={0.95}
        />

        {/* Card content - front side */}
        <group position={[0, 0, 0.03]}>
          {/* Logo */}
          {logo && (
            <mesh position={[0, 0.7, 0.01]}>
              <planeGeometry args={[1, 0.5]} />
              <meshBasicMaterial transparent>
                {/* We would load the actual logo texture here */}
                {/* <textureLoader attach="map" url={logo} /> */}
              </meshBasicMaterial>
            </mesh>
          )}

          {/* Name */}
          <Text
            position={[0, 0.2, 0.01]}
            fontSize={0.25}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            maxWidth={3}
            textAlign="center"
          >
            {name}
          </Text>

          {/* Title/Position */}
          <Text
            position={[0, -0.1, 0.01]}
            fontSize={0.15}
            color="#aaaaaa"
            anchorX="center"
            anchorY="middle"
            maxWidth={3}
            textAlign="center"
          >
            {title}
          </Text>

          {/* NFC icon */}
          <mesh position={[0, -0.5, 0.01]}>
            <circleGeometry args={[0.2, 32]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.8} />
          </mesh>

          {/* Tap to connect text */}
          <Text
            position={[0, -0.8, 0.01]}
            fontSize={0.1}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            Tap to connect
          </Text>
        </group>

        {/* Card content - back side */}
        <group position={[0, 0, -0.03]} rotation={[0, Math.PI, 0]}>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.15}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            Scan NFC or visit
          </Text>

          <Text
            position={[0, -0.3, 0.01]}
            fontSize={0.12}
            color="#3b82f6"
            anchorX="center"
            anchorY="middle"
          >
            {website}
          </Text>
        </group>
      </mesh>

      {/* Phone popup */}
      <PhonePopup visible={showPhone} url={website} />
    </group>
  );
};

// Main component with customization options
interface RealisticNFCCardProps {
  material?: CardMaterial;
  color?: string;
  logo?: string;
  name?: string;
  title?: string;
  website?: string;
  autoRotate?: boolean;
  onTap?: () => void;
}

const RealisticNFCCard: React.FC<RealisticNFCCardProps> = (props) => {
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [loading, setLoading] = useState(true);

  // Check WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setWebGLSupported(!!gl);
    } catch (e) {
      setWebGLSupported(false);
    }

    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
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

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-pulse text-blue-500">Loading 3D Card...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" style={{ touchAction: 'none' }}>
      {/* Ambient glow effects */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-500 rounded-full opacity-20 blur-xl animate-pulse"></div>

      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 45 }}>
        <color attach="background" args={['transparent']} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} color="#ff00ff" intensity={0.5} />

        <Suspense fallback={null}>
          {/* Auto-rotate controls if enabled */}
          {props.autoRotate && (
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={1}
            />
          )}

          {/* Main card with floating effect */}
          <Float
            speed={2}
            rotationIntensity={0.2}
            floatIntensity={0.5}
            floatingRange={[-0.1, 0.1]}
          >
            <NFCCardModel {...props} />
          </Float>

          {/* Reflective surface under the card */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
            <planeGeometry args={[10, 10]} />
            <MeshReflectorMaterial
              blur={[300, 100]}
              resolution={1024}
              mixBlur={1}
              mixStrength={50}
              roughness={1}
              depthScale={1.2}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color="#050505"
              metalness={0.5}
            />
          </mesh>

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

export default RealisticNFCCard;
