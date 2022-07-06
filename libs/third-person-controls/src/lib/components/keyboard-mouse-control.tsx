import {
  CharacterStateEventType,
  characterStateMachine,
  CharacterStateMachine
} from '@3d/character-state';
import { useEffect, useRef } from 'react';
import { interpret, InterpreterFrom } from 'xstate';
import { EventEmitter } from 'fbemitter';
import useInputEventManager from '../hooks/use-input-event-manager';
import useKeyboardInput from '../hooks/use-keyboard-input';
import {
  DefaultKeyTriggers,
  useKeyboardMouseMoveStore
} from '../store/keyboard-mouse-input.store';

export interface KeyboardMouseControlProps {
  /**
   * Finite state machine for character state.
   * Receives input from keyboard and mouse and updates the state of character
   */
  fsm: InterpreterFrom<CharacterStateMachine>;
}

/**
 * Processing keyboard and mouse event input and update the character state machine
 */
export function KeyboardMouseControl({ fsm }: KeyboardMouseControlProps) {
  const eventBus = useRef(new EventEmitter());

  // TODO: deprecate this
  const inputManager = useInputEventManager();

  /**
   * Hook to handle keyboard and mouse input
   */
  useKeyboardInput(inputManager, eventBus.current, {});

  useEffect(
    () =>
      useKeyboardMouseMoveStore.subscribe(
        state => state.computed.isMoving,
        isMoving => {
          if (isMoving) {
            // Start moving
            fsm.send({
              type: CharacterStateEventType.MOVE,
              direction: [0, 0, 0]
            });
          } else {
            // Stop moving
            fsm.send({
              type: CharacterStateEventType.CANCEL
            });
          }
        }
      ),
    []
  );

  useEffect(() => {
    const sub = eventBus.current.addListener(
      'actionTrigger',
      (action: DefaultKeyTriggers) => {
        switch (action) {
          case 'jump':
            fsm.send({
              type: CharacterStateEventType.JUMP
            });
            break;
          case 'toggleMoveMode':
            fsm.send({
              type: CharacterStateEventType.TOGGLE_MOVE
            });
        }
      }
    );

    return () => sub.remove();
  }, []);

  // useEffect(() =>
  //   useKeyboardMouseMoveStore.subscribe(
  //     state => state.actionTriggered,
  //     action => {
  //       console.log('action triggered', action);
  //     }
  //   )
  // );

  // useEffect(() => {
  //   const sub = fsm.subscribe(state => {
  //     console.log('transition', state?.value, state.context.animation);
  //   });
  //   return () => sub.unsubscribe();
  // });

  console.log('render KeyboardMouseControl');

  return null;
}
