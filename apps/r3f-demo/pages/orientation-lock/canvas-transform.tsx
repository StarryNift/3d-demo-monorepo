import {
  Canvas,
  MeshProps,
  RootState,
  useFrame,
  useThree
} from '@react-three/fiber';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useMobileOrientation } from 'react-device-detect';
import styled from 'styled-components';
import { Mesh, PerspectiveCamera } from 'three';

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

export const PageContainer = styled.div`
  height: 100vh;
  width: 100%;
  overflow: hidden;
`;

export function MobileOrientationManager() {
  const orientation = useMobileOrientation();
  const renderer = useThree(state => state.gl);
  const camera: PerspectiveCamera = useThree(
    state => state.camera
  ) as PerspectiveCamera;
  console.log('render orientation manager');

  // NOTE: pointer issue
  // https://stackoverflow.com/questions/65727810/rotate-webgl-canvas-to-appear-landscape-oriented-on-a-portrait-oriented-mobile-p

  useEffect(() => {
    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;

    if (orientation.isPortrait) {
      const canvas = renderer.domElement;
      canvas.style.transform = `rotate(90deg) translate(0, -100%)`;
      canvas.style.transformOrigin = 'top left';

      camera.aspect = innerHeight / innerWidth;
      camera.updateProjectionMatrix();

      renderer.setSize(innerHeight, innerWidth);
    } else {
      const canvas = renderer.domElement;
      canvas.style.transform = ``;
      canvas.style.transformOrigin = 'top left';

      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(innerWidth, innerHeight);
    }
  }, [orientation.orientation]);

  return null;
}

// Component that renders only in client-side
const DynamicClientSideOnly = dynamic(
  () => Promise.resolve(MobileOrientationManager),
  {
    ssr: false
  }
);

export default function CanvasTransform() {
  // const cameraRef = useRef<PerspectiveCamera>();
  const canvasRef = useRef<HTMLCanvasElement>();

  const onCreated = (state: RootState) => {
    console.log('camera ref updated', state.camera);

    // cameraRef.current = state.camera as PerspectiveCamera;
  };

  console.log('render scene');

  return (
    <PageContainer>
      <Canvas
        className="canvas-override"
        ref={canvasRef}
        onCreated={onCreated}
        resize={{ debounce: { scroll: 0, resize: 0 } }}
      >
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Box position={[-1.2, 0, 0]} />
        <Box position={[1.2, 0, 0]} />
        <axesHelper args={[5]} />
        <DynamicClientSideOnly />
      </Canvas>
    </PageContainer>
  );
}
