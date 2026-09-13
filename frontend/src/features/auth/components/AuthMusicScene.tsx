import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function Piano() {
    const { scene } = useGLTF("/models/piano.glb");
    const ref = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!ref.current) return;

        ref.current.rotation.y =
            Math.sin(state.clock.elapsedTime * 0.35) * 0.035;
    });

    return (
        <Float speed={0.7} rotationIntensity={0.08} floatIntensity={0.15}>
            <primitive
                ref={ref}
                object={scene}
                scale={1.6}
                position={[0, -2.1, -0.8]}
                rotation={[0, -0.35, 0]}
            />
        </Float>
    );
}

function Violin() {
    const { scene } = useGLTF("/models/violin.glb");
    const ref = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!ref.current) return;

        ref.current.rotation.z =
            Math.sin(state.clock.elapsedTime * 0.4 + 1) * 0.03;
    });

    return (
        <Float speed={0.75} rotationIntensity={0.1} floatIntensity={0.18}>
            <primitive
                ref={ref}
                object={scene}
                scale={1.5}
                position={[-2.7, 1.2, 0.5]}
                rotation={[0.2, 0.45, -0.35]}
            />
        </Float>
    );
}

function SceneContent() {
    return (
        <>
            <ambientLight intensity={0.8} />

            <directionalLight position={[4, 6, 5]} intensity={3} />

            <pointLight position={[-4, 2, 3]} intensity={2} distance={10} />

            <pointLight position={[4, -2, 2]} intensity={1.5} distance={8} />

            <Suspense fallback={null}>
                <Environment preset="studio" />

                <Piano />
                <Violin />
            </Suspense>

            <OrbitControls
                enableZoom={false}
                enablePan={false}
                enableRotate={false}
            />
        </>
    );
}

export function AuthMusicScene() {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas
                camera={{
                    position: [0, 0, 10],
                    fov: 42,
                }}
                dpr={[1, 1.5]}
                gl={{
                    antialias: true,
                    alpha: true,
                }}
            >
                <SceneContent />
            </Canvas>
        </div>
    );
}

useGLTF.preload("/models/piano.glb");
useGLTF.preload("/models/violin.glb");
