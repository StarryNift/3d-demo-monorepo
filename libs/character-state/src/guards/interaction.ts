import { CharacterStateContext } from '../types/context';

export function isLocked(context: CharacterStateContext): boolean {
  return context.locked;
}
export function isNotLocked(context: CharacterStateContext): boolean {
  return !context.locked;
}
