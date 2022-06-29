import { useEffect } from 'react';
import {
  DefaultKeyboardInputsSupported,
  DEFAULT_KEY_MAPPINGS,
  useKeyboardMouseMoveStore
} from '../store/keyboard-mouse-input.store';
import { InputEventManager } from './use-input-event-manager';

function getInputFromKeyboard<T extends string>(
  keyMap: Record<T, string | string[]>,
  keyPressed: string
): T | undefined {
  for (const key in keyMap) {
    const mappings = ([] as string[]).concat(keyMap[key]);
    if (mappings.includes(keyPressed)) {
      return key;
    }
  }
  return;
}

/**
 * Keyboard event input => input event manager => camera & character
 * @param inputManager
 * @param userKeyMap
 * @returns
 */
export default function useKeyboardInput<T extends string>(
  inputManager: InputEventManager,
  userKeyMap: Record<T, string | string[]> = {} as any
): Partial<
  Record<DefaultKeyboardInputsSupported | T | 'isMouseLooking', boolean>
> {
  const keyMap = {
    ...DEFAULT_KEY_MAPPINGS,
    ...userKeyMap
  };

  const {
    inputsPressed,
    isMouseLooking,
    setPressed,
    setReleased,
    setIsMouseLooking
  } = useKeyboardMouseMoveStore();

  /**
   * Mark key as pressed after 'keydown' event
   */
  function downHandler({ code }: KeyboardEvent) {
    const input = getInputFromKeyboard<T | DefaultKeyboardInputsSupported>(
      keyMap,
      code
    );
    if (input) {
      setPressed(input);
    }
  }

  /**
   * Reset key as released after 'keyup' event
   */
  const upHandler = ({ code }: KeyboardEvent) => {
    const input = getInputFromKeyboard<T | DefaultKeyboardInputsSupported>(
      keyMap,
      code
    );
    if (input) {
      setReleased(input);
    }
  };

  function pointerdownHandler({ button }: PointerEvent) {
    // Right click
    if (button === 2) {
      setIsMouseLooking(true);
    }
  }

  const pointerupHandler = ({ button }: PointerEvent) => {
    // Right click
    if (button === 2) {
      setIsMouseLooking(false);
    }
  };

  // Handle registration and dispose of event listeners
  useEffect(() => {
    inputManager.subscribe('keydown', 'character-controls', downHandler);
    inputManager.subscribe('keyup', 'character-controls', upHandler);
    inputManager.subscribe(
      'pointerdown',
      'character-controls',
      pointerdownHandler
    );
    inputManager.subscribe('pointerup', 'character-controls', pointerupHandler);

    console.debug('[KeyboardMouseMoveHook] Subscribed from keyboard input');

    return () => {
      inputManager.unsubscribe('keydown', 'character-controls');
      inputManager.unsubscribe('keyup', 'character-controls');
      inputManager.unsubscribe('pointerdown', 'character-controls');
      inputManager.unsubscribe('pointerup', 'character-controls');

      console.debug('[KeyboardMouseMoveHook] Unsubscribed from keyboard input');
    };
  }, []);

  return { ...inputsPressed, isMouseLooking } as any;
}
