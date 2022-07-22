import { TextSprite } from '@3d/text-sprite';
import type { BoxProps, SphereProps } from '@react-three/cannon';
import { OrbitControls } from '@react-three/drei';
import { Canvas, RootState, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Group, Mesh, Object3D, Raycaster } from 'three';

export interface InteractiveProps {
  interactive?: boolean;
  name?: string;
}

export function Box({
  args,
  interactive,
  name,
  ...props
}: Pick<BoxProps, 'args' | 'position' | 'rotation'> & InteractiveProps) {
  const ref = useRef<Group>();
  const meshRef = useRef<Mesh>();
  const [text, setText] = useState(name);

  useEffect(() => {
    console.log('userData of trigger', ref.current.userData);

    meshRef.current.addEventListener('lookAtStart', e => {
      console.log('lookAtStart', name, e);
      setText(`${name}\nYou are looking at me! ❤️`);
    });

    meshRef.current.addEventListener('lookAtEnd', e => {
      console.log('lookAtEnd', name, e);
      setText(name);
    });
  }, []);

  return (
    <group name={`${name}_group`} receiveShadow castShadow ref={ref} {...props}>
      <mesh ref={meshRef} name={`${name}_mesh`}>
        <boxGeometry args={args} />
        <meshPhongMaterial color="white" opacity={0.8} transparent />
      </mesh>
      <TextSprite
        name={`${name}_label`}
        bgColor={'#7a0000'}
        fontColor={'#ffffff'}
        fontFamily={'Microsoft JhengHei'}
        // italic
        text={text}
        position={[0, 0.8, 0]}
      />
    </group>
  );
}

export function Sphere({
  args,
  interactive,
  name,
  ...props
}: Pick<SphereProps, 'args' | 'position' | 'rotation'> & InteractiveProps) {
  const ref = useRef<Group>();
  const meshRef = useRef<Mesh>();

  useEffect(() => {
    console.log('userData of trigger', ref.current.userData);
  });

  const text = `我是${name}
我是一个球体
`;

  return (
    <group name={`${name}_group`} receiveShadow castShadow ref={ref} {...props}>
      <mesh ref={meshRef} receiveShadow castShadow>
        <sphereGeometry args={args} />
        <meshPhongMaterial color="white" opacity={0.8} transparent />
      </mesh>
      <TextSprite
        name={`${name}_label`}
        bgColor="rgba(255, 255, 255, 0.8)"
        fontFamily={'幼圆, Microsoft JhengHei'}
        italic
        textAlign="right"
        text={text}
        borderRadius={8}
        position={[0, 2, 0]}
      />
    </group>
  );
}

export const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
`;

export function Helper() {
  const camera = useThree(state => state.camera);
  const scene = useThree(state => state.scene);
  let counter = 0;
  const raycaster = useRef<Raycaster>(new Raycaster());
  const lookingAt = useRef<Set<Object3D>>(new Set());

  useEffect(() => {
    console.log(scene.children);
  });

  useFrame(() => {
    if (counter++ % 12 === 0) {
      raycaster.current.setFromCamera(
        {
          x: 0,
          y: 0
        },
        camera
      );
      raycaster.current.near = 0;
      const resp = raycaster.current.intersectObjects(
        scene.children.filter(
          i =>
            i.constructor.name !== 'AxesHelper' &&
            i.constructor.name !== 'GridHelper'
        ),
        true
      );

      lookingAt.current.forEach(o => {
        const match = resp.find(j => j.object === o);

        if (!match) {
          lookingAt.current.delete(o);
          o.dispatchEvent({
            target: o,
            type: 'lookAtEnd'
          });
        }
      });

      resp.forEach(i => {
        if (!lookingAt.current.has(i.object)) {
          lookingAt.current.add(i.object);
          i.object.dispatchEvent({
            target: i.object,
            type: 'lookAtStart',
            intersection: i
          });
        }
      });

      // console.log(lookingAt.current.map(i => i.object.name));
      // console.log(resp);
    }
  });

  return null;
}

export default function LookAt() {
  const onCreated = (state: RootState) => {
    console.log('canvas created ');

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
        {/* <Box name="floor" args={[100, 100, 2]} rotation-x={-Math.PI / 2} /> */}
        <Box name="boxA" args={[1, 1, 1]} position={[10, 4, -10]} />
        <Box name="💬..." args={[1, 1, 1]} position={[5, -2, -1]} />
        <Box name="方块" args={[1, 1, 1]} position={[0, 0, 0]} />
        <Sphere name="sphere" args={[1]} position={[-5, 1, -5]} />
        <axesHelper args={[10]} />
        <gridHelper args={[100, 100]} />
        <OrbitControls />
        <Helper />
      </Canvas>
    </PageContainer>
  );
}
