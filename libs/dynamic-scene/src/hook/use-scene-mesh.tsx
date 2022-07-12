import type { Mesh } from 'three';
import create from 'zustand';

export type GroupedMeshes = Record<string, Mesh>;

export interface SceneMeshStoreProps {
  scene: Record<string, GroupedMeshes>;
  colliders: Mesh[];
  addModel: (name: string, model: GroupedMeshes) => void;
  getMesh: (name: string, meshName: string) => Mesh | undefined;
  addCollider: (collider: Mesh) => void;
  getAllColliders: () => Mesh[];
  clear: () => void;
}

export const createSceneMeshStore = () =>
  create<SceneMeshStoreProps>((set, get) => ({
    scene: {},
    colliders: [],
    addModel(name, model) {
      set(prev => ({
        scene: {
          ...prev.scene,
          [name]: model
        }
      }));
    },
    addCollider(collider) {
      set(prev => ({
        colliders: [...prev.colliders, collider]
      }));
    },
    getAllColliders() {
      return get().colliders;
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
        scene: {},
        colliders: []
      });
    }
  }));

export const useSceneMesh = createSceneMeshStore();
