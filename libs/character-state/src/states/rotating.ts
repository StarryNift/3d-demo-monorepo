import { assign, StateNodeConfig } from 'xstate';
import { CharacterStateEventType } from '../constant/event.enum';
import { CharacterAnimation, CharacterStateContext } from '../types/context';
import { TransitionEvent } from '../types/event';
import { GuardName } from '../types/guard';
import { MovingState, StateName } from '../types/state';

/**
 * 人物转向中状态
 */
export const rotatingState: StateNodeConfig<
  CharacterStateContext,
  MovingState,
  TransitionEvent
> = {
  entry: assign({
    animation: CharacterAnimation.ROTATING
  }),
  on: {
    [CharacterStateEventType.CANCEL]: {
      target: StateName.IDLE
    },
    [CharacterStateEventType.MOVE]: {
      target: StateName.MOVING
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
    }
  }
};
