import { ThirdPersonControls } from '@3d/third-person-controls';
import {
  BoxProps,
  CylinderProps,
  Debug,
  Physics,
  SphereProps,
  useBox,
  useCylinder,
  useSphere
} from '@react-three/cannon';
import { useAnimations, useGLTF } from '@react-three/drei';
import { Canvas, RootState, useGraph } from '@react-three/fiber';
import { keyboardMouseMoveStore } from 'libs/third-person-controls/src/lib/store/keyboard-mouse-input.store';
import { Suspense, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Group, Mesh, MeshPhongMaterial } from 'three';

function Floor() {
  const [ref] = useBox<Mesh>(() => ({
    type: 'Static',
    args: [25, 0.2, 25],
    mass: 0,
    material: {
      friction: 0.01
    },
    userData: {
      supporting: true
    },
    collisionFilterGroup: 2
  }));
  return (
    <group>
      <mesh ref={ref} name="floor">
        <boxGeometry name="floor-box" args={[25, 0.2, 25]} />
        <meshPhongMaterial opacity={0.8} transparent />
      </mesh>
      <gridHelper args={[25, 25]} />
    </group>
  );
}

export function Cylinder({
  args,
  ...props
}: Pick<CylinderProps, 'args' | 'position' | 'rotation'>) {
  const areaIndicator = useRef<MeshPhongMaterial>();
  const [ref] = useCylinder<Mesh>(
    () => ({
      type: 'Static',
      args,
      mass: 1,
      isTrigger: true,
      allowSleep: false,
      material: {
        friction: 0.01
      },
      onCollideBegin(e) {
        console.log('enter', e.target);
        areaIndicator.current.color.set('#00ff00');
      },
      onCollideEnd(e) {
        console.log('exit', e);
        // NOTE: Will be called after character enters the inside of the cylinder
        areaIndicator.current.color.set('white');
      },
      collisionFilterGroup: 2,
      userData: {
        isTrigger: true
      },
      ...props
    }),
    null,
    []
  );

  useEffect(() => {
    console.log('userData of trigger', ref.current.userData);
  });

  return (
    <mesh name="trigger-cylinder" receiveShadow castShadow ref={ref} {...props}>
      <cylinderGeometry args={args} />
      <meshPhongMaterial
        ref={areaIndicator}
        color="white"
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
  const areaIndicator = useRef<MeshPhongMaterial>();
  const [ref] = useBox<Mesh>(
    () => ({
      type: 'Static',
      args,
      mass: 1,
      isTrigger: true,
      allowSleep: false,
      onCollideBegin(e) {
        console.log('enter', e.target);
        areaIndicator.current.color.set('#00ff00');
      },
      onCollideEnd(e) {
        console.log('exit', e);
        areaIndicator.current.color.set('white');
      },
      material: {
        friction: 0.01,
        name: 'box_surface'
      },
      collisionFilterGroup: 2,
      userData: {
        isTrigger: true
      },
      ...props
    }),
    null,
    []
  );

  useEffect(() => {
    console.log('userData of trigger', ref.current.userData);
  });

  return (
    <mesh name="trigger-box" receiveShadow castShadow ref={ref} {...props}>
      <boxGeometry args={args} />
      <meshPhongMaterial
        ref={areaIndicator}
        color="white"
        opacity={0.8}
        transparent
      />
    </mesh>
  );
}

export function Sphere({
  args,
  ...props
}: Pick<SphereProps, 'args' | 'position' | 'rotation'>) {
  const areaIndicator = useRef<MeshPhongMaterial>();
  const [ref] = useSphere<Mesh>(
    () => ({
      type: 'Static',
      args,
      mass: 1,
      isTrigger: true,
      allowSleep: false,
      onCollideBegin(e) {
        console.log('enter', e.target);
        areaIndicator.current.color.set('#00ff00');
      },
      onCollideEnd(e) {
        console.log('exit', e);
        areaIndicator.current.color.set('white');
      },
      material: {
        friction: 0.01,
        name: 'box_surface'
      },
      collisionFilterGroup: 2,
      userData: {
        isTrigger: true
      },
      ...props
    }),
    null,
    []
  );

  useEffect(() => {
    console.log('userData of trigger', ref.current.userData);
  });

  return (
    <mesh name="trigger-box" receiveShadow castShadow ref={ref} {...props}>
      <sphereGeometry args={args} />
      <meshPhongMaterial
        ref={areaIndicator}
        color="white"
        opacity={0.8}
        transparent
      />
    </mesh>
  );
}

export function Character() {
  const modelRef = useRef<Group>();
  const { scene, animations } = useGLTF(
    'https://d1uoymq29mtp9f.cloudfront.net/web/3D/stage/player.glb'
  );

  const { nodes, materials } = useGraph(scene);
  const { names, actions, mixer } = useAnimations(animations, modelRef);

  useEffect(() => {
    if (!modelRef.current) {
      return;
    }

    console.log('animations', names);

    actions['idle'].play();

    return keyboardMouseMoveStore.subscribe(
      state => state.computed.isMoving,
      e => console.log('moving', e)
    );
  }, []);

  return (
    <ThirdPersonControls modelRef={modelRef}>
      <group name="character" ref={modelRef}>
        <group name="Scene" position={[0, 0.8, 0]} rotation={[0, 0, 0]}>
          <group
            name="Tpose"
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, -0.85, 0]}
            scale={0.064}
          >
            <primitive object={nodes.mixamorigHips} />
            <skinnedMesh
              name="HANDS1"
              geometry={nodes['HANDS1']['geometry']}
              material={materials['blinn9.016']}
              skeleton={nodes['HANDS1']['skeleton']}
            />
            <skinnedMesh
              name="face"
              geometry={nodes.face['geometry']}
              material={materials['blinn2.016']}
              skeleton={nodes.face['skeleton']}
            />
            <skinnedMesh
              name="SUIT3"
              geometry={nodes.SUIT3['geometry']}
              material={materials['blinn3.050']}
              skeleton={nodes.SUIT3['skeleton']}
            />
            <skinnedMesh
              name="helmet"
              geometry={nodes.helmet['geometry']}
              material={materials['blinn7.016']}
              skeleton={nodes.helmet['skeleton']}
            />
            <skinnedMesh
              name="shoses"
              geometry={nodes.shoses['geometry']}
              material={materials['blinn10.016']}
              skeleton={nodes.shoses['skeleton']}
            />
          </group>
        </group>
      </group>
    </ThirdPersonControls>
  );
}

export const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
`;

export default function ThirdPerson() {
  const onCreated = (state: RootState) => {
    console.log('canvas created');

    console.log(state.gl);
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
          <Physics gravity={[0, -10, 0]}>
            <Debug color="lime">
              <Floor />
              <Box args={[2, 2, 2]} position={[3, 2.5, 3]} />
              <Box args={[4, 8, 4]} position={[9, 1, -7]} />
              <Cylinder args={[2, 2, 2, 15]} position={[-7, 2.5, -3]} />
              <Cylinder args={[4, 4, 8, 15]} position={[10, 2.5, 12]} />
              <Sphere args={[3]} position={[-10, 0, 10]} />
              <Character />
            </Debug>
          </Physics>
        </Suspense>
        <axesHelper args={[10]} />
      </Canvas>
    </PageContainer>
  );
}
