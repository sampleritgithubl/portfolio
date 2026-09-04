import { useRef, useMemo, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Environment, useTexture } from '@react-three/drei';
import * as THREE from 'three';

/* ════════════════════════════════════════════════════════════════════
   SCREEN DISPLAY — Renders photo texture on MacBook display
════════════════════════════════════════════════════════════════════ */
function ScreenContent({ width, height }: { width: number; height: number }) {
  // Load the hero image directly using drei's useTexture
  const texture = useTexture('/kavindu.png');

  // Adjust texture settings for crisp rendering
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return (
    <mesh position={[0, -0.014, height / 2]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

/* ════════════════════════════════════════════════════════════════════
   GLOWING APPLE LOGO
════════════════════════════════════════════════════════════════════ */
function AppleLogo({ position }: { position: [number, number, number] }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (mesh.current) {
      const mat = mesh.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.35 + Math.sin(s.clock.elapsedTime * 1.5) * 0.15;
    }
  });
  return (
    <mesh ref={mesh} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.13, 32]} />
      <meshStandardMaterial
        color="#ffffff"
        roughness={0.05}
        metalness={0.9}
        emissive="#00d4ff"
        emissiveIntensity={0.35}
      />
    </mesh>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MACBOOK 3D MODEL
════════════════════════════════════════════════════════════════════ */
function MacBook({
  isHovered,
  setHovered,
}: {
  isHovered: boolean;
  setHovered: (hover: boolean) => void;
}) {
  const macRef = useRef<THREE.Group>(null);
  const lidGroupRef = useRef<THREE.Group>(null);

  // Target lid opening angle (-105 deg open)
  const TARGET_OPEN_ANGLE = -105 * (Math.PI / 180);
  const REST_ANGLE = -15 * (Math.PI / 180);

  const currentAngle = useRef(TARGET_OPEN_ANGLE);

  /* MacBook Dimensions */
  const W = 2.25;
  const BD = 1.4;
  const BH = 0.075;
  const LH = 0.024;
  const LD = 1.37;

  const HY = BH / 2;
  const HZ = -BD / 2;

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    const target = isHovered ? TARGET_OPEN_ANGLE : REST_ANGLE;
    currentAngle.current = THREE.MathUtils.lerp(currentAngle.current, target, delta * 4.5);

    if (lidGroupRef.current) {
      lidGroupRef.current.rotation.x = currentAngle.current;
    }

    if (macRef.current) {
      // Gentle floating animation
      const targetRotY = isHovered ? Math.sin(time * 0.35) * 0.18 : Math.sin(time * 0.3) * 0.25;
      macRef.current.rotation.y = THREE.MathUtils.lerp(macRef.current.rotation.y, targetRotY, delta * 3);
      macRef.current.position.y = -0.05 + Math.sin(time * 0.6) * 0.04;
    }
  });

  /* Keyboard Layout */
  const keys = useMemo(() => {
    const arr: { x: number; z: number; isFn: boolean }[] = [];
    const rows = [
      { cols: 14, spacing: 0.14, z: -0.46, isFn: true },
      { cols: 13, spacing: 0.15, z: -0.30, isFn: false },
      { cols: 13, spacing: 0.15, z: -0.14, isFn: false },
      { cols: 13, spacing: 0.15, z:  0.02, isFn: false },
    ];
    rows.forEach(({ cols, spacing, z, isFn }) => {
      const totalW = (cols - 1) * spacing;
      for (let c = 0; c < cols; c++) {
        arr.push({ x: -totalW / 2 + c * spacing, z, isFn });
      }
    });
    return arr;
  }, []);

  return (
    <group
      ref={macRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* ═══════════════════════════════
          BASE CHASSIS
      ═══════════════════════════════ */}
      <group>
        {/* Main Aluminium Unibody */}
        <RoundedBox args={[W, BH, BD]} radius={0.045} smoothness={10}>
          <meshStandardMaterial color="#2d2e36" roughness={0.08} metalness={0.94} />
        </RoundedBox>

        {/* Top Keyboard Deck Plate */}
        <mesh position={[0, BH / 2 + 0.0006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W - 0.06, BD - 0.06]} />
          <meshStandardMaterial color="#1e1f26" roughness={0.15} metalness={0.8} />
        </mesh>

        {/* Keyboard Keys */}
        {keys.map((k, i) => (
          <mesh key={i} position={[k.x, BH / 2 + 0.008, k.z]}>
            <boxGeometry args={[k.isFn ? 0.11 : 0.128, 0.012, k.isFn ? 0.075 : 0.115]} />
            <meshStandardMaterial
              color={k.isFn ? '#16171d' : '#111217'}
              roughness={0.3}
              metalness={0.5}
            />
          </mesh>
        ))}

        {/* Spacebar */}
        <mesh position={[0, BH / 2 + 0.008, 0.18]}>
          <boxGeometry args={[0.56, 0.012, 0.115]} />
          <meshStandardMaterial color="#111217" roughness={0.25} metalness={0.5} />
        </mesh>

        {/* Glass Trackpad */}
        <RoundedBox args={[0.72, 0.006, 0.46]} radius={0.02} smoothness={8} position={[0, BH / 2 + 0.002, 0.41]}>
          <meshStandardMaterial color="#22232b" roughness={0.05} metalness={0.9} />
        </RoundedBox>
        <mesh position={[0, BH / 2 + 0.0025, 0.41]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.72, 0.46]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.08} transparent opacity={0.08} />
        </mesh>

        {/* Touch Bar */}
        <RoundedBox args={[W * 0.74, 0.007, 0.04]} radius={0.008} smoothness={4} position={[0, BH / 2 + 0.003, -0.55]}>
          <meshStandardMaterial color="#0c0d12" roughness={0.05} emissive="#8b5cf6" emissiveIntensity={0.25} />
        </RoundedBox>

        {/* Touch ID Button */}
        <mesh position={[W * 0.37, BH / 2 + 0.003, -0.55]}>
          <boxGeometry args={[0.07, 0.01, 0.04]} />
          <meshStandardMaterial color="#16171d" roughness={0.1} metalness={0.8} emissive="#00ff88" emissiveIntensity={0.15} />
        </mesh>

        {/* Bottom Feet */}
        {[[-0.92, -0.6], [0.92, -0.6], [-0.92, 0.6], [0.92, 0.6]].map(([x, z], i) => (
          <mesh key={i} position={[x, -BH / 2, z]}>
            <cylinderGeometry args={[0.04, 0.04, 0.008, 20]} />
            <meshStandardMaterial color="#121318" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* ═══════════════════════════════
          LID (Pivoting hinge)
      ═══════════════════════════════ */}
      <group position={[0, HY, HZ]}>
        <group ref={lidGroupRef}>

          {/* Lid Outer Shell */}
          <RoundedBox args={[W, LH, LD]} radius={0.04} smoothness={10} position={[0, 0, LD / 2]}>
            <meshStandardMaterial color="#2d2e36" roughness={0.08} metalness={0.94} />
          </RoundedBox>

          {/* Black Glass Screen Bezel */}
          <mesh position={[0, -LH / 2 - 0.001, LD / 2]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[W - 0.04, LD - 0.04]} />
            <meshStandardMaterial color="#04050a" />
          </mesh>

          {/* Screen Content - Photo Image Texture */}
          <Suspense fallback={null}>
            <ScreenContent width={W - 0.12} height={LD - 0.16} />
          </Suspense>

          {/* Screen Ambient Glow */}
          <mesh position={[0, -LH / 2 - 0.0015, LD / 2]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[W - 0.08, LD - 0.08]} />
            <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.05} transparent opacity={0.06} />
          </mesh>

          {/* Camera Notch */}
          <mesh position={[0, -LH / 2 - 0.002, LD - 0.075]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.2, 0.03]} />
            <meshStandardMaterial color="#090a10" />
          </mesh>

          {/* Camera Lens */}
          <mesh position={[0, -LH / 2 - 0.003, LD - 0.07]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.009, 16]} />
            <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.8} />
          </mesh>

          {/* Apple Logo on outer lid */}
          <AppleLogo position={[0, LH / 2 + 0.001, LD / 2]} />

        </group>
      </group>

    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════
   FLOATING AMBIENT ORBS & PARTICLES
════════════════════════════════════════════════════════════════════ */
function AmbientOrbs() {
  const orb1 = useRef<THREE.Mesh>(null);
  const orb2 = useRef<THREE.Mesh>(null);
  const orb3 = useRef<THREE.Mesh>(null);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (orb1.current) { orb1.current.rotation.z = t * 0.4; orb1.current.rotation.x = t * 0.2; }
    if (orb2.current) { orb2.current.rotation.y = t * 0.5; orb2.current.rotation.z = t * 0.3; }
    if (orb3.current) { orb3.current.position.y = -0.3 + Math.sin(t * 0.8) * 0.08; orb3.current.rotation.x = t * 0.6; }
  });

  return (
    <>
      <mesh ref={orb1} position={[-1.9, 0.6, -0.4]}>
        <torusGeometry args={[0.22, 0.008, 16, 80]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={2.5} transparent opacity={0.8} />
      </mesh>
      <mesh ref={orb2} position={[1.9, 0.4, -0.3]}>
        <torusGeometry args={[0.16, 0.006, 16, 60]} />
        <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={2.8} transparent opacity={0.7} />
      </mesh>
      <mesh ref={orb3} position={[1.6, -0.35, 0.6]} rotation={[0.4, 0, 0.3]}>
        <octahedronGeometry args={[0.07]} />
        <meshStandardMaterial color="#f471b5" emissive="#f471b5" emissiveIntensity={2.2} transparent opacity={0.9} />
      </mesh>
    </>
  );
}

function Particles() {
  const mesh = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const pos = new Float32Array(90 * 3);
    for (let i = 0; i < 90 * 3; i++) pos[i] = (Math.random() - 0.5) * 7.5;
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (mesh.current) mesh.current.rotation.y += delta * 0.025;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.028} color="#00d4ff" transparent opacity={0.55} />
    </points>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN SCENE & EXPORT
════════════════════════════════════════════════════════════════════ */
function Scene({ isHovered, setHovered }: { isHovered: boolean; setHovered: (h: boolean) => void }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 4, 3]} intensity={3.2} color="#ffffff" />
      <pointLight position={[-3, 2, 1]} intensity={1.5} color="#8b5cf6" />
      <pointLight position={[3, 1, 1]} intensity={1.5} color="#00d4ff" />
      <pointLight position={[0, -2, 2]} intensity={0.6} color="#1d4ed8" />

      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>

      <Particles />
      <AmbientOrbs />
      <MacBook isHovered={isHovered} setHovered={setHovered} />
    </>
  );
}

export default function DeveloperSetup3D() {
  const [isHovered, setHovered] = useState(true);

  return (
    <div
      className="setup3d-wrap"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      <Canvas
        camera={{ position: [0, 0.45, 3.1], fov: 44 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent', display: 'block' }}
        dpr={[1, 2]}
      >
        <Scene isHovered={isHovered} setHovered={setHovered} />
      </Canvas>
    </div>
  );
}
