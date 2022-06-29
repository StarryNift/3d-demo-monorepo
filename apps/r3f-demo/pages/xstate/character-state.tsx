import { characterStateMachine } from '@3d/character-state';
import { inspect } from '@xstate/inspect';
import { useInterpret } from '@xstate/react';
import { CharacterStateEventType } from 'libs/character-state/src/constant/event.enum';
import { InteractionSubStateName } from 'libs/character-state/src/types/sub-state/interaction';
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
    console.log(service.state);
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
