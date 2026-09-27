import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Float, useGLTF } from "@react-three/drei";
import { PianoModel } from "@/features/auth/components/3d/PianoModel";
import { ViolinModel } from "@/features/auth/components/3d/ViolinModel";

/**
 * Decorative 3D scene rendered inside the homepage hero black container.
 * Models are significantly smaller than the Login-page versions and
 * positioned in opposite corners so they never interfere with hero text,
 * logo, navigation, or buttons.
 */
function HeroMusicSceneContent() {
    return (
        <>
            <ambientLight intensity={0.9} />
            <directionalLight position={[3, 5, 4]} intensity={2} />
            <pointLight position={[-3, 2, 2]} intensity={1} distance={8} />

            <Suspense fallback={null}>
                <Environment preset="studio" />

                {/* Piano — small, upper-left corner */}
                <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.08}>
                    <group position={[-3.8, 0.8, 0]}>
                        <PianoModel scale={0.011} spinIntensity={0.02} />
                    </group>
                </Float>

                {/* Violin — small, lower-right corner */}
                <Float speed={1.5} rotationIntensity={0.07} floatIntensity={0.1}>
                    <group position={[3.8, -0.5, 0.3]}>
                        <ViolinModel scale={0.95} spinIntensity={0.015} />
                    </group>
                </Float>
            </Suspense>
        </>
    );
}

export function HeroMusicScene() {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas
                camera={{ position: [0, 0, 8], fov: 45 }}
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
                frameloop="demand"
            >
                <HeroMusicSceneContent />
            </Canvas>
        </div>
    );
}

useGLTF.preload("/models/piano.glb");
useGLTF.preload("/models/violin.glb");
