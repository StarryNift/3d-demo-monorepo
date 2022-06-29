import { CharacterStateContext } from '../context';

export enum InteractionSubStateName {
  START_ACTION = 'StartAction',
  WAVING = 'Waving',
  DANCE_1 = 'Dance1',
  DANCE_2 = 'Dance2',
  INTERACTING_OBJECT = 'InteractingObject'
}

export interface BaseInteractionSubState<
  StateType extends InteractionSubStateName = InteractionSubStateName
> {
  value: StateType;
  context: CharacterStateContext;
}

export interface StartActionState
  extends BaseInteractionSubState<InteractionSubStateName.START_ACTION> {}

export interface UnlockedInteractionSubState extends BaseInteractionSubState {
  value:
    | InteractionSubStateName.WAVING
    | InteractionSubStateName.DANCE_1
    | InteractionSubStateName.DANCE_2;
  context: CharacterStateContext & {
    locked: false;
  };
}

export interface LockedInteractionSubState extends BaseInteractionSubState {
  value: InteractionSubStateName.INTERACTING_OBJECT;
  context: CharacterStateContext & {
    locked: true;
  };
}

export type InteractionSubState =
  | StartActionState
  | UnlockedInteractionSubState
  | LockedInteractionSubState;
