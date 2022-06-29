import { BaseStateMeta } from '../state';

export enum CharacterMovingStateName {
  START_MOVING = 'StartMoving',
  WALKING = 'Walking',
  RUNNING = 'Running'
}

export interface CharacterMovingStateContext {
  direction: [number, number, number];
}

export interface MovingStateMeta extends BaseStateMeta {
  baseSpeed: number;
}

export interface CharacterWalkingState {
  value: CharacterMovingStateName.WALKING;
  context: CharacterMovingStateContext;
  meta: MovingStateMeta;
}

export interface CharacterRunningState {
  value: CharacterMovingStateName.RUNNING;
  context: CharacterMovingStateContext;
  meta: MovingStateMeta;
}

export type CharacterMovingSubState =
  | CharacterWalkingState
  | CharacterRunningState;
