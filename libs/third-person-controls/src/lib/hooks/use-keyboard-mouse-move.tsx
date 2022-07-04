import { useEffect } from 'react';
import shallow from 'zustand/shallow';
import {
  DefaultKeyPressWatching,
  DefaultKeyTriggers,
  DEFAULT_KEY_MAPPINGS,
  DEFAULT_KEY_TRIGGERS,
  useKeyboardMouseMoveStore
} from '../store/keyboard-mouse-input.store';
import { reverseKeyMapping } from '../utility/reverse-key-mapping';
import { InputEventManager } from './use-input-event-manager';
/**
 * Keyboard event input => input event manager => camera & character
 * @param inputManager
 * @param userKeyMapPressing Key mapping for keys currently pressing
 * @returns
 */
export default function useKeyboardInput<T extends string>(
  inputManager: InputEventManager,
  userKeyMapPressing: Partial<Record<T, string | string[]>> = {},
  userKeyMapTriggers: Partial<Record<T, string[]>> = {}
): Partial<Record<DefaultKeyPressWatching | T | 'isMouseLooking', boolean>> {
  /**
   * Key mapping for keys currently pressing
   */
  const keyPressingMap = reverseKeyMapping<T & DefaultKeyPressWatching, string>(
    {
      ...DEFAULT_KEY_MAPPINGS,
      ...userKeyMapPressing
    }
  );

  /**
   * Keys to watch in keyup event
   */
  const keyUpTriggersMap = reverseKeyMapping<T & DefaultKeyTriggers, string>(
    {
      ...DEFAULT_KEY_TRIGGERS,
      ...userKeyMapTriggers
    },
    key => (key.endsWith('Up') ? key.slice(0, -2) : undefined)
  );

  /**
   * Keys to watch in keydown event
   */
  const keyDownTriggersMap = reverseKeyMapping<T & DefaultKeyTriggers, string>(
    {
      ...DEFAULT_KEY_TRIGGERS,
      ...userKeyMapTriggers
    },
    key => (key.endsWith('Down') ? key.slice(0, -4) : undefined)
  );

  const {
    inputsPressing,
    isMouseLooking,
    setPressed,
    setReleased,
    setIsMouseLooking,
    setActionTriggered
  } = useKeyboardMouseMoveStore(
    state => ({
      inputsPressing: state.inputsPressing,
      isMouseLooking: state.isMouseLooking,
      setPressed: state.setPressed,
      setReleased: state.setReleased,
      setIsMouseLooking: state.setIsMouseLooking,
      setActionTriggered: state.setActionTriggered
    }),
    shallow
  );

  /**
   * Mark key as pressed after 'keydown' event
   */
  function downHandler({ code }: KeyboardEvent) {
    const input = keyPressingMap[code];
    if (input) {
      setPressed(input);
    }

    const triggered = keyDownTriggersMap[code];
    if (triggered) {
      console.log('keydown', code);
      setActionTriggered(triggered);
    }
  }

  /**
   * Reset key as released after 'keyup' event
   */
  const upHandler = ({ code }: KeyboardEvent) => {
    const input = keyPressingMap[code];
    if (input) {
      setReleased(input);
    }

    const triggered = keyUpTriggersMap[code];
    if (triggered) {
      console.log('keyup', code);
      setActionTriggered(triggered);
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

  return { ...inputsPressing, isMouseLooking } as any;
}
