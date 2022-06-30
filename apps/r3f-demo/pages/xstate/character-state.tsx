import {
  CharacterStateEventType,
  characterStateMachine
} from '@3d/character-state';
import { inspect } from '@xstate/inspect';
import { useInterpret } from '@xstate/react';
import { useLayoutEffect, useRef } from 'react';

// const srv = interpret(characterStateMachine, { devTools: true });

export default function CharacterStateMachine() {
  const service = useInterpret(characterStateMachine, { devTools: true }, e =>
    console.log('transition', e)
  );
  // const state = useSelector(service, state => state.value);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useLayoutEffect(() => {
    inspect({
      iframe: false,
      url: 'https://stately.ai/viz?inspect'
    });

    service.send({
      type: CharacterStateEventType.INTERRUPTIBLE_INTERACTION,
      animation: 'dance2'
    });
  }, []);

  console.log('render CharacterStateMachine');

  return (
    <div>
      <p>Inspect the state machine</p>
      {/* <p>Current state: {`${state}`}</p> */}
      <iframe ref={iframeRef} style={{ width: '100vw', height: '90vh' }} />
    </div>
  );
}
