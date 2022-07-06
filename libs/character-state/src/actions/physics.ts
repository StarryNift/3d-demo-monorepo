import { assign } from 'xstate';
import { CharacterStateEventType } from '../character-state-machine';
import { CharacterStateContext } from '../types/context';
import { TransitionEvent } from '../types/event';

export const updateVelocity = assign<CharacterStateContext, TransitionEvent>({
  velocity: (_, event) =>
    event.type === CharacterStateEventType.UPDATE_VELOCITY
      ? event.velocity
      : [0, 0, 0]
});

export const face = assign<CharacterStateContext, TransitionEvent>({
  facing: (_, event) =>
    event.type === CharacterStateEventType.FACE ? event.facing : [0, 0, 0]
});
