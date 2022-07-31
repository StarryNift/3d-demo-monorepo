import { useAnimations, useFBX, useGLTF } from '@react-three/drei';
import { isArray } from 'lodash';
import { memo, useEffect, useMemo, useRef } from 'react';
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

export function patchScene(scene: Group, props: ModelProps) {
  const addModel = useSceneMesh(state => state.addModel);
  const addCollider = useSceneMesh(state => state.addCollider);

  const { colliders } = useMemo(() => {
    // Can not animate if using a cloned scene
    const meshes: Record<string, Mesh> = {};

    scene.traverse(sceneNode => {
      if (isMesh(sceneNode)) {
        meshes[sceneNode.name] = sceneNode;

        // Apply shadows
        sceneNode.castShadow = props.castShadow ?? false;
        sceneNode.receiveShadow = props.receiveShadow ?? false;
      }
    });

    // Store references of meshes in store for later use
    addModel(props.manifest.name, meshes);

    const colliders: Record<
      string,
      { physics: PhysicsDescriptor; mesh: Mesh }
    > = {};

    if (isArray(props.manifest.physics) && props.manifest.physics.length > 0) {
      props.manifest.physics.forEach(colliderDescriptor => {
        const match = scene.getObjectByName(colliderDescriptor.node);

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

          addCollider(match);

          // Does not render the mesh with the scene, will be handled by the collider component
          match.visible = false;
        } else {
          console.error(
            `collider not found in ${props.manifest.src} :`,
            colliderDescriptor.node
          );
        }
      });
    }

    return { colliders };
  }, [scene]);

  return { colliders };
}

export const GLTFModel = memo((props: ModelProps) => {
  const { src, transforms } = props.manifest;
  const { scene, animations } = useGLTF(src) as GLTFModel;

  const ref = useRef<Group>(null);

  const { position, quaternion, scale } = transforms[0];

  const animation = useAnimations(animations, ref);

  const { colliders } = patchScene(scene, props);

  useEffect(() => {
    // Play default animation
    if (props.manifest.animation?.playOnMount) {
      const defaultAnimationName = props.manifest.animation?.playOnMount;
      console.log('play default animation', animations, animation);

      if (animation.actions[defaultAnimationName]) {
        animation.actions[defaultAnimationName]?.play();
      } else {
        console.error(
          `Animation ${defaultAnimationName} not found in ${props.manifest.src}`
        );
      }
    }
  }, []);

  const handlers = useMemo(
    () =>
      props.manifest.events ? composeEventHandlers(props.manifest.events) : {},
    [props.manifest]
  );

  console.log('sceneFiltered', props.manifest.src, scene, colliders);

  return (
    <>
      <group
        ref={ref}
        position={[position.x, position.y, position.z]}
        quaternion={[quaternion.x, quaternion.y, quaternion.z, quaternion.w]}
        // {...(props.debug ? { onClick: e => handleDebug(e, props, ref) } : {})}
        {...handlers}
        scale={[scale.x, scale.y, scale.z]}
      >
        <primitive object={scene} dispose={null} />
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

export const FBXModel = memo((props: ModelProps) => {
  const { src, transforms } = props.manifest;
  const scene = useFBX(src);

  const ref = useRef<Group>(null);

  const { position, quaternion, scale } = transforms[0];

  const { colliders } = patchScene(scene, props);

  const handlers = useMemo(
    () =>
      props.manifest.events ? composeEventHandlers(props.manifest.events) : {},
    [props.manifest]
  );

  console.log('sceneFiltered', props.manifest.src, scene, colliders);

  return (
    <>
      <group
        ref={ref}
        position={[position.x, position.y, position.z]}
        quaternion={[quaternion.x, quaternion.y, quaternion.z, quaternion.w]}
        // {...(props.debug ? { onClick: e => handleDebug(e, props, ref) } : {})}
        {...handlers}
        scale={[scale.x, scale.y, scale.z]}
      >
        <primitive object={scene} dispose={null} />
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
