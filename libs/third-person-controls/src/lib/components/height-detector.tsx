import {
  CharacterStateEventType,
  CharacterStateMachine
} from '@3d/character-state';
import { useRaycastClosest } from '@react-three/cannon';
import { Line } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { InterpreterFrom } from 'xstate';
import shallow from 'zustand/shallow';
import { useCharacterKineticStore } from '../store/kinetic-state.store';

export function HeightDetector({
  fsm
}: {
  fsm: InterpreterFrom<CharacterStateMachine>;
}) {
  const velocity = useCharacterKineticStore(state => state.velocity);
  const positionRaw = useCharacterKineticStore(state => state.positionRaw);
  const rayCheckTimer = useRef<NodeJS.Timeout>();

  useRaycastClosest(
    {
      from: [positionRaw[0], positionRaw[1] + 1, positionRaw[2]],
      to: [positionRaw[0], positionRaw[1] - 0.2, positionRaw[2]],
      skipBackfaces: true,
      collisionFilterMask: 2
    } as any,
    e => {
      clearTimeout(rayCheckTimer.current);
      if (e.distance < 1.03) {
        console.log('hit, grounded', e.distance);
        // fsm.send({ type: CharacterStateEventType.LANDED });
      }

      rayCheckTimer.current = setTimeout(() => {
        console.log('ray miss, in air');

        // if (velocity.y < -1e-10) {
        //   fsm.send({ type: CharacterStateEventType.JUMPED });
        // }
      }, 100);
    },
    [positionRaw]
  );

  useEffect(() => clearTimeout(rayCheckTimer.current), []);

  return (
    <group>
      <Line
        points={[
          [positionRaw[0], positionRaw[1] + 1, positionRaw[2]],
          [positionRaw[0], positionRaw[1] - 0.2, positionRaw[2]]
        ]}
        color={'red'}
      ></Line>
    </group>
  );
}
