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

export interface EventDescriptor {
  /**
   * Name of the sub-mesh that will receive the event.
   */
  node: string;
  /**
   * Event name.
   */
  event: 'leave' | 'enter' | 'click';

  /**
   * Name of custom event handler.
   */
  handler: string;

  /**
   * Max distance allowed to trigger the event.
   * NOTE: distance is measured from the center of the camera.
   */
  maxDistance?: number;
}

export interface AnimationDescriptor {
  playOnMount?: string;
}

export interface ModelTransform {
  position: Vector3;
  // eulerAngles?: Vector3;
  quaternion: { x: number; y: number; z: number; w: number };
  scale: Vector3;
}

export interface ModelManifest {
  src: string;
  name: string;
  transforms: Array<ModelTransform>;
  physics?: Array<PhysicsDescriptor>;
  events?: Array<EventDescriptor>;
  animation?: AnimationDescriptor;
}

export interface ManifestJson {
  models: ModelManifest[];
  environment: any;
}
