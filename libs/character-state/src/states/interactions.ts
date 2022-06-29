import { StateNodeConfig } from 'xstate';
import { CharacterStateEventType } from '../constant/event.enum';
import { ActionName } from '../types/action';
import { CharacterStateContext } from '../types/context';
import { TransitionEvent } from '../types/event';
import { GuardName } from '../types/guard';
import { StateName } from '../types/state';
import { InteractionSubState } from '../types/sub-state/interaction';

/**
 * 人物交互中状态 (可中断)
 */
export const interruptibleInteractionState: StateNodeConfig<
  CharacterStateContext,
  InteractionSubState,
  TransitionEvent
> = {
  entry: [ActionName.DISABLE_MOVING_INPUTS, ActionName.START_INTERACTION],
  exit: ActionName.ENABLE_MOVING_INPUTS,
  on: {
    [CharacterStateEventType.CANCEL]: {
      target: StateName.IDLE,
      cond: GuardName.IS_NOT_LOCKED
    },
    [CharacterStateEventType.MOVE]: {
      target: StateName.MOVING
    },
    [CharacterStateEventType.JUMP]: {
      target: StateName.JUMPING,
      cond: GuardName.CAN_JUMP
    },
    [CharacterStateEventType.FLOAT]: {
      target: StateName.FLOATING,
      cond: GuardName.IS_NOT_LOCKED
    },
    [CharacterStateEventType.INTERRUPTIBLE_INTERACTION]: {
      target: StateName.INTERRUPTIBLE_INTERACTION,
      actions: ActionName.START_INTERACTION
    },
    [CharacterStateEventType.UNINTERRUPTIBLE_INTERACTION]: {
      target: StateName.UNINTERRUPTIBLE_INTERACTION,
      actions: ActionName.START_INTERACTION
    }
  }
};

/**
 * 人物交互中状态 (不可中断)
 */
export const uninterruptedInteractionState: StateNodeConfig<
  CharacterStateContext,
  InteractionSubState,
  TransitionEvent
> = {
  entry: [
    ActionName.DISABLE_MOVING_INPUTS,
    ActionName.START_INTERACTION,
    ActionName.LOCK
  ],
  exit: [ActionName.ENABLE_MOVING_INPUTS, ActionName.UNLOCK],
  on: {
    [CharacterStateEventType.INTERACTION_DONE]: {
      target: StateName.IDLE
    }
  }
};
