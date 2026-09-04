import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';
import { techStack3D } from '../../data/portfolio';

interface TechBadgeProps {
  name: string;
  color: string;
  position: [number, number, number];
  speed?: number;
}

function TechBadge({ name, color, position, speed = 1 }: TechBadgeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime() * speed;
      groupRef.current.rotation.y = t * 0.3;
    }
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.008;
    }
  });

  return (
    <Float speed={speed * 1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <group ref={groupRef} position={position}>
        <Sphere ref={meshRef} args={[0.22, 16, 16]}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            roughness={0.1}
            metalness={0.9}
          />
        </Sphere>
        <Text
          position={[0, -0.42, 0]}
          fontSize={0.18}
          color={color}
          anchorX="center"
          anchorY="middle"

        >
          {name}
        </Text>
        {/* Glow ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.35, 0.015, 8, 64]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.2}
            transparent
            opacity={0.6}
          />
        </mesh>
      </group>
    </Float>
  );
}

function SceneContent() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#00D4FF" />
      <pointLight position={[-5, -5, 5]} intensity={1} color="#8B5CF6" />
      <pointLight position={[0, 5, -5]} intensity={0.8} color="#FF006E" />
      {techStack3D.map((tech, i) => (
        <TechBadge
          key={tech.name}
          name={tech.name}
          color={tech.color}
          position={tech.position as [number, number, number]}
          speed={0.4 + i * 0.05}
        />
      ))}
    </>
  );
}

export default function TechScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 55 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
    </Canvas>
  );
}
