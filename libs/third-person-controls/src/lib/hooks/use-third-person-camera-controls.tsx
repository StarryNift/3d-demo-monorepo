import * as THREE from 'three';
import { useState, useEffect, SyntheticEvent, MutableRefObject } from 'react';
import { Group, Object3D, PerspectiveCamera, Raycaster } from 'three';
import { InputEventManager } from './use-input-event-manager';

/*
 * Based on code written by knav.eth for chainspace (https://somnet.chainrunners.xyz/chainspace)
 */
const CameraControlOperation = {
  NONE: -1,
  ROTATE: 0,
  TOUCH_ROTATE: 3,
  TOUCH_ZOOM_ROTATE: 6
};

const ROTATION_ANGLE = new THREE.Vector3(0, 1, 0);

class CameraState {
  operation = CameraControlOperation.NONE;
  pointers: any[] = [];
  pointerPositions: any = {};

  reset() {
    this.operation = CameraControlOperation.NONE;
    this.pointers = [];
    this.pointerPositions = {};
  }
}

class ThirdPersonCameraControls {
  enabled = true;
  // How far you can zoom in and out ( PerspectiveCamera only )
  minDistance = 0;
  maxDistance = Infinity;

  // How far you can orbit vertically, upper and lower limits.
  // Range is 0 to Math.PI radians.
  minPolarAngle = 0;
  maxPolarAngle = Math.PI;

  enableZoom = true;
  zoomSpeed = 1.75;

  enableRotate = true;
  rotateSpeed = 1.0;

  // "target" sets the location of focus, where the object orbits around
  targetOffset = new THREE.Vector3(0, 0, 0);

  spherical = new THREE.Spherical(3.5, Math.PI / 3, Math.PI);

  rotateStart = new THREE.Vector2();
  rotateEnd = new THREE.Vector2();
  rotateDelta = new THREE.Vector2();

  zoomStart = new THREE.Vector2();
  zoomEnd = new THREE.Vector2();
  zoomDelta = new THREE.Vector2();

  outerCameraContainer = new THREE.Object3D();

  private cameraState: CameraState;
  private cameraContainer: any;
  private input: any;
  private lastCheck: number = 0;
  private rightClickTime: number = 0;

  constructor(
    private camera: PerspectiveCamera,
    private domElement: HTMLCanvasElement,
    private target: Object3D,
    inputManager: InputEventManager,
    options: any = {},
    cameraContainer: Object3D
  ) {
    this.camera = camera;
    this.cameraState = new CameraState();
    this.cameraContainer = cameraContainer;
    this.domElement = domElement;

    this.input = {};
    const k = 'camera';
    inputManager.subscribe('wheel', k, this.handleMouseWheel.bind(this));
    inputManager.subscribe(
      'pointerlockchange',
      k,
      this.onPointerLockChange.bind(this)
    );
    inputManager.subscribe('pointerdown', k, this.onPointerDown.bind(this));
    inputManager.subscribe('pointerup', k, this.onPointerUp.bind(this));
    inputManager.subscribe('pointermove', k, this.onPointerMove.bind(this));
    inputManager.subscribe('pointercancel', k, this.onPointerCancel.bind(this));
    inputManager.subscribe('pointerlockerror', k, (e: any) =>
      console.error('POINTERLOCK ERROR ', e)
    );
    inputManager.subscribe('contextmenu', k, this.onContextMenu.bind(this));
    this.targetOffset.y = options?.yOffset ?? 1.6;
    this.outerCameraContainer.position.copy(this.targetOffset);
    this.outerCameraContainer.add(this.cameraContainer);

    this.target = target;
    this.target.add(this.outerCameraContainer);
  }

  _cameraPos = new THREE.Vector3();
  _raycastTargetVector = new THREE.Vector3();

  getCameraPosition(rayResult: any) {
    this.cameraContainer.position.setFromSphericalCoords(
      this.spherical.radius,
      this.spherical.phi,
      this.spherical.theta
    );

    // if (rayResult.hasHit) {
    //   this.cameraContainer.position.setFromSphericalCoords(
    //     rayResult.distance - 0.1,
    //     this.spherical.phi,
    //     this.spherical.theta
    //   );
    // }

    this.cameraContainer.getWorldPosition(this._cameraPos);
    return this._cameraPos;
  }

  _workingVec = new THREE.Vector3();

  getCameraLookVec() {
    this.target.getWorldPosition(this._workingVec).add(this.targetOffset);
    return this._workingVec;
  }

  _workingQuat = new THREE.Quaternion();

  update(rayResult: any) {
    if (this.input.isMouseLooking) {
      this._workingQuat.setFromAxisAngle(
        ROTATION_ANGLE,
        this.spherical.theta - Math.PI
      );

      this.target.quaternion.multiply(this._workingQuat);
      this.spherical.theta = Math.PI;
    }

    // restrict phi to be between desired limits
    this.spherical.phi = Math.max(
      this.minPolarAngle,
      Math.min(this.maxPolarAngle, this.spherical.phi)
    );
    this.spherical.makeSafe();

    // restrict radius to be between desired limits
    this.spherical.radius = Math.max(
      this.minDistance,
      Math.min(this.maxDistance, this.spherical.radius)
    );

    // copy maths to actual three.js camere
    this.camera.position.copy(this.getCameraPosition(rayResult));
    this.camera.lookAt(this.getCameraLookVec());
  }

  getZoomScale() {
    return 0.95 ** this.zoomSpeed;
  }

  rotateLeft(angle: number) {
    this.spherical.theta -= angle;
  }

  rotateUp(angle: number) {
    this.spherical.phi -= angle;
  }

  handleApplyRotate(speedMultiplier = 1) {
    this.rotateDelta
      .subVectors(this.rotateEnd, this.rotateStart)
      .multiplyScalar(this.rotateSpeed * speedMultiplier);

    const element = this.domElement;

    this.rotateLeft((2 * Math.PI * this.rotateDelta.x) / element.clientHeight); // yes, height

    this.rotateUp((2 * Math.PI * this.rotateDelta.y) / element.clientHeight);

    this.rotateStart.copy(this.rotateEnd);
  }

  /**
   * Zoom in by the given scale.
   */
  zoomOut(zoomScale: number) {
    this.spherical.radius /= zoomScale;
  }

  /**
   * Zoom out by the given scale.
   */
  zoomIn(zoomScale: number) {
    this.spherical.radius *= zoomScale;
  }

  // Event Handlers

  /**
   * Start moving the camera by dragging the mouse
   */
  handleMouseDownRotate(event: MouseEvent) {
    this.rotateEnd.set(event.clientX, event.clientY);
    this.rotateStart.set(event.clientX, event.clientY);
  }

  /**
   * Moving the camera by dragging the mouse
   */
  handleMouseMoveRotate(event: MouseEvent) {
    if (document.pointerLockElement === this.domElement) {
      this.rotateEnd.x += event.movementX * 0.25;
      this.rotateEnd.y += event.movementY * 0.25 * 0.8;
    } else {
      this.domElement.requestPointerLock();
      this.domElement.style.cursor = 'none';
      this.rotateEnd.set(event.clientX, event.clientY);
    }
    // Apply camera rotation
    this.handleApplyRotate();
  }

  /**
   * Zoom in/out camera by mouse wheel
   */
  handleMouseWheel(event: WheelEvent) {
    if (event.deltaY < 0) {
      // Scroll up
      this.zoomIn(this.getZoomScale());
    } else if (event.deltaY > 0) {
      // Scroll down
      this.zoomOut(this.getZoomScale());
    }
  }

  handleTouchStartRotate() {
    if (this.cameraState.pointers.length === 1) {
      this.rotateStart.set(
        this.cameraState.pointers[0].pageX,
        this.cameraState.pointers[0].pageY
      );
    } else {
      const x =
        0.5 *
        (this.cameraState.pointers[0].pageX +
          this.cameraState.pointers[1].pageX);
      const y =
        0.5 *
        (this.cameraState.pointers[0].pageY +
          this.cameraState.pointers[1].pageY);

      this.rotateStart.set(x, y);
    }
  }

  handleTouchStartZoom() {
    const dx =
      this.cameraState.pointers[0].pageX - this.cameraState.pointers[1].pageX;
    const dy =
      this.cameraState.pointers[0].pageY - this.cameraState.pointers[1].pageY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    this.zoomStart.set(0, distance);
  }

  handleTouchStartZoomRotate() {
    if (this.enableZoom) this.handleTouchStartZoom();

    if (this.enableRotate) this.handleTouchStartRotate();
  }

  handleTouchMoveRotate(event: any) {
    if (this.cameraState.pointers.length === 1) {
      this.rotateEnd.set(event.pageX, event.pageY);
    } else {
      const position = this.getSecondPointerPosition(event);

      const x = 0.5 * (event.pageX + position.x);
      const y = 0.5 * (event.pageY + position.y);

      this.rotateEnd.set(x, y);
    }

    this.handleApplyRotate(1.3);
  }

  handleTouchMoveZoom(event: PointerEvent) {
    const position = this.getSecondPointerPosition(event);

    const dx = event.pageX - position.x;
    const dy = event.pageY - position.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    this.zoomEnd.set(0, distance);

    this.zoomDelta.set(
      0,
      (this.zoomEnd.y / this.zoomStart.y) ** this.zoomSpeed
    );

    this.zoomOut(this.zoomDelta.y);

    this.zoomStart.copy(this.zoomEnd);
  }

  handleTouchMoveZoomRotate(event: PointerEvent) {
    if (this.enableZoom) this.handleTouchMoveZoom(event);
    if (this.enableRotate) this.handleTouchMoveRotate(event);
  }

  // Event Controllers
  onPointerDown(event: PointerEvent) {
    if (!this.enabled) return;

    if (this.cameraState.pointers.length === 0) {
      this.domElement.setPointerCapture(event.pointerId);
    }

    this.addPointer(event);
    if (event.pointerType === 'touch') {
      this.onTouchStart(event);
    } else {
      this.onMouseDown(event);
    }
  }

  onPointerMove(event: PointerEvent) {
    this.lastCheck = Date.now();
    if (!this.enabled) return;
    if (!this.input.isMouseLocked && !this.cameraState.pointers.length) return;
    if (!this.cameraState.pointers.find(e => e.pointerId === event.pointerId)) {
      return;
    }

    if (event.pointerType === 'touch') {
      this.onTouchMove(event);
    } else {
      this.onMouseMove(event);
    }
  }

  onPointerUp(event: PointerEvent) {
    if (event.pointerType === 'touch') {
      this.onTouchEnd();
    } else {
      this.onMouseUp();
    }

    this.removePointer(event);

    if (
      this.cameraState.pointers.length === 0 &&
      event.pointerType === 'touch'
    ) {
      this.domElement.releasePointerCapture(event.pointerId);
    }
  }

  // Touch
  onTouchStart(event: PointerEvent) {
    this.trackPointer(event);

    switch (this.cameraState.pointers.length) {
      case 1:
        if (!this.enableRotate) return;

        this.handleTouchStartRotate();
        this.input.isMouseLooking = true;
        this.cameraState.operation = CameraControlOperation.TOUCH_ROTATE;
        break;

      case 2:
        if (!this.enableZoom && !this.enableRotate) return;

        this.handleTouchStartZoomRotate();
        this.input.isMouseLooking = true;
        this.cameraState.operation = CameraControlOperation.TOUCH_ZOOM_ROTATE;
        break;

      default:
        this.cameraState.operation = CameraControlOperation.NONE;
    }
  }

  onTouchMove(event: PointerEvent) {
    this.trackPointer(event);

    switch (this.cameraState.operation) {
      case CameraControlOperation.TOUCH_ROTATE:
        if (!this.enableRotate) return;

        this.handleTouchMoveRotate(event);
        break;

      case CameraControlOperation.TOUCH_ZOOM_ROTATE:
        if (!this.enableZoom && !this.enableRotate) return;

        this.handleTouchMoveZoomRotate(event);
        break;

      default:
        this.cameraState.operation = CameraControlOperation.NONE;
    }
  }

  onTouchEnd() {
    this.cameraState.operation = CameraControlOperation.NONE;
  }

  // Mouse
  onPointerLockChange() {
    // do initial check to see if mouse is locked
    this.input.isMouseLocked = document.pointerLockElement === this.domElement;
    if (!this.input.isMouseLocked) {
      // wait 100ms and then check again as sometimes document.pointerLockElement
      // is null after doing a document.requestPointerLock()
      setTimeout(() => {
        this.input.isMouseLocked =
          document.pointerLockElement === this.domElement;
        if (!this.input.isMouseLocked) {
          this.input.isMouseLooking = false;
          this.cameraState.operation = CameraControlOperation.NONE;
        }
      }, 100);
    }
  }

  onMouseDown(event: MouseEvent) {
    switch (event.button) {
      case 0:
        if (!this.enableRotate) return;

        this.handleMouseDownRotate(event);
        this.cameraState.operation = CameraControlOperation.ROTATE;
        break;
      case 1:
        this.cameraState.operation = CameraControlOperation.NONE;
        break;
      case 2:
        if (!this.enableRotate) return;
        this.input.isMouseLooking = true;
        this.rightClickTime = Date.now();
        this.handleMouseDownRotate(event);
        this.cameraState.operation = CameraControlOperation.ROTATE;
        break;
      default:
        this.cameraState.operation = CameraControlOperation.NONE;
    }
  }

  onMouseMove(event: MouseEvent) {
    if (!this.enabled) return;

    if (this.cameraState.operation === CameraControlOperation.ROTATE) {
      if (!this.enableRotate) return;
      this.handleMouseMoveRotate(event);
    }
  }

  onMouseUp() {
    this.domElement.style.cursor = 'initial';
    document.exitPointerLock();
    this.input.isMouseLooking = false;
  }

  onMouseWheel(event: WheelEvent) {
    if (
      !this.enabled ||
      !this.enableZoom ||
      (this.cameraState.operation !== CameraControlOperation.NONE &&
        this.cameraState.operation !== CameraControlOperation.ROTATE)
    ) {
      return;
    }
    this.handleMouseWheel(event);
  }

  // Pointer Utils
  getSecondPointerPosition(event: any) {
    const pointer =
      event.pointerId === this.cameraState.pointers[0].pointerId
        ? this.cameraState.pointers[1]
        : this.cameraState.pointers[0];

    return this.cameraState.pointerPositions[pointer.pointerId];
  }

  addPointer(event: any) {
    this.cameraState.pointers.push(event);
  }

  removePointer(event: any) {
    delete this.cameraState.pointerPositions[event.pointerId];

    for (let i = 0; i < this.cameraState.pointers.length; i++) {
      if (this.cameraState.pointers[i].pointerId === event.pointerId) {
        this.cameraState.pointers.splice(i, 1);
        return;
      }
    }
  }

  trackPointer(event: any) {
    let position = this.cameraState.pointerPositions[event.pointerId];

    if (position === undefined) {
      position = new THREE.Vector2();
      this.cameraState.pointerPositions[event.pointerId] = position;
    }

    position.set(event.pageX, event.pageY);
  }

  onPointerCancel(event: any) {
    this.removePointer(event);
  }

  onContextMenu(event: any) {
    if (!this.enabled) return;
    event.preventDefault();
  }

  reset() {
    this.cameraState.reset();
    this.domElement.style.cursor = 'initial';
    try {
      document.exitPointerLock();
    } catch (e) {
      // lol
    }
  }

  dispose() {
    // remove event listeners here
  }
}

export default function useThirdPersonCameraControls({
  camera,
  domElement,
  target,
  inputManager,
  cameraOptions,
  cameraContainer
}: {
  camera: PerspectiveCamera;
  domElement: HTMLCanvasElement;
  target: Object3D;
  inputManager: InputEventManager;
  cameraOptions: any;
  cameraContainer: MutableRefObject<Object3D>;
}) {
  const [controls, setControls] = useState<ThirdPersonCameraControls>();

  useEffect(() => {
    if (!target) {
      return;
    }
    const newControls = new ThirdPersonCameraControls(
      camera,
      domElement,
      target,
      inputManager,
      { yOffset: cameraOptions.yOffset || 0 },
      cameraContainer.current
    );

    newControls.minDistance = cameraOptions?.minDistance || 404;
    newControls.maxDistance = cameraOptions?.maxDistance || 808;
    setControls(newControls);
    return () => {
      newControls.dispose();
    };
  }, [camera, domElement, target]);

  return controls;
}
