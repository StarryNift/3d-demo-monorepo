import {
  ActionName,
  CharacterStateEventType,
  CharacterStateMachine,
  characterStateMachine
} from '@3d/character-state';
import { useRaycastClosest } from '@react-three/cannon';
import { useFrame, useThree } from '@react-three/fiber';
import { EventEmitter } from 'fbemitter';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import {
  Euler,
  Matrix4,
  Object3D,
  PerspectiveCamera,
  Quaternion,
  Vector3
} from 'three';
import { interpret, InterpreterFrom } from 'xstate';
import { KeyboardMouseControl } from './components/keyboard-mouse-control';
import { CharacterReactStateContext } from './context/state-context';
import useCapsuleCollider from './hooks/use-capsule-collider';
import useInputEventManager from './hooks/use-input-event-manager';
import useKeyboardInput from './hooks/use-keyboard-input';
import useRay from './hooks/use-ray';
import useThirdPersonCameraControls from './hooks/use-third-person-camera-controls';
import { CharacterStateInputStore } from './store/character-state-input.store';
import { keyboardMouseMoveStore } from './store/keyboard-mouse-input.store';
import { useCharacterStateStore } from './store/use-character-state.store';
import { useInterpret } from '@xstate/react';
import { useCharacterKineticStore } from './store/kinetic-state.store';
import shallow from 'zustand/shallow';
import { HeightDetector } from './components/height-detector';

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

  // const eventBus = useRef(new EventEmitter());

  /**
   * Finite state machine for character state.
   * Should be the final place where to read the state of character from
   */
  const characterFSM = useInterpret(
    characterStateMachine.withConfig({
      actions: {
        [ActionName.JUMP]: (context, event) => {
          console.log('wants to jump', event);
          // collider.velocity.set(velocity.x, 8, velocity.z);
          // velocity.y = 8;
        }
      }
    })
  );

  const stateInputStore: { getState(): CharacterStateInputStore } =
    keyboardMouseMoveStore;

  const camera: PerspectiveCamera = useThree(
    state => state.camera
  ) as PerspectiveCamera;
  const renderer = useThree(state => state.gl);
  const canvas = renderer.domElement;
  // const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
  const collider = useCapsuleCollider(modelRef, characterFSM);
  const rayVector = useRef(new Vector3());
  // const ray = useRay({
  //   position,
  //   rayVector,
  //   cameraOptions: {
  //     yOffset: 1.6,
  //     minDistance: 2.6,
  //     maxDistance: 9,
  //     collisionFilterMask: 2
  //   }
  // });
  // useRaycastClosest(
  //   {
  //     from: [0, 0, 0],
  //     to: [0, -1, 0],
  //     skipBackfaces: true,
  //     collisionFilterMask: 2
  //   },
  //   e => {
  //     console.log(e);
  //   }
  // );

  const inputManager = useInputEventManager();
  const cameraContainer = useRef<Object3D>(new Object3D());

  const controls = useThirdPersonCameraControls({
    camera,
    domElement: canvas,
    target: modelRef,
    inputManager,
    cameraOptions: {
      yOffset: 1.6,
      minDistance: 2.6,
      maxDistance: 9,
      collisionFilterMask: 2
    },
    cameraContainer
  });

  // const inputs = useKeyboardInput(inputManager, eventBus.current, {
  //   // Custom key mappings
  //   interact: ['KeyF']
  // });
  // const { animation, isMoving, inAir } = useCharacterState(
  //   inputs,
  //   position,
  //   collider,
  //   null
  // );

  // subscribe to collider velocity/position changes
  // const velocity = useRef([0, 0, 0]);

  // useEffect(() => {
  //   const sub = characterFSM.subscribe(state => {
  //     console.log('state', state);
  //   });

  //   return () => sub.unsubscribe();
  // }, []);

  useEffect(() => {
    // collider.velocity.subscribe(v => {
    //   velocity.current = v;
    //   // console.log('collider velocity', v);
    // });

    // collider.position.subscribe(p => {
    // position is set on collider so we copy it to model
    // modelRef.current?.position.lerp(new Vector3(p[0], p[1], p[2]), 0.1);
    // modelRef.current?.position.set(p[0], p[1], p[2]);
    // setState with position to  useCharacterState
    // setPosition(p);
    // });

    if (props.initialPosition) {
      collider.position.set(...props.initialPosition);
    }
  }, []);

  const { velocity, position } = useCharacterKineticStore(
    state => ({
      velocity: state.velocity,
      position: state.position
    }),
    shallow
  );

  useFrame(() => {
    let newRotation = new Euler();
    let xVelocity = 0;
    let zVelocity = 0;

    if (!modelRef.current || !characterFSM.state?.context) {
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

    if (
      // Already transitioned to jump state
      characterFSM.state.context.jumping &&
      // But not yet left the ground
      characterFSM.state.context.grounded
    ) {
      collider.velocity.set(xVelocity, 8, zVelocity);
      characterFSM.send({ type: CharacterStateEventType.JUMPED });
    } else {
      if (
        !characterFSM.state.context.jumping &&
        characterFSM.state.context.grounded
      ) {
        // Stop bouncing if we're on the ground
        collider.velocity.set(xVelocity, 0, zVelocity);
      } else {
        // Cancel out inertia if we stop moving
        // collider.velocity.set(xVelocity, velocity.y, zVelocity);
      }
    }

    // if (
    //   inputs.jump &&
    //   useCharacterStateStore.getState().canJump &&
    //   velocity.current[1] > 0
    // ) {
    //   collider.velocity.set(xVelocity, 0, zVelocity);
    // } else {
    // }

    // after applying x/z velocity, apply y velocity if user has jumped while grounded
    const isGrounded = Math.abs(velocity.y) <= 0.01;
    // if (inputs.jump && useCharacterStateStore.getState().canJump) {
    //   // collider.wakeUp();
    //   console.log('start jump');

    //   collider.velocity.set(velocity.current[0], 8, velocity.current[2]);
    //   useCharacterStateStore.getState().setCanJump(false);
    // }

    // rotate character model inside model group
    // const newQuat = new Quaternion().setFromEuler(newRotation);
    // props.modelRef.current.quaternion.slerp(newQuat, 0.1);

    // quaternion is set on model group so we copy it to collider
    collider.quaternion.copy(quaternion);
    // check camera raycast collision and pass that to controls to
    cameraContainer.current.getWorldPosition(rayVector.current);
    // controls?.update(ray);
    controls?.update(null);

    // console.log('y position', velocity.y);
  });

  // console.log('inputs', modelRef.current.position);

  return (
    <CharacterReactStateContext.Provider
      value={{
        fsm: characterFSM
      }}
    >
      {props.children}
      {/* Put components will always re-render here */}
      <KeyboardMouseControl fsm={characterFSM} />
      {/* <HeightDetector fsm={characterFSM} /> */}
    </CharacterReactStateContext.Provider>
  );
}

export default ThirdPersonControls;
