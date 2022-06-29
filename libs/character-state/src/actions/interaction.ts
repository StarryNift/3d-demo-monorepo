import { assign } from 'xstate';
import { CharacterStateEventType } from '../constant/event.enum';
import { CharacterAnimation, CharacterStateContext } from '../types/context';
import { TransitionEvent } from '../types/event';

export const startInteraction = assign<CharacterStateContext, TransitionEvent>({
  animation: (_, event) =>
    event.type === CharacterStateEventType.INTERRUPTIBLE_INTERACTION ||
    event.type === CharacterStateEventType.UNINTERRUPTIBLE_INTERACTION
      ? event.animation ?? 'unknown'
      : CharacterAnimation.IDLE
});

export const lock = assign<CharacterStateContext, TransitionEvent>({
  locked: true
});

export const unlock = assign<CharacterStateContext, TransitionEvent>({
  locked: false
});
