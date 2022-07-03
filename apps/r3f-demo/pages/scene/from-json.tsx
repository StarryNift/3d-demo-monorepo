import { ThirdPersonControls } from '@3d/third-person-controls';
import { DynamicScene, ManifestJson } from '@3d/dynamic-scene';
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
import { Suspense, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Group } from 'three';

export const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
`;

const sceneManifest: ManifestJson = {
  models: [
    {
      src: 'https://starrynift.s3.ap-southeast-1.amazonaws.com/web/3D/MUA/models/village.glb',
      transforms: [
        {
          position: {
            x: 0.0,
            y: 0.0,
            z: -31.9
          },
          eulerAngles: {
            x: 0.0,
            y: 0.0,
            z: 0.0
          },
          scale: {
            x: 1.0,
            y: 1.0,
            z: 1.0
          }
        }
      ],
      physics: [
        {
          bodyType: 'ConvexPolyhedron',
          node: 'G-__557877',
          material: 'ground',
          render: true
        },
        {
          bodyType: 'ConvexPolyhedron',
          node: 'G-__557967',
          material: 'ground',
          render: true
        }
      ]
    },
    {
      src: 'https://starrynift.s3.ap-southeast-1.amazonaws.com/web/3D/MUA/models/V3.5.glb',
      transforms: [
        {
          position: {
            x: -35.06,
            y: 0.0,
            z: 40.39
          },
          eulerAngles: {
            x: 0.0,
            y: 0.0,
            z: 0.0
          },
          scale: {
            x: 1.0,
            y: 1.0,
            z: 1.0
          }
        }
      ]
    },
    // {
    //   src: 'https://starrynift.s3.ap-southeast-1.amazonaws.com/web/3D/MUA/models/village_ground.glb',
    //   transforms: [
    //     {
    //       position: {
    //         x: 0.0,
    //         y: -1.2,
    //         z: 0.0
    //       },
    //       eulerAngles: {
    //         x: 0.0,
    //         y: 0.0,
    //         z: 0.0
    //       },
    //       scale: {
    //         x: 1.0,
    //         y: 1.0,
    //         z: 1.0
    //       }
    //     }
    //   ]
    //   // physics: [
    //   //   {
    //   //     bodyType: 'ConvexPolyhedron',
    //   //     node: '平面007',
    //   //     material: 'ground',
    //   //     render: true
    //   //   }
    //   // ]
    // },
    {
      src: 'https://starrynift.s3.ap-southeast-1.amazonaws.com/web/3D/MUA/models/V1.5.glb',
      transforms: [
        {
          position: {
            x: 35.8,
            y: 0.0,
            z: 35.5
          },
          eulerAngles: {
            x: -1.457757e-6,
            y: 321.866272,
            z: -4.21763571e-6
          },
          scale: {
            x: 1.0,
            y: 1.0,
            z: 1.0
          }
        }
      ]
    },
    {
      src: 'https://starrynift.s3.ap-southeast-1.amazonaws.com/web/3D/MUA/models/V7.4.glb',
      transforms: [
        {
          position: {
            x: 35.05,
            y: 0.0,
            z: -19.31
          },
          eulerAngles: {
            x: -5.85799671e-6,
            y: 278.183136,
            z: -6.760645e-6
          },
          scale: {
            x: 1.0,
            y: 1.0,
            z: 1.0
          }
        }
      ]
    },
    {
      src: 'https://starrynift.s3.ap-southeast-1.amazonaws.com/web/3D/MUA/models/V5.4.glb',
      transforms: [
        {
          position: {
            x: -32.98,
            y: 0.0,
            z: -23.16
          },
          eulerAngles: {
            x: -4.192343e-6,
            y: 67.2815,
            z: 6.30025761e-6
          },
          scale: {
            x: 1.0,
            y: 1.0,
            z: 1.0
          }
        }
      ]
    },
    {
      src: 'https://starrynift.s3.ap-southeast-1.amazonaws.com/web/3D/MUA/models/plant_layout.glb',
      transforms: [
        {
          position: {
            x: -1.9,
            y: 0.0,
            z: -14.2
          },
          eulerAngles: {
            x: 0.0,
            y: 0.0,
            z: 0.0
          },
          scale: {
            x: 1.0619,
            y: 1.0619,
            z: 1.0619
          }
        }
      ]
    },
    {
      src: 'https://starrynift.s3.ap-southeast-1.amazonaws.com/web/3D/MUA/models/V6.4.glb',
      transforms: [
        {
          position: {
            x: 2.52,
            y: 0.0,
            z: 47.7
          },
          eulerAngles: {
            x: 0.0,
            y: 0.0,
            z: 0.0
          },
          scale: {
            x: 1.0,
            y: 1.0,
            z: 1.0
          }
        }
      ]
    },
    {
      src: 'https://starrynift.s3.ap-southeast-1.amazonaws.com/web/3D/MUA/models/v8.4.glb',
      transforms: [
        {
          position: {
            x: -36.29,
            y: 0.0,
            z: 17.87
          },
          eulerAngles: {
            x: 0.0,
            y: 227.534485,
            z: 0.0
          },
          scale: {
            x: 1.0,
            y: 1.0,
            z: 1.0
          }
        }
      ]
    },
    {
      src: 'https://starrynift.s3.ap-southeast-1.amazonaws.com/web/3D/MUA/models/V4.5.glb',
      transforms: [
        {
          position: {
            x: -26.32,
            y: 0.0,
            z: -32.07
          },
          eulerAngles: {
            x: 0.0,
            y: 0.0,
            z: 0.0
          },
          scale: {
            x: 1.0,
            y: 1.0,
            z: 1.0
          }
        }
      ]
    },
    {
      src: 'https://starrynift.s3.ap-southeast-1.amazonaws.com/web/3D/MUA/models/V2.6.glb',
      transforms: [
        {
          position: {
            x: 2.2,
            y: 0.0,
            z: -33.2
          },
          eulerAngles: {
            x: 0.0,
            y: 0.0,
            z: 0.0
          },
          scale: {
            x: 1.0,
            y: 1.0,
            z: 1.0
          }
        }
      ]
    },
    {
      src: 'https://starrynift.s3.ap-southeast-1.amazonaws.com/web/3D/MUA/models/V9.1.glb',
      transforms: [
        {
          position: {
            x: 47.6,
            y: 0.0,
            z: 16.3
          },
          eulerAngles: {
            x: 0.0,
            y: 0.0,
            z: 0.0
          },
          scale: {
            x: 1.0,
            y: 1.0,
            z: 1.0
          }
        }
      ]
    }
  ]
};

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

export default function SceneFromJson() {
  const cameraRef = useRef<PerspectiveCameraProps>();

  const handleCreated = (scene: RootState) => {
    console.log(scene, cameraRef.current);
  };

  return (
    <PageContainer>
      <Canvas
        onCreated={handleCreated}
        resize={{ debounce: { scroll: 0, resize: 0 } }}
      >
        <directionalLight
          color={'white'}
          shadow-mapSize-height={4096}
          shadow-mapSize-width={4096}
          intensity={0.86}
          position={[-7.014, 74.508, 49.297]}
          castShadow
          shadow-camera-far={200}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={200}
          shadow-camera-bottom={-100}
          shadow-camera-near={0.1}
          shadow-normalBias={0.3}
        />
        <Physics gravity={[0, -10, 0]}>
          <Debug color="lime">
            <Suspense fallback={null}>
              <DynamicScene debug={true} manifest={sceneManifest} sceneId={3} />
              {/* <Character /> */}
            </Suspense>
          </Debug>
        </Physics>
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
