import { assign, StateNodeConfig, StatesConfig } from 'xstate';
import { CharacterStateEventType } from '../constant/event.enum';
import { ActionName } from '../types/action';
import { CharacterAnimation, CharacterStateContext } from '../types/context';
import { TransitionEvent } from '../types/event';
import { GuardName } from '../types/guard';
import { MovingState, StateName } from '../types/state';
import {
  CharacterMovingStateContext,
  CharacterMovingStateName,
  CharacterMovingSubState
} from '../types/sub-state/moving';

export const movingSubStates: StatesConfig<
  CharacterMovingStateContext,
  CharacterMovingSubState,
  TransitionEvent
> = {
  [CharacterMovingStateName.START_MOVING]: {
    always: [
      {
        cond: GuardName.IS_WALKING,
        target: CharacterMovingStateName.WALKING
      },
      {
        cond: GuardName.IS_RUNNING,
        target: CharacterMovingStateName.RUNNING
      }
    ]
  },
  [CharacterMovingStateName.WALKING]: {
    // type: 'parallel',
    id: CharacterMovingStateName.WALKING,
    entry: assign({
      animation: CharacterAnimation.WALKING
    }),
    meta: {
      baseSpeed: 1
    }
  },
  [CharacterMovingStateName.RUNNING]: {
    // type: 'parallel',
    id: CharacterMovingStateName.RUNNING,
    entry: assign({
      animation: CharacterAnimation.RUNNING
    }),
    meta: {
      baseSpeed: 2
    }
  }
};

/**
 * 人物行进中状态
 */
export const movingState: StateNodeConfig<
  CharacterStateContext,
  MovingState,
  TransitionEvent
> = {
  initial: CharacterMovingStateName.START_MOVING,
  states: movingSubStates,
  entry: ActionName.ENABLE_MOVING_INPUTS,
  exit: ActionName.DISABLE_MOVING_INPUTS,
  on: {
    [CharacterStateEventType.CANCEL]: {
      target: StateName.IDLE
    },
    [CharacterStateEventType.JUMP]: {
      target: StateName.JUMPING,
      cond: GuardName.CAN_JUMP
    },
    [CharacterStateEventType.INTERRUPTIBLE_INTERACTION]: {
      target: StateName.INTERRUPTIBLE_INTERACTION
    },
    [CharacterStateEventType.UNINTERRUPTIBLE_INTERACTION]: {
      target: StateName.UNINTERRUPTIBLE_INTERACTION
    },
    [CharacterStateEventType.FLOAT]: {
      target: StateName.FLOATING
    },
    [CharacterStateEventType.TOGGLE_MOVE]: [
      {
        cond: GuardName.IS_WALKING,
        target: `#${CharacterMovingStateName.RUNNING}`,
        actions: ActionName.TOGGLE_MOVE_MODE
      },
      {
        cond: GuardName.IS_RUNNING,
        target: `#${CharacterMovingStateName.WALKING}`,
        actions: ActionName.TOGGLE_MOVE_MODE
      }
    ]
  }
};
