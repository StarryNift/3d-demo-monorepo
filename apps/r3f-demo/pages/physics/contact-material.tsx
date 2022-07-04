import {
  BoxProps,
  Debug,
  Physics,
  PublicApi,
  SphereProps,
  useBox,
  useContactMaterial,
  useSphere
} from '@react-three/cannon';
import { ArcballControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { button, useControls } from 'leva';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Mesh, MeshPhongMaterial } from 'three';
import create from 'zustand';

export const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
`;

function Floor({
  args,
  position,
  rotation
}: Pick<BoxProps, 'args' | 'position' | 'rotation'>) {
  const [ref] = useBox<Mesh>(
    () => ({
      type: 'Static',
      args,
      // position,
      // rotation,
      mass: 0,
      material: 'floor',
      collisionFilterGroup: 2
    }),
    null,
    []
  );

  return (
    <group position={position} rotation={rotation}>
      <mesh ref={ref} name="floor">
        <boxGeometry name="floor-box" args={args} />
        <meshPhongMaterial opacity={0.8} transparent />
      </mesh>
      <gridHelper args={[40, 40]} />
    </group>
  );
}

interface BallPhysicProps {
  model: Mesh;
  api: PublicApi;
}

export const ballStore = create<Record<string, BallPhysicProps>>(
  (set, get) => ({})
);

export function Ball({
  args,
  ballRef,
  name,
  color,
  material,
  ...props
}: Pick<SphereProps, 'args' | 'position' | 'rotation' | 'material'> & {
  name: string;
  color: string;
  ballRef: React.RefObject<Mesh>;
}) {
  const values = useControls({
    linearDamping: { value: 0.01, min: 0, max: 1 },
    angularDamping: { value: 0.01, min: 0, max: 1 }
  });

  const areaIndicator = useRef<MeshPhongMaterial>();
  const [ref, api] = useSphere<Mesh>(
    () => ({
      type: 'Dynamic',
      args,
      mass: 1,
      allowSleep: false,
      linearDamping: values.linearDamping,
      angularDamping: values.angularDamping,
      material,
      collisionFilterGroup: 2,
      ...props
    }),
    ballRef,
    [values]
  );

  useEffect(() => {
    ballStore.setState({
      [name]: {
        model: ref.current,
        api
      }
    });
  });

  return (
    <mesh name="ball" receiveShadow castShadow ref={ref} {...props}>
      <sphereGeometry args={args} />
      <meshPhongMaterial
        ref={areaIndicator}
        color={color}
        opacity={0.8}
        transparent
      />
    </mesh>
  );
}

export function Box({
  args,
  ...props
}: Pick<BoxProps, 'args' | 'position' | 'rotation'>) {
  const [ref] = useBox<Mesh>(
    () => ({
      type: 'Dynamic',
      args,
      mass: 1,
      material: 'floor',
      ...props
    }),
    null
  );

  return (
    <mesh receiveShadow ref={ref} {...props}>
      <boxGeometry args={args} />
      <meshPhongMaterial color="white" opacity={0.8} transparent />
    </mesh>
  );
}

const DEFAULT_CONTACT_MATERIAL = {
  friction: 0.3,
  restitution: 0.3,
  contactEquationStiffness: 1e7,
  contactEquationRelaxation: 3,
  frictionEquationStiffness: 1e7,
  frictionEquationRelaxation: 3
};

export function MaterialConfig() {
  const values = useControls({
    friction: {
      value: DEFAULT_CONTACT_MATERIAL.friction,
      min: 0,
      max: 1
    },
    restitution: {
      value: DEFAULT_CONTACT_MATERIAL.restitution,
      min: 0,
      max: 1
    },
    contactEquationStiffness: {
      value: DEFAULT_CONTACT_MATERIAL.contactEquationStiffness,
      min: 0,
      max: 1e128
    },
    contactEquationRelaxation: {
      value: DEFAULT_CONTACT_MATERIAL.contactEquationRelaxation,
      min: 0,
      max: 1000
    },
    frictionEquationStiffness: {
      value: DEFAULT_CONTACT_MATERIAL.frictionEquationStiffness,
      min: 0,
      max: 1e128
    },
    frictionEquationRelaxation: {
      value: DEFAULT_CONTACT_MATERIAL.frictionEquationRelaxation,
      min: 0,
      max: 1000
    },
    reset: button(get => {
      console.log('reset');

      const { api: defaultApi } = ballStore.getState()['default'];
      defaultApi.position.set(0, 25, 6);
      defaultApi.velocity.set(0, 2, 0);

      const { api: customApi } = ballStore.getState()['custom'];
      customApi.position.set(0, 25, -6);
      customApi.velocity.set(0, 2, 0);
    })
  });

  // Default values
  // According to the docs:
  // https://pmndrs.github.io/cannon-es/docs/classes/ContactMaterial.html
  useContactMaterial('default', 'floor', DEFAULT_CONTACT_MATERIAL, []);

  useContactMaterial(
    'custom',
    'floor',
    {
      friction: values.friction,
      restitution: values.restitution,
      contactEquationStiffness: values.contactEquationStiffness,
      contactEquationRelaxation: values.contactEquationRelaxation,
      frictionEquationStiffness: values.frictionEquationRelaxation,
      frictionEquationRelaxation: values.frictionEquationRelaxation
    },
    [values]
  );

  return null;
}

export default function ContactMaterial() {
  const defaultBall = useRef<Mesh>();
  const customBall = useRef<Mesh>();

  return (
    <PageContainer>
      <Canvas resize={{ debounce: { scroll: 0, resize: 0 } }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        {/* <Physics gravity={[0.05, -10, 0]}> */}
        <Physics gravity={[0, -50, 0]}>
          <Floor args={[40, 0.2, 40]} rotation={[0, 0, 0]} />
          <Ball
            ballRef={defaultBall}
            name="default"
            material="default"
            color="blue"
            position={[0, 25, 6]}
          />
          {/* <Box args={[2, 2, 2]} position={[0, 1, 6]} /> */}
          <Ball
            ballRef={customBall}
            name="custom"
            material="custom"
            color="lime"
            position={[0, 25, -6]}
          />
          {/* <Box args={[2, 2, 2]} position={[0, 1, -6]} /> */}
          <MaterialConfig />
        </Physics>
        <PerspectiveCamera
          makeDefault
          near={5}
          position={[25, 45, 0]}
          fov={75}
        />
        <ArcballControls />
        <axesHelper args={[20]} />
      </Canvas>
    </PageContainer>
  );
}
