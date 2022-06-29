import { assign, StateNodeConfig } from 'xstate';
import { CharacterStateEventType } from '../constant/event.enum';
import { ActionName } from '../types/action';
import { CharacterAnimation, CharacterStateContext } from '../types/context';
import { TransitionEvent } from '../types/event';
import { BasicState, StateName } from '../types/state';

/**
 * 人物跳跃状态
 */
export const jumpingState: StateNodeConfig<
  CharacterStateContext,
  BasicState,
  TransitionEvent
> = {
  entry: ActionName.LEFT_GROUND
};

/**
 * 人物下落状态
 */
export const fallingState: StateNodeConfig<
  CharacterStateContext,
  BasicState,
  TransitionEvent
> = {
  entry: assign<CharacterStateContext>({
    animation: CharacterAnimation.FALLING,
    grounded: false
  }),
  exit: ActionName.GROUNDED,
  on: {
    [CharacterStateEventType.LANDED]: {
      target: StateName.IDLE
    }
  }
};
