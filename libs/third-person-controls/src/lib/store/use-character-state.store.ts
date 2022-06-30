import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface CharacterStateStoreProps {
  canJump: boolean;
  setCanJump: (canJump: boolean) => void;
}

export const useCharacterStateStore = create<CharacterStateStoreProps>()(
  subscribeWithSelector(
    (set, get) =>
      ({
        canJump: false,
        setCanJump(canJump: boolean) {
          set({
            canJump
          });
        }
      } as CharacterStateStoreProps)
  )
);
