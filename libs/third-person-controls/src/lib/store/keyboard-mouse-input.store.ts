import { Vector3 } from 'three';
import createStore from 'zustand/vanilla';
import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { CharacterStateInputStore } from './character-state-input.store';

// KeyBoard Event Code Values:
// https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values
export const DEFAULT_KEY_MAPPINGS = {
  up: ['KeyW', 'ArrowUp'],
  down: ['KeyS', 'ArrowDown'],
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
  jump: 'Space'
} as const;

export type DefaultKeyPressWatching = keyof typeof DEFAULT_KEY_MAPPINGS;

export const DEFAULT_KEY_TRIGGERS = {
  jump: ['SpaceDown'],
  toggleMoveMode: ['ShiftLeftDown', 'ShiftRightDown'],
  interact: ['keyF']
} as const;

export type DefaultKeyTriggers = keyof typeof DEFAULT_KEY_TRIGGERS;

export interface KeyboardMouseInputStore<
  T extends DefaultKeyPressWatching = DefaultKeyPressWatching
> extends CharacterStateInputStore {
  inputsPressing: Partial<Record<T, boolean>>;
  /**
   * Character's model rotation will follow the camera's rotation.
   */
  isMouseLooking: boolean;
  /**
   * Angular speed in radians per frame the character rotating.
   */
  rotationSpeed: 0.05;

  /**
   * Latest action key trigger recorded.
   */
  actionTriggered?: string;

  /**
   * Record a key is pressed down
   */
  setPressed: (key: string) => void;

  /**
   * Record a key is released
   */
  setReleased: (key: string) => void;

  /**
   * Record an action key is triggered
   */
  setActionTriggered: (key: string) => void;

  setIsMouseLooking: (isMouseLooking: boolean) => void;
}

export const keyboardMouseMoveStore = createStore<KeyboardMouseInputStore>()(
  subscribeWithSelector(
    (set, get) =>
      ({
        inputsPressing: {},
        isMouseLooking: false,
        // Angular speed in radians per frame the character rotating.
        rotationSpeed: 0.05,

        setPressed(key) {
          set(state => ({
            inputsPressing: { ...state.inputsPressing, [key]: true }
          }));
        },

        setReleased(key) {
          set(state => ({
            inputsPressing: { ...state.inputsPressing, [key]: false }
          }));
        },

        setActionTriggered(key) {
          set({
            actionTriggered: key
          });
        },

        setIsMouseLooking(isMouseLooking: boolean) {
          set({
            isMouseLooking
          });
        },

        getCharacterLookAtDeltaRadian() {
          const { inputsPressing: inputsPressed, isMouseLooking } = get();
          const { left, right } = inputsPressed;

          if (isMouseLooking) {
            // Character rotation will follow the camera's rotation.
            return 0;
          }

          const speed = get().rotationSpeed;

          if (left) {
            return speed;
          }

          if (right) {
            return -speed;
          }

          return 0;
        },

        getCharacterMovementDirection() {
          const { inputsPressing: inputsPressed, isMouseLooking } = get();
          const { left, right, up, down } = inputsPressed;

          const positiveX = isMouseLooking && right ? -1 : 0;
          const negativeX = isMouseLooking && left ? 1 : 0;
          const positiveZ = up ? 1 : 0;
          const negativeZ = down ? -1 : 0;

          return new Vector3(
            positiveX + negativeX,
            0,
            positiveZ + negativeZ
          ).normalize();
        },

        getBaseVelocity() {
          const isForwarding = get().inputsPressing.up;
          const isBackpedaling = get().inputsPressing.down;

          if (isForwarding) {
            return 4;
          }

          if (isBackpedaling) {
            return 2;
          }

          return 0;
        },

        computed: {
          get isMoving(): boolean {
            // console.log('calc isMoving');

            const { inputsPressing: inputsPressed } = get();
            const { up, down, left, right } = inputsPressed;
            return (up || down || left || right) ?? false;
          },
          get isRotating(): boolean {
            const { inputsPressing: inputsPressed, isMouseLooking } = get();
            const { left, right } = inputsPressed;
            return (isMouseLooking || left || right) ?? false;
          }
        }
      } as KeyboardMouseInputStore)
  )
);

export const useKeyboardMouseMoveStore = create(keyboardMouseMoveStore);
