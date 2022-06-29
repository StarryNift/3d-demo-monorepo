import { CharacterStateEventType } from '../constant/event.enum';
import { CharacterAnimation } from './context';
import { InteractionSubStateName } from './sub-state/interaction';

export interface MoveEvent {
  type: CharacterStateEventType.MOVE;
  direction: [number, number, number];
}

export interface CancelEvent {
  type: CharacterStateEventType.CANCEL;
}

export interface JumpEvent {
  type: CharacterStateEventType.JUMP;
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

export type TransitionEvent =
  | MoveEvent
  | CancelEvent
  | JumpEvent
  | FallEvent
  | LandedEvent
  | InteractionEvent
  | InteractionDoneEvent
  | FloatEvent
  | ToggleMoveEvent;
