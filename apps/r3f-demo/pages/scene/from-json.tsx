import {
  ManifestJson,
  ProxyEventHandlers,
  useEventHandlerStore
} from '@3d/dynamic-scene';
import { DynamicScene, useSceneMesh } from '@3d/dynamic-scene';
import { ThirdPersonControls } from '@3d/third-person-controls';
import { Debug, Physics } from '@react-three/cannon';
import {
  ArcballControls,
  PerspectiveCamera,
  useAnimations,
  useGLTF
} from '@react-three/drei';
import {
  Canvas,
  PerspectiveCameraProps,
  RootState,
  useGraph
} from '@react-three/fiber';
import { button, useControls } from 'leva';
import { Suspense, useEffect, useRef } from 'react';
import styled from 'styled-components';
import type { Group } from 'three';
import sceneJson from '../../assets/scene.json';

const sceneManifest: ManifestJson = sceneJson as any;

export const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
`;

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
  }, []);

  return (
    <ThirdPersonControls modelRef={modelRef} initialPosition={[0, 30, 0]}>
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

export function SceneScripts() {
  const getMesh = useSceneMesh(state => state.getMesh);

  useEffect(() => {
    console.log('getMesh', getMesh('Pictures.glb', 'MAhmadM8458429'));
  });

  return null;
}

export function HandlerOverride() {
  const setHandlers = useEventHandlerStore(state => state.setHandlers);
  const getAllColliders = useSceneMesh(state => state.getAllColliders);

  useControls({
    randomValue: {
      value: 0
    },
    override: button(get => {
      console.log('override', get);
      const r = get('randomValue');

      setHandlers({
        handler3(event) {
          console.log('handler3 override', event);
          console.log('current random value:', r);
          console.log('click', event.target.name);
        }
      });

      console.log('override', r);
    }),
    printColliders: button(get => {
      const colliders = getAllColliders();
      console.log('colliders', colliders);
    })
  });

  return null;
}

export default function SceneFromJson() {
  const cameraRef = useRef<PerspectiveCameraProps>();

  const handleCreated = (state: RootState) => {
    console.log(state, cameraRef.current);
  };

  const handlers: ProxyEventHandlers = {
    handler1(event) {
      console.log('handler1', event);
      console.log('active', event.target.name);
    },
    handler2(event) {
      console.log('handler2', event);
      console.log('inactive', event.target.name);
    },
    handler3(event) {
      console.log('handler3', event);
      console.log('click', event.target.name);
    }
  };

  return (
    <PageContainer>
      <Canvas
        shadows
        onCreated={handleCreated}
        resize={{ debounce: { scroll: 0, resize: 0 } }}
      >
        <ambientLight
          intensity={0.28}
          color={'#D5c9AE'}
          position={[-8.525, 50.726, 53.558]}
        />
        <directionalLight
          color={'#d4945b'}
          shadow-mapSize-height={4096}
          shadow-mapSize-width={4096}
          intensity={0.42}
          position={[-84.797, 40.178, 68.837]}
          shadow-camera-far={200}
          shadow-camera-left={-80}
          shadow-camera-right={80}
          shadow-camera-top={200}
          shadow-camera-bottom={-100}
          shadow-camera-near={0.1}
          shadow-normalBias={0.3}
        />
        <directionalLight
          color={'#d4945b'}
          shadow-mapSize-height={4096}
          shadow-mapSize-width={4096}
          intensity={0.68}
          position={[-36.48, 27.5, 52.2]}
          castShadow
          shadow-camera-far={200}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={200}
          shadow-camera-bottom={-100}
          shadow-camera-near={0.1}
          shadow-normalBias={0.3}
        />
        <Suspense fallback={null}>
          <Physics gravity={[0, -10, 0]}>
            <Debug color="lime">
              <Suspense fallback={null}>
                <DynamicScene
                  debug={true}
                  manifest={sceneManifest}
                  sceneId={3}
                  handlers={handlers}
                />
                <SceneScripts />
                <HandlerOverride />
              </Suspense>
            </Debug>
            {/* <Character /> */}
          </Physics>
        </Suspense>
        <PerspectiveCamera
          ref={cameraRef}
          makeDefault
          near={5}
          position={[-15.90839491599237, 77.8924675701337, 99.97212492039498]}
          rotation={[
            -0.6618925366384613, -0.12487213705609983, -0.052392943848409514
          ]}
          fov={75}
        />
        <ArcballControls />
      </Canvas>
    </PageContainer>
  );
}
