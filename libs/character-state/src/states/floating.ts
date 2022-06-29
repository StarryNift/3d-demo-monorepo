import { StateNodeConfig } from 'xstate';
import { CharacterStateEventType } from '../constant/event.enum';
import { ActionName } from '../types/action';
import { CharacterStateContext } from '../types/context';
import { TransitionEvent } from '../types/event';
import { BasicState, StateName } from '../types/state';

/**
 * 人物漂浮状态
 */
export const floatingState: StateNodeConfig<
  CharacterStateContext,
  BasicState,
  TransitionEvent
> = {
  entry: [ActionName.ENABLE_MOVING_INPUTS, ActionName.LEFT_GROUND],
  exit: ActionName.DISABLE_MOVING_INPUTS,
  on: {
    [CharacterStateEventType.CANCEL]: {
      target: StateName.FALLING
    },
    [CharacterStateEventType.FALL]: {
      // Forbidden transition
      // https://xstate.js.org/docs/guides/transitions.html#forbidden-transitions
      // Used to prevent transition to falling state
      actions: []
    }
  }
};
