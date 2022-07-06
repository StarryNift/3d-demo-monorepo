import { useEffect, useState } from 'react';

export type EventTypes = KeyboardEvent | WheelEvent | PointerEvent | MouseEvent;

export interface InputEventManager {
  subscribe: <T extends EventTypes>(
    eventName: string,
    key: string,
    handler: (event: T) => void
  ) => void;
  unsubscribe: (eventName: string, key: string) => void;
}

export default function useInputEventManager(
  container = window
): InputEventManager {
  const [subscriptions, setSubscriptions] = useState<
    Record<string, Record<string, (event: EventTypes) => void>>
  >({});

  const subscribe = (
    eventName: string,
    key: string,
    subscribeFn: (event: EventTypes) => void
  ) => {
    setSubscriptions(prevState => ({
      ...prevState,
      [eventName]: {
        ...prevState[eventName],
        [key]: subscribeFn
      }
    }));
  };

  const unsubscribe = (eventName: string, key: string) => {
    setSubscriptions(prevState => {
      delete prevState?.[eventName]?.[key];
      return prevState;
    });
  };

  const makeEventHandler = (eventName: string) => (event: any) => {
    const handlers = subscriptions[eventName] ?? {};
    const subscribers = Object.values(handlers);
    subscribers.forEach(sub => sub(event));
  };

  const keydownHandler = makeEventHandler('keydown');
  const keyupHandler = makeEventHandler('keyup');
  const wheelHandler = makeEventHandler('wheel');
  const pointerdownHandler = makeEventHandler('pointerdown');
  const pointerupHandler = makeEventHandler('pointerup');
  const pointermoveHandler = makeEventHandler('pointermove');
  const pointercancelHandler = makeEventHandler('pointercancel');
  const pointerlockchangeHandler = makeEventHandler('pointerlockchange');
  const pointerlockerrorHandler = makeEventHandler('pointerlockerror');
  const contextmenuHandler = makeEventHandler('contextmenu');

  const setupEventListeners = () => {
    window.addEventListener('keydown', keydownHandler, { passive: true });
    window.addEventListener('keyup', keyupHandler, { passive: true });

    container.addEventListener('wheel', wheelHandler, { passive: true });
    container.addEventListener('pointerdown', pointerdownHandler, {
      passive: true
    });
    container.addEventListener('pointerup', pointerupHandler, {
      passive: true
    });
    container.addEventListener('pointermove', pointermoveHandler, {
      passive: true
    });
    container.addEventListener('pointercancel', pointercancelHandler, {
      passive: true
    });
    container.addEventListener('contextmenu', contextmenuHandler, {
      passive: true
    });

    document.addEventListener('pointerlockchange', pointerlockchangeHandler, {
      passive: true
    });
    document.addEventListener('pointerlockerror', pointerlockerrorHandler, {
      passive: true
    });

    return () => {
      window.removeEventListener('keydown', keydownHandler);
      window.removeEventListener('keyup', keyupHandler);

      container.removeEventListener('wheel', wheelHandler);
      container.removeEventListener('pointerdown', pointerdownHandler);
      container.removeEventListener('pointerup', pointerupHandler);
      container.removeEventListener('pointermove', pointermoveHandler);
      container.removeEventListener('pointercancel', pointercancelHandler);
      container.removeEventListener('contextmenu', contextmenuHandler);

      document.removeEventListener(
        'pointerlockchange',
        pointerlockchangeHandler
      );
      document.removeEventListener('pointerlockerror', pointerlockerrorHandler);
    };
  };

  useEffect(setupEventListeners, [subscriptions, container]);

  return {
    subscribe,
    unsubscribe
  } as InputEventManager;
}
