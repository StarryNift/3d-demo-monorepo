import type { ConvexPolyhedronProps } from '@react-three/cannon';
import { useConvexPolyhedron } from '@react-three/cannon';
import { memo, useMemo } from 'react';
import { BufferGeometry, Mesh, MeshStandardMaterial } from 'three';
import { Geometry } from 'three-stdlib';
import shallow from 'zustand/shallow';
import type { ModelTransform, PhysicsDescriptor } from '../types/manifest';

export interface ConvexPolyhedronColliderProps {
  physics?: PhysicsDescriptor;
  node: Mesh;
  material?: MeshStandardMaterial;
  parentTransform?: ModelTransform;
}

// Returns legacy geometry vertices, faces for ConvP
function toConvexProps(
  bufferGeometry: BufferGeometry
): ConvexPolyhedronProps['args'] {
  const geo = new Geometry().fromBufferGeometry(bufferGeometry);
  // Merge duplicate vertices resulting from glTF export.
  // Cannon assumes contiguous, closed meshes to work
  geo.mergeVertices();
  return [
    geo.vertices.map(v => [v.x, v.y, v.z]),
    geo.faces.map(f => [f.a, f.b, f.c]),
    []
  ];
}

export const ConvexPolyhedronCollider = memo(
  ({
    node,
    physics,
    material,
    parentTransform = {
      position: { x: 0, y: 0, z: 0 },
      quaternion: { x: 0, y: 0, z: 0, w: 1 },
      scale: { x: 0, y: 0, z: 0 }
    }
  }: ConvexPolyhedronColliderProps) => {
    console.log('ConvexPolyhedronCollider', {
      node,
      physics,
      material,
      parentTransform
    });

    const geo = useMemo(() => toConvexProps(node.geometry), [node]);
    const [ref, _api] = useConvexPolyhedron(
      () => ({
        // ...props,
        name: node.name,
        userData: node.userData,
        args: geo,
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
