import { OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Leva, useControls } from 'leva';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import type { Group } from 'three';
import { AnimationMixer } from 'three';
import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface CharacterViewerStoreProps {
  url: string;
  animationUrl: string;
  animation: string;
}

const useCharacterViewerStore = create<CharacterViewerStoreProps>()(
  subscribeWithSelector((set, get) => ({
    // 'https://d1a370nemizbjq.cloudfront.net/4c031014-abbc-43b1-8cce-e846dc2ee234.glb'
    url: 'https://d1a370nemizbjq.cloudfront.net/13dab571-c2b7-4074-92de-da0f34631608.glb',
    animationUrl: '/rpm_animations.glb',
    animation: 'Idle'
  }))
);

export interface CharacterProps {
  url: string;
}

export function Character() {
  const modelRef = useRef<Group>();
  const url = useCharacterViewerStore(state => state.url);
  const animationUrl = useCharacterViewerStore(state => state.animationUrl);

  const { scene } = useGLTF(url);
  const { animations } = useGLTF(animationUrl);

  // Similar logics inside useAnimations
  const { names, actions, mixer } = useMemo(() => {
    // NOTE: AnimationMixer is bound to the model
    const mixer = new AnimationMixer(scene);
    const lazyActions = {};

    const actions = {};
    animations.forEach(clip =>
      Object.defineProperty(actions, clip.name, {
        enumerable: true,

        get() {
          return (
            lazyActions[clip.name] ||
            (lazyActions[clip.name] = mixer.clipAction(clip, scene))
          );
        }
      })
    );
    return {
      actions,
      names: animations.map(c => c.name),
      mixer
    };
  }, [scene]);

  // Update animation every frame
  useFrame((state, delta) => mixer.update(delta));

  useEffect(() => {
    const defaultAnimation = useCharacterViewerStore.getState().animation;
    let prevAnimation: string;

    if (defaultAnimation in actions) {
      actions[defaultAnimation].play();
      prevAnimation = defaultAnimation;
    }

    const unsub = useCharacterViewerStore.subscribe(
      state => state.animation,
      animation => {
        console.log('start animation', animation, actions[animation]);
        if (prevAnimation) {
          actions[prevAnimation].fadeOut(0.3);
        }

        actions[animation].reset().fadeIn(0.3).play();
        prevAnimation = animation;
      }
    );

    return () => {
      if (prevAnimation) {
        actions[prevAnimation]?.fadeOut(0.3);
      }

      mixer.uncacheRoot(scene);

      console.log('cleanup', mixer, scene);

      unsub();
    };
  }, [mixer]);

  return (
    <group name="character">
      <primitive object={scene} ref={modelRef} />
    </group>
  );
}

export function Controller() {
  const animationUrl = useCharacterViewerStore(state => state.animationUrl);
  const { animations } = useGLTF(animationUrl);

  useControls({
    modelUrl: {
      value: useCharacterViewerStore.getState().url,
      onChange: (value: string) =>
        useCharacterViewerStore.setState({ url: value })
    },
    animationUrl: {
      value: animationUrl,
      editable: false
    },
    animation: {
      value: useCharacterViewerStore.getState().animation,
      options: animations.map(({ name }) => name),
      onChange: (value: string) =>
        useCharacterViewerStore.setState({ animation: value })
    }
  });

  useEffect(() => {
    const found = animations.find(
      ({ name }) => name === useCharacterViewerStore.getState().animation
    );

    console.log('found', found);

    if (found) {
      useCharacterViewerStore.setState({ animation: found.name });
    }
  }, []);

  return null;
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
          <Character />
          <OrbitControls />
          <Controller />
        </Suspense>
        <gridHelper args={[10, 10]} />
        <axesHelper />
      </Canvas>
      <Leva oneLineLabels={true} />
    </PageContainer>
  );
}
