import { Vector3 } from 'three';
import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import createStore from 'zustand/vanilla';

export interface CharacterKineticState {
  /**
   * Current velocity of the rigid body representing character.
   * Accept input from `useCapsuleCollider` hook.
   */
  velocity: Vector3;
  /**
   * Current position of the rigid body representing character.
   * Accept input from `useCapsuleCollider` hook.
   */
  position: Vector3;
  positionRaw: [number, number, number];

  quaternion: [number, number, number, number];

  setPosition: (position: [number, number, number]) => void;
  setQuaternion(quaternion: [number, number, number, number]): void;
}

export const characterKineticStore = createStore<CharacterKineticState>()(
  subscribeWithSelector((set, get) => ({
    velocity: new Vector3(0, 0, 0),
    position: new Vector3(0, 0, 0),
    positionRaw: [0, 0, 0],
    quaternion: [0, 0, 0, 0],

    setPosition(position) {
      set(prev => ({
        position: prev.position.set(...position),
        positionRaw: position
      }));
    },
    setQuaternion(quaternion: [number, number, number, number]) {
      set({
        quaternion
      });
    }
  }))
);

export const useCharacterKineticStore = create(characterKineticStore);
