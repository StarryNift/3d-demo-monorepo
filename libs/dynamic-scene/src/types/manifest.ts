export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface PhysicsDescriptor {
  bodyType: 'ConvexPolyhedron' | 'Trimesh';
  /**
   * Name of the sub-mesh to use for the physics body.
   */
  node: string;
  /**
   * Physics collider material.
   */
  material?: string;
  /**
   * Whether the mesh should be rendered in renderer or not.
   */
  render?: boolean;
}

export interface ModelTransform {
  position: Vector3;
  // eulerAngles?: Vector3;
  quaternion: { x: number; y: number; z: number; w: number };
  scale: Vector3;
}

export interface ModelManifest {
  src: string;
  transforms: Array<ModelTransform>;
  physics?: Array<PhysicsDescriptor>;
}

export interface ManifestJson {
  models: ModelManifest[];
  environment: any;
}
