import { useGLTF } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import { isArray } from 'lodash';
import { memo, useMemo, useRef } from 'react';
import { Group, Mesh, MeshStandardMaterial, Object3D, Vector3 } from 'three';
import { MathUtils } from 'three';
import type { GLTF } from 'three-stdlib/loaders/GLTFLoader';
import shallow from 'zustand/shallow';
import { ConvexPolyhedronCollider } from './physics/convex-polyhedron-collider';
import { TrimeshCollider } from './physics/trimesh-collider';
import { ModelManifest, PhysicsDescriptor } from './types/manifest';

export interface ModelProps {
  manifest: ModelManifest;
  debug: boolean;
}

type GLTFModel = {
  nodes: Record<string, Mesh>;
  materials: Record<string, MeshStandardMaterial>;
} & GLTF;

function isMesh(node?: Object3D): node is Mesh {
  return (node as Mesh)?.isMesh;
}

export const Model = memo((props: ModelProps) => {
  const { src, transforms } = props.manifest;
  const { scene, nodes, materials } = useGLTF(src) as GLTFModel;

  const ref = useRef<Group>(null);

  const { position, eulerAngles, scale } = transforms[0];

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    console.log(`Click on model: ${props.manifest.src}`, event, ref.current);
  };

  const [sceneFiltered, colliders] = useMemo(() => {
    const sceneFiltered = scene.clone();
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
          sceneFiltered.remove(match);
          // match.visible = colliderDescriptor.render ?? false;

          // Add parent position to collider position
          // match.position.add(new Vector3(-position.x, position.y, position.z));
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

  console.log('sceneFiltered', props.manifest.src, sceneFiltered, colliders);

  return (
    <>
      <group
        ref={ref}
        castShadow
        receiveShadow
        position={[-position.x, position.y, position.z]}
        rotation={[
          MathUtils.degToRad(eulerAngles.x),
          -MathUtils.degToRad(eulerAngles.y),
          MathUtils.degToRad(eulerAngles.z)
        ]}
        {...(props.debug ? { onClick } : {})}
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
                  position: { x: -position.x, y: position.y, z: position.z },
                  eulerAngles: {
                    x: MathUtils.degToRad(eulerAngles.x),
                    y: -MathUtils.degToRad(eulerAngles.y),
                    z: MathUtils.degToRad(eulerAngles.z)
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
                  position: { x: -position.x, y: position.y, z: position.z },
                  eulerAngles: {
                    x: MathUtils.degToRad(eulerAngles.x),
                    y: -MathUtils.degToRad(eulerAngles.y),
                    z: MathUtils.degToRad(eulerAngles.z)
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
