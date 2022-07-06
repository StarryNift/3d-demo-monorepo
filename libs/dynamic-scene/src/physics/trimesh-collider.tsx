import { useTrimesh } from '@react-three/cannon';
import { memo } from 'react';
import { Mesh, MeshStandardMaterial } from 'three';
import shallow from 'zustand/shallow';
import type { ModelTransform, PhysicsDescriptor } from '../types/manifest';

export interface TrimeshColliderProps {
  physics?: PhysicsDescriptor;
  node: Mesh;
  material?: MeshStandardMaterial;
  parentTransform?: ModelTransform;
}

export const TrimeshCollider = memo(
  ({
    node,
    physics,
    material,
    parentTransform = {
      position: { x: 0, y: 0, z: 0 },
      quaternion: { x: 0, y: 0, z: 0, w: 0 },
      scale: { x: 0, y: 0, z: 0 }
    }
  }: TrimeshColliderProps) => {
    console.log('TriMeshCollider', {
      node,
      physics,
      material,
      parentTransform
    });

    const [ref, _api] = useTrimesh(
      () => ({
        // ...props,
        name: node.name,
        userData: node.userData,
        args: [
          node.geometry.attributes['position'].array,
          node.geometry.index!.array
        ],
        position: [
          node.position.x + parentTransform.position.x,
          node.position.y + parentTransform.position.y,
          node.position.z + parentTransform.position.z
        ],
        // NOTE: Needs to be passed in
        type: 'Static',
        // NOTE: Needs to be passed in
        mass: 1,
        // material: props.physics?.material ?? 'default',
        material: {
          friction: 0.1
        },
        // NOTE: Needs to be passed in
        collisionFilterGroup: 1
        // collisionFilterMask: 7
      })
      // useRef(node)
    );

    if (physics?.render) {
      // NOTE: material information is not available at this point
      return <primitive ref={ref} object={node} />;
    }

    return <></>;
  },
  shallow
);
