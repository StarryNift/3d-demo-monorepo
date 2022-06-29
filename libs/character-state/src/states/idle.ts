import { assign, StateNodeConfig } from 'xstate';
import { CharacterStateEventType } from '../constant/event.enum';
import { CharacterAnimation, CharacterStateContext } from '../types/context';
import { TransitionEvent } from '../types/event';
import { GuardName } from '../types/guard';
import { BasicState, StateName } from '../types/state';

/**
 * 人物静止状态
 */
export const idleState: StateNodeConfig<
  CharacterStateContext,
  BasicState,
  TransitionEvent
> = {
  entry: assign({
    animation: CharacterAnimation.IDLE
  }),
  on: {
    [CharacterStateEventType.MOVE]: {
      target: StateName.MOVING
    },
    [CharacterStateEventType.JUMP]: {
      cond: GuardName.CAN_JUMP,
      target: StateName.JUMPING
    },
    [CharacterStateEventType.INTERRUPTIBLE_INTERACTION]: {
      target: StateName.INTERRUPTIBLE_INTERACTION
    },
    [CharacterStateEventType.UNINTERRUPTIBLE_INTERACTION]: {
      target: StateName.UNINTERRUPTIBLE_INTERACTION
    },
    [CharacterStateEventType.FLOAT]: {
      target: StateName.FLOATING
    }
  },
  meta: {
    animation: 'idle'
  }
};
