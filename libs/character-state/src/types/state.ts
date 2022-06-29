import type { CharacterStateContext } from './context';
import { InteractionSubState } from './sub-state/interaction';
import { CharacterMovingSubState } from './sub-state/moving';

export enum StateName {
  IDLE = 'Idle',
  MOVING = 'Moving',
  WALKING = 'Walking',
  RUNNING = 'Running',
  JUMPING = 'Jumping',
  FALLING = 'Falling',
  EMOTION = 'Emotion',
  UNINTERRUPTIBLE_INTERACTION = 'UninterruptibleInteraction',
  INTERRUPTIBLE_INTERACTION = 'InterruptibleInteraction',
  FLOATING = 'Floating'
}

export interface BaseStateMeta {}

export interface BaseState<NameType extends StateName = StateName> {
  value: NameType;
  context: CharacterStateContext;
  meta: BaseStateMeta;
}

export interface MovingState extends BaseState {
  value: StateName.MOVING;
  states: Record<string, CharacterMovingSubState>;
}

export interface BasicState extends BaseState {
  value:
    | StateName.IDLE
    | StateName.WALKING
    | StateName.RUNNING
    | StateName.JUMPING
    | StateName.FALLING
    | StateName.EMOTION
    | StateName.UNINTERRUPTIBLE_INTERACTION
    | StateName.INTERRUPTIBLE_INTERACTION;
}

export type CharacterState = BasicState | MovingState;
