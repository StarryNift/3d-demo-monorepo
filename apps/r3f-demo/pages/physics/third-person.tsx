import { ThirdPersonControls } from '@3d/third-person-controls';
import {
  BodyProps,
  BoxProps,
  Debug,
  Physics,
  Triplet,
  useBox,
  useRaycastAll,
  useRaycastClosest
} from '@react-three/cannon';
import { useAnimations, useGLTF } from '@react-three/drei';
import {
  BoxGeometryProps,
  Canvas,
  extend,
  MeshProps,
  Object3DNode,
  RootState,
  useGraph
} from '@react-three/fiber';
import { ContactMaterial } from 'cannon-es';
import { useControls } from 'leva';
import { keyboardMouseMoveStore } from 'libs/third-person-controls/src/lib/store/keyboard-mouse-input.store';
import { useEffect } from 'react';
import { Suspense, useMemo, useRef } from 'react';
import styled from 'styled-components';
import {
  BufferGeometry,
  Group,
  Mesh,
  Vector3,
  Line as ThreeLine,
  WebGL1Renderer,
  WebGLRenderer
} from 'three';

extend({
  ThreeLine
});

declare global {
  namespace JSX {
    interface IntrinsicElements {
      threeLine: Object3DNode<ThreeLine, typeof ThreeLine>;
    }
  }
}

function Floor() {
  const [ref] = useBox<Mesh>(() => ({
    type: 'Static',
    args: [25, 0.2, 25],
    mass: 0,
    material: {
      friction: 0.01,
      name: 'floor'
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

function Wall({ args, ...props }) {
  const [ref] = useBox<Mesh>(
    () => ({
      type: 'Static',
      args,
      mass: 0,
      sleepSpeedLimit: 1,
      linearDamping: 1,
      material: {
        friction: 0.01,
        name: 'wall'
      },
      collisionFilterGroup: 2,
      ...props
    }),
    null,
    []
  );

  return (
    <mesh name="wall" receiveShadow ref={ref} {...props}>
      <boxGeometry args={args} />
      <meshPhongMaterial color="white" opacity={0.8} transparent />
    </mesh>
  );
}

export function Box({
  args,
  ...props
}: Pick<BoxProps, 'args' | 'position' | 'rotation'>) {
  const values = useControls({
    linearDamping: { value: 0, min: 0, max: 1 },
    angularDamping: { value: 0, min: 0, max: 1 }
  });
  const [ref] = useBox<Mesh>(
    () => ({
      type: 'Dynamic',
      args,
      mass: 1,
      linearDamping: values.linearDamping,
      angularDamping: values.angularDamping,
      material: {
        friction: 0.4,
        name: 'box_surface'
      },
      collisionFilterGroup: 2,
      ...props
    }),
    null,
    [values.linearDamping, values.angularDamping]
  );
  console.log(values.linearDamping, values.angularDamping);

  return (
    <mesh receiveShadow ref={ref} {...props}>
      <boxGeometry args={args} />
      <meshPhongMaterial color="white" opacity={0.8} transparent />
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

type RayProps = {
  from: Triplet;
  setHit?: (e: {}) => void;
  to: Triplet;
};

// function Ray({ from, to }: RayProps) {
//   useRaycastClosest({ from, to }, e => {
//     console.log('ray hit distance', e, e.distance);
//   });
//   const geometry = useMemo(() => {
//     const points = [from, to].map(v => new Vector3(...v));
//     return new BufferGeometry().setFromPoints(points);
//   }, [from, to]);

//   return (
//     <threeLine geometry={geometry}>
//       <lineBasicMaterial color="black" />
//     </threeLine>
//   );
// }

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
              <Wall
                args={[25, 3, 0.2]}
                position={[0, 1.4, -12.6]}
                rotation={[-0.3, 0, 0]}
              />
              <Wall
                args={[25, 25, 0.2]}
                position={[0, 1.4, 12.6]}
                rotation={[0.8, 0, 0]}
              />
              <Wall
                args={[25, 3, 0.2]}
                rotation={[0, -Math.PI / 2, 0]}
                position={[12.6, 1.4, 0]}
              />
              <Wall
                args={[25, 3, 0.2]}
                rotation={[0, -Math.PI / 2, 0]}
                position={[-12.6, 1.4, 0]}
              />
              {/* <Ray from={[0, 5, 0]} to={[0, 1, 0]} /> */}
              <Wall
                args={[5, 5, 0.2]}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[12.6, 1.4, 0]}
              />
              <Wall
                args={[5, 5, 0.2]}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0.8, 3.4, 0]}
              />
              <Box args={[2, 2, 2]} position={[3, 10, 3]} />
              <Character />
            </Debug>
          </Physics>
        </Suspense>
      </Canvas>
    </PageContainer>
  );
}
