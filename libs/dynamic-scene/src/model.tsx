import { useGLTF } from '@react-three/drei';
import { isArray } from 'lodash';
import { memo, useMemo, useRef } from 'react';
import type { Group, Mesh, MeshStandardMaterial, Object3D } from 'three';
import type { GLTF } from 'three-stdlib/loaders/GLTFLoader';
import shallow from 'zustand/shallow';
import { composeEventHandlers } from './events/handler';
import { useSceneMesh } from './hook/use-scene-mesh';
import { ConvexPolyhedronCollider } from './physics/convex-polyhedron-collider';
import { TrimeshCollider } from './physics/trimesh-collider';
import { ModelManifest, PhysicsDescriptor } from './types/manifest';

export interface ModelProps {
  manifest: ModelManifest;
  castShadow?: boolean;
  receiveShadow?: boolean;
  debug: boolean;
}

type GLTFModel = {
  nodes: Record<string, Mesh>;
  materials: Record<string, MeshStandardMaterial>;
} & GLTF;

function isMesh(node?: Object3D): node is Mesh {
  return (node as Mesh)?.isMesh;
}

// const handleDebug = (
//   event: ThreeEvent<MouseEvent>,
//   props: ModelProps,
//   ref: MutableRefObject<Group | null>
// ) => {
//   event.stopPropagation();
//   console.log(`Click on model: ${props.manifest.src}`, event, ref?.current);
// };

export const Model = memo((props: ModelProps) => {
  const { src, name, transforms } = props.manifest;
  const { scene, nodes } = useGLTF(src) as GLTFModel;

  const ref = useRef<Group>(null);

  const { position, quaternion, scale } = transforms[0];

  const addModel = useSceneMesh(state => state.addModel);

  const [sceneFiltered, colliders] = useMemo(() => {
    const sceneFiltered = scene.clone();

    const meshes: Record<string, Mesh> = {};

    sceneFiltered.traverse(sceneNode => {
      if (isMesh(sceneNode)) {
        meshes[sceneNode.name] = sceneNode;

        // Apply shadows
        sceneNode.castShadow = props.castShadow ?? false;
        sceneNode.receiveShadow = props.receiveShadow ?? false;
      }
    });

    // Store references of meshes in store for later use
    addModel(name, meshes);

    const colliders: Record<
      string,
      { physics: PhysicsDescriptor; mesh: Mesh }
    > = {};

    if (isArray(props.manifest.physics) && props.manifest.physics.length > 0) {
      props.manifest.physics.forEach(colliderDescriptor => {
        const match = sceneFiltered.getObjectByName(colliderDescriptor.node);

        console.log(
          'collider',
          colliderDescriptor,
          match,
          nodes[colliderDescriptor.node]
        );
        if (match) {
          if (!isMesh(match)) {
            return console.error(
              'Collider node is not a mesh:',
              colliderDescriptor.node
            );
          }

          colliders[colliderDescriptor.node] = {
            physics: colliderDescriptor,
            mesh: match
          };

          // Mesh will be used as collider mesh only, thus will be removed from scene
          match.removeFromParent();
        } else {
          console.error(
            `collider not found in ${props.manifest.src} :`,
            colliderDescriptor.node
          );
        }
      });
    }

    return [sceneFiltered, colliders];
  }, [scene]);

  const handlers = useMemo(
    () =>
      props.manifest.events ? composeEventHandlers(props.manifest.events) : {},
    [props.manifest]
  );

  console.log('sceneFiltered', props.manifest.src, sceneFiltered, colliders);

  return (
    <>
      <group
        ref={ref}
        castShadow
        receiveShadow
        position={[position.x, position.y, position.z]}
        quaternion={[quaternion.x, quaternion.y, quaternion.z, quaternion.w]}
        // {...(props.debug ? { onClick: e => handleDebug(e, props, ref) } : {})}
        {...handlers}
        scale={[scale.x, scale.y, scale.z]}
      >
        <primitive object={sceneFiltered} dispose={null} />
      </group>
      {Object.keys(colliders).map(key => {
        const collider = colliders[key];

        switch (collider.physics.bodyType) {
          case 'ConvexPolyhedron':
            return (
              <ConvexPolyhedronCollider
                key={collider.mesh.uuid}
                node={collider.mesh}
                physics={collider.physics}
                parentTransform={{
                  position: { x: position.x, y: position.y, z: position.z },
                  quaternion: {
                    x: quaternion.x,
                    y: quaternion.y,
                    z: quaternion.z,
                    w: quaternion.w
                  },
                  scale
                }}
              />
            );
          case 'Trimesh':
            return (
              <TrimeshCollider
                key={collider.mesh.uuid}
                node={collider.mesh}
                physics={collider.physics}
                parentTransform={{
                  position: { x: position.x, y: position.y, z: position.z },
                  quaternion: {
                    x: quaternion.x,
                    y: quaternion.y,
                    z: quaternion.z,
                    w: quaternion.w
                  },
                  scale
                }}
              />
            );
          default:
            console.error(
              `Unknown body type of ${collider.mesh.name}: ${collider.physics.bodyType}`
            );
            return null;
        }
      })}
    </>
  );
}, shallow);
