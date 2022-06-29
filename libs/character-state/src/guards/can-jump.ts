import { CharacterStateContext } from '../types/context';

export const canJump = (context: CharacterStateContext) =>
  context.grounded && !context.locked;
