import type { Intersection } from '@react-three/fiber';
import type { Object3D } from 'three';
import create from 'zustand';

export interface ProxyEvent {
  type: 'click' | 'enter' | 'leave';
  target: Object3D;
  intersection?: Intersection;
}

export type ProxyEventHandlers = Record<string, (event: ProxyEvent) => void>;

export interface EventHandlerStoreProps {
  handlers: ProxyEventHandlers;
  setHandlers: (handlers: ProxyEventHandlers) => void;
  clear: () => void;
}

export const createEventHandlerStore = () =>
  create<EventHandlerStoreProps>((set, get) => ({
    handlers: {},
    setHandlers(handlers) {
      set(state => ({
        handlers: {
          ...state.handlers,
          ...handlers
        }
      }));
    },
    clear() {
      set(state => ({
        handlers: {}
      }));
    }
  }));

/**
 * Default global event handler store
 */
export const useEventHandlerStore = createEventHandlerStore();

export type EventHandlerStore = typeof useEventHandlerStore;
