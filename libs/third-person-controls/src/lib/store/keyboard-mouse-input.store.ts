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
  jump: 'Space',
  walk: ['ShiftLeft', 'ShiftRight']
} as const;

export type DefaultKeyboardInputsSupported = keyof typeof DEFAULT_KEY_MAPPINGS;

export interface KeyboardMouseInputStore<
  T extends DefaultKeyboardInputsSupported = DefaultKeyboardInputsSupported
> extends CharacterStateInputStore {
  inputsPressed: Partial<Record<T, boolean>>;
  /**
   * Character's model rotation will follow the camera's rotation.
   */
  isMouseLooking: boolean;
  /**
   * Angular speed in radians per frame the character rotating.
   */
  rotationSpeed: 0.05;

  setPressed: (key: string) => void;
  setReleased: (key: string) => void;
  setIsMouseLooking: (isMouseLooking: boolean) => void;
}

export const keyboardMouseMoveStore = createStore<KeyboardMouseInputStore>()(
  subscribeWithSelector(
    (set, get) =>
      ({
        inputsPressed: {},
        isMouseLooking: false,
        // Angular speed in radians per frame the character rotating.
        rotationSpeed: 0.05,

        setPressed(key) {
          set(state => ({
            ...state,
            inputsPressed: { ...state.inputsPressed, [key]: true }
          }));
        },

        setReleased(key) {
          set(state => ({
            ...state,
            inputsPressed: { ...state.inputsPressed, [key]: false }
          }));
        },

        setIsMouseLooking(isMouseLooking: boolean) {
          set({
            isMouseLooking
          });
        },

        getCharacterLookAtDeltaRadian() {
          const { inputsPressed, isMouseLooking } = get();
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
          const { inputsPressed, isMouseLooking } = get();
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
          const isForwarding = get().inputsPressed.up;
          const isBackpedaling = get().inputsPressed.down;

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

            const { inputsPressed } = get();
            const { up, down, left, right } = inputsPressed;
            return (up || down || left || right) ?? false;
          },
          get isRotating(): boolean {
            const { inputsPressed, isMouseLooking } = get();
            const { left, right } = inputsPressed;
            return (isMouseLooking || left || right) ?? false;
          }
        }
      } as KeyboardMouseInputStore)
  )
);

export const useKeyboardMouseMoveStore = create(keyboardMouseMoveStore);
