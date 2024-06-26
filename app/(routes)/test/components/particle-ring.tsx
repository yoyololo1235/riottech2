"use client";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import type { Group } from "three/src/Three.js";
import { randomFromInterval } from "@/lib/utils";

const MIN_RADIUS = 7.5;
const MAX_RADIUS = 15;
const DEPTH = 2;
// const LEFT_COLOR = "6366f1";
// const RIGHT_COLOR = "8b5cf6";
const LEFT_COLOR = "ff0000";
const RIGHT_COLOR = "0000ff";
const NUM_POINTS = 2500;

const ParticleRing = () => {
  return (
    <div className="relative">
      <Canvas
        camera={{
          position: [10, -7.5, -5],
        }}
        style={{ height: "100vh" }}
        className="bg-slate-900"
      >
        <OrbitControls maxDistance={20} minDistance={10} />
        <directionalLight intensity={2} />
        <pointLight position={[-30, 0, -30]} power={10.0} />
        <PointCircle />
      </Canvas>

      <h1 className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] text-slate-200 font-medium text-2xl md:text-5xl pointer-events-none">
        Drag & Zoom
      </h1>
    </div>
  );
};

const PointCircle = () => {
  const ref = useRef<Group | null>(null);

  useFrame(({ clock }) => {
    if (ref.current?.rotation) {
      ref.current.rotation.z = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group ref={ref}>
      {pointsInner.map((point) => (
        <Point key={point.idx} position={point.position} color={point.color} />
      ))}
      {pointsOuter.map((point) => (
        <Point key={point.idx} position={point.position} color={point.color} />
      ))}
    </group>
  );
};

const Point = ({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) => {
  return (
    <Sphere position={position} args={[0.1, 10, 10]}>
      <meshStandardMaterial emissive={color} emissiveIntensity={0.5} roughness={0.5} color={color} />
    </Sphere>
  );
};

const pointsInner = Array.from({ length: NUM_POINTS }, (v, k) => k + 1).map((num) => {
  const randomRadius = randomFromInterval(MIN_RADIUS, MAX_RADIUS);
  const randomAngle = Math.random() * Math.PI * 2;

  const x = Math.cos(randomAngle) * randomRadius;
  const y = Math.sin(randomAngle) * randomRadius;
  const z = randomFromInterval(-DEPTH, DEPTH);

  const color = calculateColor(x);

  return {
    idx: num,
    position: [x, y, z] as [number, number, number],
    color,
  };
});

const pointsOuter = Array.from({ length: NUM_POINTS / 4 }, (v, k) => k + 1).map((num) => {
  const randomRadius = randomFromInterval(MIN_RADIUS / 2, MAX_RADIUS * 2);
  const angle = Math.random() * Math.PI * 2;

  const x = Math.cos(angle) * randomRadius;
  const y = Math.sin(angle) * randomRadius;
  const z = randomFromInterval(-DEPTH * 10, DEPTH * 10);

  const color = calculateColor(x);

  return {
    idx: num,
    position: [x, y, z] as [number, number, number],
    color,
  };
});

function getGradientStop(r: number) {
  // For outer ring numbers potentially past max radius,
  // just clamp to 0
  const ratio = r > 1 ? 1 : r < 0 ? 0 : r;

  const c0 = LEFT_COLOR.match(/.{1,2}/g)?.map((oct) => Number.parseInt(oct, 16) * (1 - ratio));
  const c1 = RIGHT_COLOR.match(/.{1,2}/g)?.map((oct) => Number.parseInt(oct, 16) * ratio);
  if (!c0 || !c1) {
    return "#000000";
  }
  const ci = [0, 1, 2].map((i) => Math.min(Math.round(c0[i] + c1[i]), 255));
  const color = ci
    .reduce((a, v) => (a << 8) + v, 0)
    .toString(16)
    .padStart(6, "0");

  return `#${color}`;
}

function calculateColor(x: number) {
  const maxDiff = MAX_RADIUS * 2;
  const distance = x + MAX_RADIUS;

  const ratio = distance / maxDiff;

  const stop = getGradientStop(ratio);
  return stop;
}

export default ParticleRing;
