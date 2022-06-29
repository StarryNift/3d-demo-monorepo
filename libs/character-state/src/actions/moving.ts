import { assign } from 'xstate';
import { CharacterStateContext } from '../types/context';
import { TransitionEvent } from '../types/event';
import { CharacterMoveMode } from '../types/move-mode';

export const enableMove = assign<CharacterStateContext, TransitionEvent>({
  allowMoving: true
});

export const disableMove = assign<CharacterStateContext, TransitionEvent>({
  allowMoving: false
});

export const toggleMoveMode = assign<CharacterStateContext, TransitionEvent>({
  moveMode: context =>
    context.moveMode === CharacterMoveMode.RUNNING
      ? CharacterMoveMode.WALKING
      : CharacterMoveMode.RUNNING
});
