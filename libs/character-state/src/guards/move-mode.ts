import { CharacterStateContext } from '../types/context';
import { CharacterMoveMode } from '../types/move-mode';

export function isWalking(context: CharacterStateContext): boolean {
  return context.moveMode === CharacterMoveMode.WALKING;
}

export function isRunning(context: CharacterStateContext): boolean {
  return context.moveMode === CharacterMoveMode.RUNNING;
}
