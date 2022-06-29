import { createMachine } from 'xstate';
import {
  disableMove,
  enableMove,
  grounded,
  leftGround,
  lock,
  startInteraction,
  toggleMoveMode,
  unlock
} from './actions/';
import { CharacterStateEventType } from './constant/event.enum';
import {
  canJump,
  isLocked,
  isNotLocked,
  isRunning,
  isWalking
} from './guards/';
import { floatingState } from './states/floating';
import { idleState } from './states/idle';
import {
  interruptibleInteractionState,
  uninterruptedInteractionState
} from './states/interactions';
import { fallingState, jumpingState } from './states/jumping';
import { movingState } from './states/moving';
import { ActionName } from './types/action';
import { CharacterAnimation, CharacterStateContext } from './types/context';
import { TransitionEvent } from './types/event';
import { GuardName } from './types/guard';
import { CharacterMoveMode } from './types/move-mode';
import { CharacterState, StateName } from './types/state';

export const characterStateMachine = createMachine<
  CharacterStateContext,
  TransitionEvent,
  CharacterState
>(
  {
    id: 'CharacterState',
    initial: StateName.IDLE,
    context: {
      grounded: true,
      moveMode: CharacterMoveMode.WALKING,
      allowMoving: false,
      allowRotation: false,
      animation: CharacterAnimation.IDLE,
      locked: false
    },
    schema: {
      context: {} as CharacterStateContext,
      events: {} as TransitionEvent
    },
    states: {
      [StateName.IDLE]: idleState,
      [StateName.MOVING]: movingState,
      [StateName.JUMPING]: jumpingState,
      [StateName.FALLING]: fallingState,
      [StateName.INTERRUPTIBLE_INTERACTION]: interruptibleInteractionState,
      [StateName.UNINTERRUPTIBLE_INTERACTION]: uninterruptedInteractionState,
      [StateName.FLOATING]: floatingState
    },
    on: {
      [CharacterStateEventType.FALL]: {
        target: StateName.FALLING
      },
      [CharacterStateEventType.TOGGLE_MOVE]: {
        actions: ActionName.TOGGLE_MOVE_MODE
      }
    }
  },
  {
    actions: {
      [ActionName.TOGGLE_MOVE_MODE]: toggleMoveMode,
      [ActionName.ENABLE_MOVING_INPUTS]: enableMove,
      [ActionName.DISABLE_MOVING_INPUTS]: disableMove,
      [ActionName.START_INTERACTION]: startInteraction,
      [ActionName.LOCK]: lock,
      [ActionName.UNLOCK]: unlock,
      [ActionName.GROUNDED]: grounded,
      [ActionName.LEFT_GROUND]: leftGround
    },
    guards: {
      [GuardName.CAN_JUMP]: canJump,
      [GuardName.IS_WALKING]: isWalking,
      [GuardName.IS_RUNNING]: isRunning,
      [GuardName.IS_LOCKED]: isLocked,
      [GuardName.IS_NOT_LOCKED]: isNotLocked
    }
  }
);
