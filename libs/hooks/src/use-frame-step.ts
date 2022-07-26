import { RenderCallback, useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export function useFrameStep(
  callback: RenderCallback,
  /**
   * How frequently to call the callback, in frames. (Expect a number greater than 1)
   * a value of 1 means to be called every frame, the same as `useFrame`.
   * @default 1
   */
  stepSize: number,
  renderPriority?: number
) {
  const stepCounter = useRef(0);

  if (stepSize < 1) {
    throw new Error('expect stepSize to be greater than 1');
  } else if (stepSize === 1) {
    console.warn('useFrameStep(): stepSize of 1 is the same as useFrame()');
  }

  useFrame((state, delta, frame) => {
    stepCounter.current += 1;

    if (stepCounter.current % stepSize === 0) {
      callback(state, delta, frame);

      stepCounter.current = 0;
    }
  }, renderPriority);
}
