import {
  Debug,
  Physics,
  SphereProps,
  useBox,
  useSphere
} from '@react-three/cannon';
import { ArcballControls, FlyControls, MapControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import type { Group, Mesh } from 'three';

export const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
`;

function Ball({
  args,
  ...props
}: Partial<Pick<SphereProps, 'args' | 'position' | 'rotation'>>) {
  const velocity = useRef([0, 0, 0]);

  const [ref, api] = useSphere<Group>(
    () => ({
      args,
      mass: 2,
      material: 'ball',
      collisionFilterGroup: 2,
      ...props
    }),
    null,
    []
  );

  useEffect(() => api.velocity.subscribe(v => (velocity.current = v)), []);
  useEffect(() => api.position.subscribe(v => (velocity.current = v)), []);

  useFrame(() => {
    api.velocity.set(0, 0, 0.1);
  });

  console.log('render ball');

  return (
    <group name="ball" ref={ref} {...props}>
      <mesh>
        <sphereGeometry args={args} />
        <meshPhongMaterial opacity={0.8} transparent />
      </mesh>
    </group>
  );
}

function Floor() {
  const [ref] = useBox<Mesh>(
    () => ({
      type: 'Static',
      args: [250, 0.2, 250],
      mass: 0,
      material: {
        friction: 0.01,
        name: 'floor'
      },
      collisionFilterGroup: 2
    }),
    null,
    []
  );

  return (
    <group>
      <mesh ref={ref} name="floor">
        <boxGeometry name="floor-box" args={[250, 0.2, 250]} />
        <meshPhongMaterial opacity={0.8} transparent />
      </mesh>
      <gridHelper args={[250, 250]} />
    </group>
  );
}

export default function ConstantVelocity() {
  return (
    <PageContainer>
      <Canvas resize={{ debounce: { scroll: 0, resize: 0 } }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Physics gravity={[0, -20, 0]}>
          <Debug color="lime">
            <Floor />
            <Ball args={[0.5]} position={[0, 1, 0]} />
          </Debug>
        </Physics>
        <ArcballControls />
      </Canvas>
    </PageContainer>
  );
}
