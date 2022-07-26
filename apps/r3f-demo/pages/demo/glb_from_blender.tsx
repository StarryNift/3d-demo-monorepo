import { TextSprite } from '@3d/text-sprite';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Leva } from 'leva';
import { Suspense, useRef } from 'react';
import styled from 'styled-components';
import type { Group } from 'three';

export function Cube() {
  const ref = useRef<Group>();

  // cube.glb is a glTF file exported from Blender with
  // "Data > Custom Properties > Export" checked.
  // Custom properties can therefore be accessed in THREE.js via `mesh.userData`
  //
  // Properties can be defined in "Object properties > Custom properties" panel.
  const { scene } = useGLTF('/cube.glb');

  console.log('userData', scene.children[0].userData);

  return (
    <group ref={ref} name="cube group">
      <primitive object={scene} />
      <TextSprite
        position={[0, 3.6, 0]}
        fontSize={24}
        textAlign="left"
        bgColor="rgba(255,255,255,0.3)"
        text={`UserData: \n${JSON.stringify(
          scene.children[0].userData,
          null,
          2
        )}`}
      />
    </group>
  );
}
export const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
`;

export default function ThirdPerson() {
  return (
    <PageContainer>
      <Canvas shadows resize={{ debounce: { scroll: 0, resize: 0 } }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <Cube />
          <OrbitControls />
        </Suspense>
        <gridHelper args={[10, 10]} />
        <axesHelper />
      </Canvas>
      <Leva oneLineLabels={true} />
    </PageContainer>
  );
}
