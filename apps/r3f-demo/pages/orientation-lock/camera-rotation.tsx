import {
  Canvas,
  MeshProps,
  RootState,
  useFrame,
  useThree
} from '@react-three/fiber';
import { useControls } from 'leva';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useMobileOrientation } from 'react-device-detect';
import styled from 'styled-components';
import type { Mesh, PerspectiveCamera } from 'three';

function Box(props: Partial<MeshProps>) {
  // This reference will give us direct access to the mesh
  const mesh = useRef<Mesh>();
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (mesh.current!.rotation.x += 0.01));
  // Return view, these are regular three.js elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? 1.5 : 1}
      onClick={event => setActive(!active)}
      onPointerOver={event => {
        console.log(event);
        setHover(true);
      }}
      onPointerOut={event => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
}

function Background(props: { color: string }) {
  const values = useControls({ bgColor: { value: props.color } });

  return <color attach="background" args={[values.bgColor]}></color>;
}

export function MobileOrientationManager() {
  const orientation = useMobileOrientation();
  const [values, set] = useControls(() => ({
    orientation: orientation.orientation
  }));
  const camera: PerspectiveCamera = useThree(
    state => state.camera
  ) as PerspectiveCamera;
  console.log('render orientation manager', camera.fov);

  useEffect(() => {
    if (orientation.isPortrait) {
      camera.rotation.z = Math.PI / 2;
      camera.fov = 110;
    } else {
      camera.rotation.z = 0;
      // default
      camera.fov = 75;
    }

    camera.updateProjectionMatrix();

    console.log('orientation', orientation, camera, camera.rotation);

    set({
      orientation: orientation.orientation
    });
  }, [orientation, camera]);

  return null;
}

// Component that renders only in client-side
const DynamicClientSideOnly = dynamic(
  () => Promise.resolve(MobileOrientationManager),
  {
    ssr: false
  }
);

export const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
`;

export default function RotatingBox() {
  const cameraRef = useRef<PerspectiveCamera>();
  const onCreated = (state: RootState) => {
    console.log('camera ref updated', state.camera);
    // state.camera.rotateZ(Math.PI / 2);
    // console.log(virtualCamera.current);
    // console.log(cameraRef.current);
    // state.camera.rotateZ(Math.PI / 2);
    // cameraRef.current.rotateZ(Math.PI / 2);
    cameraRef.current = state.camera as PerspectiveCamera;
  };

  console.log('render');

  return (
    <PageContainer>
      <Canvas
        onCreated={onCreated}
        resize={{ debounce: { scroll: 0, resize: 0 } }}
      >
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Box position={[-1.2, 0, 0]} />
        <Box position={[1.2, 0, 0]} />
        <Background color={'#454545'} />
        {/* <ArcballControls /> */}
        <DynamicClientSideOnly />
        <axesHelper args={[5]} />
      </Canvas>
    </PageContainer>
  );
}
