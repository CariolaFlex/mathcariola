/**
 * Force TypeScript to pick up React Three Fiber's JSX intrinsic element augmentations.
 * R3F extends react/jsx-runtime's IntrinsicElements with THREE.js primitives
 * (mesh, group, meshPhongMaterial, threeLine, etc.)
 */
/// <reference types="@react-three/fiber" />
