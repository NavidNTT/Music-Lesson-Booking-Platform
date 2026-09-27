import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Float, OrbitControls, useGLTF } from "@react-three/drei";
import { PianoModel } from "./3d/PianoModel";
import { ViolinModel } from "./3d/ViolinModel";

/**
 * Breakpoints match Tailwind: sm=640, md=768, lg=1024, xl=1280.
 * Each entry defines the [pianoPos, pianoScale, violinPos, violinScale]
 * for visual balance at that viewport width.
 */
const useResponsiveLayout = () => {
    const [breakpoint, setBreakpoint] = useState<"sm" | "md" | "lg" | "xl">("lg");

    useEffect(() => {
        const update = () => {
            const w = window.innerWidth;
            if (w < 640) setBreakpoint("sm");
            else if (w < 768) setBreakpoint("md");
            else if (w < 1024) setBreakpoint("lg");
            else setBreakpoint("xl");
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    const layouts = {
        // Mobile — smaller, single column feel
        sm: {
            piano: { pos: [0, 1.8, 0] as [number, number, number], scale: 0.03 },
            violin: { pos: [0, -1.8, 0] as [number, number, number], scale: 2.8 },
        },
        // Tablet
        md: {
            piano: { pos: [-2, 2, 0] as [number, number, number], scale: 0.035 },
            violin: { pos: [2, -2, 0] as [number, number, number], scale: 3.0 },
        },
        // Default (laptop) — balanced
        lg: {
            piano: { pos: [-2, 2.5, 0] as [number, number, number], scale: 0.04 },
            violin: { pos: [2, -2.5, 0] as [number, number, number], scale: 3.5 },
        },
        // Desktop — slightly larger canvas
        xl: {
            piano: { pos: [-2.2, 2.8, 0] as [number, number, number], scale: 0.042 },
            violin: { pos: [2.2, -2.8, 0] as [number, number, number], scale: 3.8 },
        },
    };

    return layouts[breakpoint];
};

function SceneContent() {
    const layout = useResponsiveLayout();

    return (
        <>
            <ambientLight intensity={0.8} />

            <directionalLight position={[4, 6, 5]} intensity={3} />

            <pointLight position={[-4, 2, 3]} intensity={2} distance={10} />

            <pointLight position={[4, -2, 2]} intensity={1.5} distance={8} />

            <Suspense fallback={null}>
                <Environment preset="studio" />

                {/* Piano — positioned toward upper area */}
                <Float speed={0.7} rotationIntensity={0.08} floatIntensity={0.15}>
                    <group position={layout.piano.pos}>
                        <PianoModel
                            scale={layout.piano.scale}
                            spinIntensity={0.035}
                        />
                    </group>
                </Float>

                {/* Violin — positioned toward lower area */}
                <Float speed={0.75} rotationIntensity={0.1} floatIntensity={0.18}>
                    <group position={layout.violin.pos}>
                        <ViolinModel
                            scale={layout.violin.scale}
                            spinIntensity={0.03}
                        />
                    </group>
                </Float>
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
