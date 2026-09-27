import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export type PianoModelProps = {
    /** Uniform scale applied to the model. */
    scale?: number;
    /** Rotation intensity for the gentle idle sway (0 = static). */
    spinIntensity?: number;
};

/**
 * Reusable Piano 3D model.
 * Loaded once via useGLTF.preload and cached globally by three.js.
 */
export function PianoModel({
    scale = 1,
    spinIntensity = 0.035,
}: PianoModelProps) {
    const { scene } = useGLTF("/models/piano.glb") as unknown as {
        scene: THREE.Group;
    };
    const ref = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!ref.current || spinIntensity === 0) return;
        ref.current.rotation.y =
            Math.sin(state.clock.elapsedTime * 0.35) * spinIntensity;
    });

    return (
        <primitive
            ref={ref}
            object={scene}
            scale={scale}
            rotation={[0, -0.35, 0]}
        />
    );
}

useGLTF.preload("/models/piano.glb");
