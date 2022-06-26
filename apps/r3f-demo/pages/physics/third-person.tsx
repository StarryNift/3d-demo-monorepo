import { Debug, Physics, useBox } from '@react-three/cannon';
import { Canvas, RootState } from '@react-three/fiber';
import { Suspense } from 'react';
import styled from 'styled-components';
import { Mesh } from 'three';

function Floor() {
  const [ref] = useBox<Mesh>(() => ({
    type: 'Static',
    args: [25, 0.2, 25],
    mass: 0,
    material: {
      friction: 0,
      name: 'floor'
    },
    collisionFilterGroup: 2
  }));
  return (
    <group>
      <mesh ref={ref}>
        <boxGeometry name="floor-box" />
        <meshPhongMaterial opacity={0} transparent />
      </mesh>
      <gridHelper args={[25, 25]} />
    </group>
  );
}

export const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
`;

export default function ThirdPerson() {
  const onCreated = (state: RootState) => {
    console.log('camera loaded');
  };

  return (
    <PageContainer>
      <Canvas
        onCreated={onCreated}
        resize={{ debounce: { scroll: 0, resize: 0 } }}
      >
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <Physics gravity={[0, -35, 0]}>
            <Debug>
              <Floor />
            </Debug>
          </Physics>
        </Suspense>
      </Canvas>
    </PageContainer>
  );
}
