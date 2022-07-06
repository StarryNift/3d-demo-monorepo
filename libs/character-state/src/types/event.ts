import { CharacterStateEventType } from '../constant/event.enum';
import { CharacterAnimation } from './context';
import type { PublicApi } from '@react-three/cannon';

export interface MoveEvent {
  type: CharacterStateEventType.MOVE;
  direction: [number, number, number];
}

export interface RotateEvent {
  type: CharacterStateEventType.ROTATE;
}

export interface CancelEvent {
  type: CharacterStateEventType.CANCEL;
}

export interface JumpEvent {
  type: CharacterStateEventType.JUMP;
}

export interface JumpedEvent {
  type: CharacterStateEventType.JUMPED;
}

export interface FallEvent {
  type: CharacterStateEventType.FALL;
}

export interface LandedEvent {
  type: CharacterStateEventType.LANDED;
}

export interface FloatEvent {
  type: CharacterStateEventType.FLOAT;
}

export interface ToggleMoveEvent {
  type: CharacterStateEventType.TOGGLE_MOVE;
}

export interface InteractionEvent {
  type:
    | CharacterStateEventType.INTERRUPTIBLE_INTERACTION
    | CharacterStateEventType.UNINTERRUPTIBLE_INTERACTION;
  animation: CharacterAnimation | string;
}

export interface InteractionDoneEvent {
  type: CharacterStateEventType.INTERACTION_DONE;
}

export interface FaceEvent {
  type: CharacterStateEventType.FACE;
  facing: [number, number, number];
}

export interface UpdateVelocityEvent {
  type: CharacterStateEventType.UPDATE_VELOCITY;
  velocity: [number, number, number];
}

export type TransitionEvent =
  | FaceEvent
  | UpdateVelocityEvent
  | MoveEvent
  | RotateEvent
  | CancelEvent
  | JumpEvent
  | JumpedEvent
  | FallEvent
  | LandedEvent
  | InteractionEvent
  | InteractionDoneEvent
  | FloatEvent
  | ToggleMoveEvent;
