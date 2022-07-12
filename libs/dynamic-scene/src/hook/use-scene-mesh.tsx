import type { Mesh } from 'three';
import create from 'zustand';

export type GroupedMeshes = Record<string, Mesh>;

export interface SceneMeshStoreProps {
  scene: Record<string, GroupedMeshes>;
  addModel: (name: string, model: GroupedMeshes) => void;
  getMesh: (name: string, meshName: string) => Mesh | undefined;
  clear: () => void;
}

export const createSceneMeshStore = () =>
  create<SceneMeshStoreProps>((set, get) => ({
    scene: {},
    addModel(name, model) {
      set(prev => ({
        scene: {
          ...prev.scene,
          [name]: model
        }
      }));
    },
    getMesh(name, meshName) {
      const model: GroupedMeshes | undefined = get().scene[name];

      if (model) {
        return model[meshName];
      }

      console.warn(`Mesh ${meshName} not found in model ${name}`);
      return;
    },
    clear() {
      set({
        scene: {}
      });
    }
  }));

export const useSceneMesh = createSceneMeshStore();
