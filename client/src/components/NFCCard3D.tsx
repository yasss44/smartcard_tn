import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PresentationControls, Environment, ContactShadows, Text, Center, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Social Media Icon component
function SocialIcon({ position, color, icon, scale = 0.2, onClick }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Hover animation
      if (hovered) {
        meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, scale * 1.2, 0.1);
        meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, scale * 1.2, 0.1);
        meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, scale * 1.2, 0.1);
      } else {
        meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, scale, 0.1);
        meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, scale, 0.1);
        meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, scale, 0.1);
      }

      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.5 + position[0]) * 0.05;

      // Rotation animation
      meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  // Create a canvas texture for the icon
  const createIconTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Fill background with the icon color
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 128, 128);

      // Draw icon symbol in white
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 64px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, 64, 64);
    }

    return canvas;
  };

  return (
    <mesh
      position={position}
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onClick}
      scale={[scale, scale, scale]}
    >
      <boxGeometry args={[1, 1, 0.1]} />
      <meshStandardMaterial
        color={color}
        roughness={0.1}
        metalness={0.8}
        emissive={color}
        emissiveIntensity={hovered ? 0.5 : 0.2}
        transparent={true}
        opacity={0.95}
      />

      {/* Icon on the front face */}
      <mesh position={[0, 0, 0.051]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial transparent opacity={1}>
          <canvasTexture attach="map" image={createIconTexture()} />
        </meshBasicMaterial>
      </mesh>
    </mesh>
  );
}

// Card model component
function CardModel(props: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [rotateY, setRotateY] = useState(0);

  // Animate the card
  useFrame((state) => {
    if (meshRef.current) {
      // Add subtle floating animation
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.05;

      // Smooth rotation
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, rotateY, 0.05);

      // Add glow effect when hovered
      if (hovered) {
        meshRef.current.material.emissive = new THREE.Color(0x3b82f6);
        meshRef.current.material.emissiveIntensity = 0.5 + Math.sin(state.clock.getElapsedTime() * 3) * 0.2;
      } else {
        meshRef.current.material.emissiveIntensity = 0.2 + Math.sin(state.clock.getElapsedTime()) * 0.1;
      }
    }
  });

  // Handle card click to flip
  const handleCardClick = () => {
    setRotateY(rotateY === 0 ? Math.PI : 0);
  };

  // Social media icon click handlers
  const handleIconClick = (platform: string) => {
    console.log(`Clicked on ${platform}`);

    // Open corresponding social media links
    const urls: {[key: string]: string} = {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
      netflix: 'https://netflix.com',
      spotify: 'https://spotify.com',
      discord: 'https://discord.com',
      tiktok: 'https://tiktok.com'
    };

    // Open in a new tab
    if (urls[platform]) {
      window.open(urls[platform], '_blank');
    }
  };

  return (
    <group {...props}>
      {/* Main card */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleCardClick}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[3.4, 2.1, 0.05]} />
        <meshStandardMaterial
          color={hovered ? "#ec4899" : "#0f172a"}
          roughness={0.1}
          metalness={0.8}
          emissive={"#3b82f6"}
          emissiveIntensity={0.2}
          transparent={true}
          opacity={0.9}
        />

        {/* Front side of card */}
        <group position={[0, 0, 0.03]} rotation={[0, 0, 0]}>
          {/* Card title */}
          <group position={[0, 0.7, 0.01]}>
            <Text
              position={[-0.4, 0, 0]}
              fontSize={0.25}
              color="#3b82f6"
              anchorX="center"
              anchorY="middle"
              characters="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>/?'"
            >
              Link
            </Text>

            <Text
              position={[0.8, 0, 0]}
              fontSize={0.25}
              color="#ec4899"
              anchorX="center"
              anchorY="middle"
              characters="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>/?'"
            >
              Forge
            </Text>
          </group>

          {/* Social media icons */}
          <SocialIcon position={[-1.2, 0, 0.01]} color="#4267B2" icon="f" onClick={() => handleIconClick('facebook')} />
          <SocialIcon position={[-0.4, 0, 0.01]} color="#1DA1F2" icon="t" onClick={() => handleIconClick('twitter')} />
          <SocialIcon position={[0.4, 0, 0.01]} color="#E1306C" icon="I" onClick={() => handleIconClick('instagram')} />
          <SocialIcon position={[1.2, 0, 0.01]} color="#FF0000" icon="N" onClick={() => handleIconClick('netflix')} />

          {/* Second row of icons */}
          <SocialIcon position={[-0.8, -0.3, 0.01]} color="#1DB954" icon="S" onClick={() => handleIconClick('spotify')} />
          <SocialIcon position={[0, -0.3, 0.01]} color="#7289DA" icon="D" onClick={() => handleIconClick('discord')} />
          <SocialIcon position={[0.8, -0.3, 0.01]} color="#EE1D52" icon="T" onClick={() => handleIconClick('tiktok')} />

          {/* Tap to connect text */}
          <mesh position={[0, -0.7, 0.01]}>
            <planeGeometry args={[1.5, 0.2]} />
            <meshBasicMaterial transparent opacity={0.5} color="#000000" />
          </mesh>
          <Text
            position={[0, -0.7, 0.02]}
            fontSize={0.08}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            characters="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>/?'"
          >
            Tap to connect
          </Text>
        </group>

        {/* Back side of card */}
        <group position={[0, 0, -0.03]} rotation={[0, Math.PI, 0]}>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[2.5, 0.3]} />
            <meshBasicMaterial transparent opacity={0.4} color="#000000" />
          </mesh>
          <Text
            position={[0, 0, 0.02]}
            fontSize={0.12}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            characters="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>/?'"
          >
            Scan NFC or visit
          </Text>

          <mesh position={[0, -0.3, 0.01]}>
            <planeGeometry args={[2.5, 0.3]} />
            <meshBasicMaterial transparent opacity={0.4} color="#000000" />
          </mesh>
          <Text
            position={[0, -0.3, 0.02]}
            fontSize={0.1}
            color="#06b6d4"
            anchorX="center"
            anchorY="middle"
            characters="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>/?'"
          >
            linkforge.com/card/demo
          </Text>
        </group>
      </mesh>
    </group>
  );
}



// Main component
const NFCCard3D: React.FC = () => {
  // Create refs to track component state
  const isMounted = useRef(false);
  const domElementRef = useRef<HTMLElement | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    isMounted.current = true;

    // Get the container element
    domElementRef.current = document.querySelector('.nfc-card-container');

    // Make sure touch-action is set to none
    if (domElementRef.current) {
      domElementRef.current.style.touchAction = 'none';
    }

    // Hide instructions after 5 seconds
    const timer = setTimeout(() => {
      if (isMounted.current) {
        setShowInstructions(false);
      }
    }, 5000);

    return () => {
      isMounted.current = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="w-full h-full relative" style={{ touchAction: 'none' }}>
      {/* Glow effects */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-500 rounded-full opacity-20 blur-xl animate-pulse"></div>

      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 45 }}>
        <color attach="background" args={[0, 0, 0, 0]} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <Suspense fallback={null}>
          <PresentationControls
            global
            rotation={[0, 0, 0]}
            polar={[-Math.PI / 4, Math.PI / 4]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
            config={{ mass: 2, tension: 400 }}
            snap={{ mass: 4, tension: 400 }}
            domElement={domElementRef.current}
          >
            <CardModel position={[0, 0, 0]} rotation={[0, 0, 0]} />
          </PresentationControls>
          <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={5} blur={2.5} far={4} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>

      {/* Instructions overlay */}
      {showInstructions && (
        <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-white bg-black bg-opacity-50 py-2 px-4 rounded-md mx-auto max-w-xs animate-fade-in-out">
          Click to flip • Drag to rotate • Click icons to visit
        </div>
      )}
    </div>
  );
};

export default NFCCard3D;
