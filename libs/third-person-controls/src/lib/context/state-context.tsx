import { CharacterStateMachine } from '@3d/character-state';
import { createContext } from 'react';
import { InterpreterFrom } from 'xstate';
import { EventEmitter } from 'fbemitter';

export interface CharacterReactStateContextProps {
  fsm?: InterpreterFrom<CharacterStateMachine>;
  eventBus?: EventEmitter;
}

export const CharacterReactStateContext =
  createContext<CharacterReactStateContextProps>({});
