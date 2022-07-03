import { useRaycastClosest } from '@react-three/cannon';
import { useFrame, useThree } from '@react-three/fiber';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { Euler, Matrix4, Object3D, PerspectiveCamera, Vector3 } from 'three';
import useCapsuleCollider from './hooks/use-capsule-collider';
import useInputEventManager from './hooks/use-input-event-manager';
import useKeyboardInput from './hooks/use-keyboard-mouse-move';
import useRay from './hooks/use-ray';
import useThirdPersonCameraControls from './hooks/use-third-person-camera-controls';
import { CharacterStateInputStore } from './store/character-state-input.store';
import { keyboardMouseMoveStore } from './store/keyboard-mouse-input.store';
import { useCharacterStateStore } from './store/use-character-state.store';

/* eslint-disable-next-line */
export interface ThirdPersonControlsProps {
  modelRef: React.MutableRefObject<Object3D>;
  initialPosition?: [number, number, number];
  initialQuaternion?: [number, number, number, number];
}

export function ThirdPersonControls(
  props: PropsWithChildren<ThirdPersonControlsProps>
) {
  const modelRef = props.modelRef;

  const stateInputStore: { getState(): CharacterStateInputStore } =
    keyboardMouseMoveStore;

  const camera: PerspectiveCamera = useThree(
    state => state.camera
  ) as PerspectiveCamera;
  const renderer = useThree(state => state.gl);
  const canvas = renderer.domElement;
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
  const collider = useCapsuleCollider(modelRef);
  const rayVector = useRef(new Vector3());
  const ray = useRay({
    position,
    rayVector,
    cameraOptions: {
      yOffset: 1.6,
      minDistance: 2.6,
      maxDistance: 9,
      collisionFilterMask: 2
    }
  });
  useRaycastClosest(
    {
      from: [0, 0, 0],
      to: [0, -1, 0],
      skipBackfaces: true,
      collisionFilterMask: 2
    },
    e => {
      console.log(e);
    }
  );

  const inputManager = useInputEventManager();
  const cameraContainer = useRef<Object3D>(new Object3D());

  const controls = useThirdPersonCameraControls({
    camera,
    domElement: canvas,
    target: modelRef.current!,
    inputManager,
    cameraOptions: {
      yOffset: 1.6,
      minDistance: 2.6,
      maxDistance: 9,
      collisionFilterMask: 2
    },
    cameraContainer
  });

  const inputs = useKeyboardInput(inputManager, {
    // Custom key mappings
    interact: ['KeyF']
  });
  // const { animation, isMoving, inAir } = useCharacterState(
  //   inputs,
  //   position,
  //   collider,
  //   null
  // );

  // subscribe to collider velocity/position changes
  const velocity = useRef([0, 0, 0]);
  useEffect(() => {
    collider.velocity.subscribe(v => {
      velocity.current = v;
      // console.log('collider velocity', v);
    });

    collider.position.subscribe(p => {
      // position is set on collider so we copy it to model
      modelRef.current?.position.lerp(new Vector3(p[0], p[1], p[2]), 0.1);
      // setState with position to  useCharacterState
      setPosition(p);
    });

    if (props.initialPosition) {
      collider.position.set(...props.initialPosition);
    }
  }, []);

  useFrame(() => {
    let newRotation = new Euler();
    let xVelocity = 0;
    let zVelocity = 0;

    if (!modelRef.current) {
      return;
    }

    const quaternion = modelRef.current.quaternion;

    const inputStates = stateInputStore.getState();

    if (inputStates.computed.isMoving) {
      // collider.wakeUp();
      // const { model } = useInputMovementRotation(inputs);
      // console.log('movement', movement, model, inputs);

      const rotationDeltaRadian = inputStates.getCharacterLookAtDeltaRadian();
      // first rotate the model group
      modelRef.current!.rotateY(rotationDeltaRadian);
      // newRotation = props.modelRef.current.rotation.clone();
      // newRotation.y = model.rotation;

      // then apply velocity to collider influenced by model groups rotation
      const baseVelocity = inputStates.getBaseVelocity();

      if (baseVelocity > 0) {
        const movement = inputStates.getCharacterMovementDirection();
        const mtx = new Matrix4().makeRotationFromQuaternion(quaternion);
        movement.applyMatrix4(mtx);

        xVelocity = movement.x * baseVelocity;
        zVelocity = movement.z * baseVelocity;
      }
    }

    collider.velocity.set(xVelocity, velocity.current[1], zVelocity);
    if (useCharacterStateStore.getState().canJump && velocity.current[1] > 0) {
      collider.velocity.set(xVelocity, 0, zVelocity);
    }

    // after applying x/z velocity, apply y velocity if user has jumped while grounded
    const isGrounded = Math.abs(velocity.current[1]) <= 0.01;
    if (inputs.jump && useCharacterStateStore.getState().canJump) {
      // collider.wakeUp();
      console.log('start jump');

      collider.velocity.set(velocity.current[0], 8, velocity.current[2]);
      useCharacterStateStore.getState().setCanJump(false);
    }

    // rotate character model inside model group
    // const newQuat = new Quaternion().setFromEuler(newRotation);
    // props.modelRef.current.quaternion.slerp(newQuat, 0.1);

    // quaternion is set on model group so we copy it to collider
    collider.quaternion.copy(quaternion);
    // check camera raycast collision and pass that to controls to
    cameraContainer.current.getWorldPosition(rayVector.current);
    controls?.update(ray);

    // console.log('y position', velocity.current);
  });

  // console.log('inputs', modelRef.current.position);

  return <>{props.children}</>;
}

export default ThirdPersonControls;
