import type { Intersection } from '@react-three/fiber';
import type { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events';
import { difference } from 'lodash';
import type { Object3D } from 'three';
import type { EventDescriptor } from '../types/manifest';
import type { EventHandlerStore } from './event-handler-store';
import { useEventHandlerStore } from './event-handler-store';

export function composeEventHandlers(
  events: EventDescriptor[],
  handlerStore: EventHandlerStore = useEventHandlerStore
): Partial<EventHandlers> {
  /**
   * Event handlers indexed by event name and node name of sub mesh.
   */
  const handlers: Record<
    'enter' | 'leave' | 'click',
    Record<string, Omit<EventDescriptor, 'node' | 'event'>>
  > = {
    enter: {},
    leave: {},
    click: {}
  };
  /**
   * Nodes that have been handled with enter event.
   */
  // let currentActive: string[] = [];
  let objectActive: Record<string, Object3D> = {};

  const notify = (
    eventType: 'enter' | 'leave' | 'click',
    handlerName: string,
    target: Object3D,
    intersection?: Intersection
  ) => {
    const handlerFn = handlerStore.getState().handlers[handlerName];

    if (handlerFn) {
      handlerFn({
        type: eventType,
        target,
        intersection
      });
    } else {
      console.warn(`Event handler ${handlerName} not found in handler store.`);
    }
  };

  const handlerProps: Partial<EventHandlers> = {
    onPointerOver: event => {
      const nextObjectActive: Record<string, Object3D> = {};

      event.intersections.forEach(i => {
        const nodeName = i.object.name;
        const desc = handlers.enter[nodeName];

        if (desc) {
          // Exceeds max distance
          if (desc.maxDistance && i.distance > desc.maxDistance) {
            return false;
          }

          // Transition to enter
          if (!objectActive[nodeName]) {
            // Nodes matching: Out => Enter
            notify('enter', desc.handler, i.object, i);
          }

          nextObjectActive[nodeName] = i.object;
          return true;
        }

        return false;
      });

      objectActive = nextObjectActive;
    },
    onPointerMove(event) {
      const nextObjectActive: Record<string, Object3D> = {};
      const currentActive = Object.keys(objectActive);

      const nextEntering = event.intersections
        .filter(i => {
          const nodeName = i.object.name;
          const desc = handlers.enter[nodeName];

          if (desc) {
            // Exceeds max distance
            if (desc.maxDistance && i.distance > desc.maxDistance) {
              return false;
            }

            nextObjectActive[nodeName] = i.object;
            // New transition to enter from out
            // Nodes matching: Out => Enter
            if (!currentActive.includes(nodeName)) {
              notify('enter', desc.handler, i.object, i);
            }

            return true;
          }

          return false;
        })
        .map(i => i.object.name);

      // Nodes matching: Enter => Out
      const invalidated = difference(currentActive, nextEntering);
      invalidated.forEach(nodeName => {
        notify(
          'leave',
          handlers.leave[nodeName].handler,
          objectActive[nodeName]
        );
      });

      objectActive = nextObjectActive;
    },
    onPointerLeave(event) {
      const nextObjectActive: Record<string, Object3D> = {};
      const intersections = event.intersections.map(i => i.object.name);

      for (const nodeName in objectActive) {
        if (intersections.includes(nodeName)) {
          // Still intersecting
          // Happens when clicking
          nextObjectActive[nodeName] = objectActive[nodeName];
        } else {
          notify(
            'leave',
            handlers.leave[nodeName].handler,
            objectActive[nodeName]
          );
        }
      }

      objectActive = nextObjectActive;
    },
    onClick(event) {
      // Make sure click event only fire once per click.
      event.stopPropagation();

      const match = event.intersections.find(i => {
        const nodeName = i.object.name;
        const desc = handlers.click[nodeName];
        if (desc) {
          if (desc.maxDistance && i.distance > desc.maxDistance) {
            return false;
          }

          notify('click', desc.handler, i.object, i);
        }

        return false;
      });
    }
  };

  // Index event handlers by event name and node name of sub mesh.
  events.forEach(({ event: eventName, handler, node, ...restProps }) => {
    if (handlers[eventName]) {
      handlers[eventName]![node] = {
        handler,
        ...restProps
      };
    } else {
      handlers[eventName] = {
        [node]: {
          handler,
          ...restProps
        }
      };
    }
  });

  return handlerProps;
}
