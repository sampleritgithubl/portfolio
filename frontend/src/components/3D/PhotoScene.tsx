import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

function PhotoCard() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Load the profile texture
  const texture = useTexture('/images/kavindu.jpg');
  
  // Configure texture parameters
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  useFrame((state) => {
    if (groupRef.current) {
      // Smooth dynamic rotation based on cursor position
      const targetRotateY = (state.pointer.x * Math.PI) / 6; // max 30 degrees Y rotation
      const targetRotateX = (-state.pointer.y * Math.PI) / 8; // max 22.5 degrees X rotation

      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotateY,
        0.08
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotateX,
        0.08
      );

      // Smooth hover float animation (sinusoidal y-axis offset)
      const time = state.clock.getElapsedTime();
      groupRef.current.position.y = Math.sin(time * 1.5) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* ── Outer Glowing Backplate Aura ── */}
      <mesh position={[0, 0, -0.08]}>
        <planeGeometry args={[3.4, 4.4]} />
        <meshBasicMaterial
          color="#8B5CF6"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ── Main Heavy 3D Glass/Metal Backplate ── */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.2, 4.2, 0.12]} />
        <meshPhysicalMaterial
          color="#0d1526"
          roughness={0.2}
          metalness={0.8}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          transmission={0.4}
          thickness={0.5}
        />
      </mesh>

      {/* ── Cyan Neon Border Accent (Glow Ring) ── */}
      <mesh position={[0, 0, 0.062]}>
        <planeGeometry args={[3.06, 4.06]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.7} />
      </mesh>

      {/* ── Inner Photo Frame Backing ── */}
      <mesh position={[0, 0, 0.063]}>
        <planeGeometry args={[3.0, 4.0]} />
        <meshBasicMaterial color="#060918" />
      </mesh>

      {/* ── The Photo Texture Plane ── */}
      <mesh position={[0, 0, 0.064]}>
        <planeGeometry args={[2.92, 3.92]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      {/* ── Corner Cyberpunk Brackets (HUD decoration) ── */}
      {/* Top Left Bracket */}
      <mesh position={[-1.4, 1.9, 0.068]}>
        <boxGeometry args={[0.2, 0.04, 0.01]} />
        <meshBasicMaterial color="#00D4FF" />
      </mesh>
      <mesh position={[-1.48, 1.82, 0.068]}>
        <boxGeometry args={[0.04, 0.2, 0.01]} />
        <meshBasicMaterial color="#00D4FF" />
      </mesh>

      {/* Top Right Bracket */}
      <mesh position={[1.4, 1.9, 0.068]}>
        <boxGeometry args={[0.2, 0.04, 0.01]} />
        <meshBasicMaterial color="#00D4FF" />
      </mesh>
      <mesh position={[1.48, 1.82, 0.068]}>
        <boxGeometry args={[0.04, 0.2, 0.01]} />
        <meshBasicMaterial color="#00D4FF" />
      </mesh>

      {/* Bottom Left Bracket */}
      <mesh position={[-1.4, -1.9, 0.068]}>
        <boxGeometry args={[0.2, 0.04, 0.01]} />
        <meshBasicMaterial color="#00D4FF" />
      </mesh>
      <mesh position={[-1.48, -1.82, 0.068]}>
        <boxGeometry args={[0.04, 0.2, 0.01]} />
        <meshBasicMaterial color="#00D4FF" />
      </mesh>

      {/* Bottom Right Bracket */}
      <mesh position={[1.4, -1.9, 0.068]}>
        <boxGeometry args={[0.2, 0.04, 0.01]} />
        <meshBasicMaterial color="#00D4FF" />
      </mesh>
      <mesh position={[1.48, -1.82, 0.068]}>
        <boxGeometry args={[0.04, 0.2, 0.01]} />
        <meshBasicMaterial color="#00D4FF" />
      </mesh>
    </group>
  );
}

export default function PhotoScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <ambientLight intensity={0.7} />
      
      {/* Portfolio themed stage lights for beautiful reflections */}
      <directionalLight position={[2, 3, 4]} intensity={1.5} color="#00D4FF" />
      <directionalLight position={[-2, -3, 3]} intensity={1.2} color="#8B5CF6" />
      <pointLight position={[0, 4, 2]} intensity={1.0} color="#FF006E" />
      
      <Suspense fallback={null}>
        <PhotoCard />
      </Suspense>
    </Canvas>
  );
}
