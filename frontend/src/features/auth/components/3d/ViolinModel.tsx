import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export type ViolinModelProps = {
    /** Uniform scale applied to the model. */
    scale?: number;
    /** Rotation intensity for the gentle idle sway (0 = static). */
    spinIntensity?: number;
};

/**
 * Reusable Violin 3D model.
 * Loaded once via useGLTF.preload and cached globally by three.js.
 */
export function ViolinModel({
    scale = 1,
    spinIntensity = 0.03,
}: ViolinModelProps) {
    const { scene } = useGLTF("/models/violin.glb") as unknown as {
        scene: THREE.Group;
    };
    const ref = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!ref.current || spinIntensity === 0) return;
        ref.current.rotation.z =
            Math.sin(state.clock.elapsedTime * 0.4 + 1) * spinIntensity;
    });

    return (
        <primitive
            ref={ref}
            object={scene}
            scale={scale}
            rotation={[0.2, 0.45, -0.35]}
        />
    );
}

useGLTF.preload("/models/violin.glb");
