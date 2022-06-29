import { Vector3 } from 'three';

export interface CharacterStateInputStore {
  getCharacterLookAtDeltaRadian: () => number;
  /**
   * Return normalized direction vector (length = 1) of the character.
   */
  getCharacterMovementDirection: () => Vector3;

  // subscribeInput: (input: string, callback: () => void) => () => void;

  /**
   * Return base linear speed of the character.
   */
  getBaseVelocity: () => number;

  // Enable `store.subscribe(callback)` to subscribe to changes.
  computed: {
    /**
     * Return true if the character is moving or rotating.
     */
    get isMoving(): boolean;
    /**
     * Return true if the character is rotating.
     */
    get isRotating(): boolean;
  };
}
