import { useGLTF } from '@react-three/drei';
import {
  Canvas,
  MeshProps,
  Node,
  RootState,
  useLoader
} from '@react-three/fiber';
import { Suspense, useMemo } from 'react';
import styled from 'styled-components';
import { Group, Material, Mesh, Object3D } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Debug, Physics, useBox } from '@react-three/cannon';
// import ThirdPersonCharacterControls from 'react-three-third-person/src/index';
// import manny from 'manny';

export const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
`;

// const BASE_ANIMATIONS_PATH =
//   'https://mannys-game.s3.amazonaws.com/third-person/animations';

// const animationPaths = {
//   idle: `${BASE_ANIMATIONS_PATH}/idle.glb`,
//   walk: `${BASE_ANIMATIONS_PATH}/walk.glb`,
//   run: `${BASE_ANIMATIONS_PATH}/run.glb`,
//   jump: `${BASE_ANIMATIONS_PATH}/jump.glb`,
//   landing: `${BASE_ANIMATIONS_PATH}/landing.glb`,
//   inAir: `${BASE_ANIMATIONS_PATH}/falling_idle.glb`,
//   backpedal: `${BASE_ANIMATIONS_PATH}/backpedal.glb`,
//   turnLeft: `${BASE_ANIMATIONS_PATH}/turn_left.glb`,
//   turnRight: `${BASE_ANIMATIONS_PATH}/turn_right.glb`,
//   strafeLeft: `${BASE_ANIMATIONS_PATH}/strafe_left.glb`,
//   strafeRight: `${BASE_ANIMATIONS_PATH}/strafe_right.glb`
// };

// function ThirdPersonCharacter() {
//   const mannyObj = manny();

//   return (
//     <ThirdPersonCharacterControls
//       cameraOptions={{
//         yOffset: 1.6,
//         minDistance: 0.6,
//         maxDistance: 7,
//         collisionFilterMask: 2
//       }}
//       characterObj={mannyObj}
//       animationPaths={animationPaths}
//     />
//   );
// }

export function CitySceneModel(props: MeshProps) {
  const { scene } = useLoader(
    GLTFLoader,
    'https://d1uoymq29mtp9f.cloudfront.net/web/3D/models/sceneCity16.glb',
    (loader: GLTFLoader) => {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath(
        'https://d1uoymq29mtp9f.cloudfront.net/web/3D/draco/'
      );
      loader.setDRACOLoader(dracoLoader);
    }
  );

  return <primitive object={scene} {...props} dispose={null} />;
}

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

export default function City() {
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
          <CitySceneModel />
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
