import { assign } from 'xstate';
import { CharacterStateContext } from '../types/context';
import { TransitionEvent } from '../types/event';

export const leftGround = assign<CharacterStateContext, TransitionEvent>({
  grounded: false
});

export const grounded = assign<CharacterStateContext, TransitionEvent>({
  grounded: true
});
