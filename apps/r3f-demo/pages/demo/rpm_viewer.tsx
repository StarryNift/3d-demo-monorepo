import { OrbitControls, useAnimations, useGLTF } from '@react-three/drei';
import { Canvas, RootState } from '@react-three/fiber';
import { useControls } from 'leva';
import { Suspense, useEffect, useRef } from 'react';
import styled from 'styled-components';
import type { Group } from 'three';
import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface CharacterViewerStoreProps {
  url: string;
  animationUrl: string;
  animation: string;
}

const useCharacterViewerStore = create<CharacterViewerStoreProps>()(
  subscribeWithSelector((set, get) => ({
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
  const { names, actions, mixer } = useAnimations(animations, modelRef);

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
        console.log('start animation', animation);
        if (prevAnimation) {
          actions[prevAnimation].fadeOut(0.3);
        }

        actions[animation].reset().fadeIn(0.3).play();
        prevAnimation = animation;
      }
    );

    return () => {
      if (prevAnimation) {
        actions[prevAnimation].fadeOut(0.3);
      }

      unsub();
    };
  }, []);

  console.log('render character');

  return (
    <group name="character" ref={modelRef}>
      <primitive object={scene} dispose={null} />
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
      disabled: true
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
    </PageContainer>
  );
}
