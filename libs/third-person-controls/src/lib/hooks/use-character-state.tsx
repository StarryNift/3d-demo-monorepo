import { PublicApi, Triplet, useRaycastClosest } from '@react-three/cannon';
import { useState, useEffect } from 'react';
import { DefaultKeyboardInputsSupported } from '../store/keyboard-mouse-input.store';

const getAnimationFromUserInputs = (
  inputs: Partial<
    Record<DefaultKeyboardInputsSupported | 'isMouseLooking', boolean>
  >
) => {
  const { up, down, right, left, isMouseLooking } = inputs;

  if (up && !down) {
    return 'run';
  }

  if (down && !up) {
    return 'backpedal';
  }

  if (!right && left) {
    return isMouseLooking ? 'strafeLeft' : 'turnLeft';
  }

  if (!left && right) {
    return isMouseLooking ? 'strafeRight' : 'turnRight';
  }

  return 'idle';
};

export default function useCharacterState(
  inputs: Partial<
    Record<DefaultKeyboardInputsSupported | 'isMouseLooking', boolean>
  >,
  position: [number, number, number],
  collider: PublicApi,
  mixer: any
) {
  const [characterState, setCharacterState] = useState({
    animation: 'idle',
    isJumping: false,
    inAir: false,
    isMoving: false,
    isLanding: false
  });

  const [jumpPressed, setJumpPressed] = useState(false);
  const [landed, setLanded] = useState(false);

  const { up, down, right, left, jump, isMouseLooking } = inputs;
  const { isJumping, inAir, isLanding } = characterState;

  useEffect(() => {
    setJumpPressed(jump ?? false);
    setLanded(false);
  }, [jump]);

  const rayFrom: Triplet = [position[0], position[1], position[2]];
  const rayTo: Triplet = [position[0], position[1] - 0.2, position[2]];
  useRaycastClosest(
    {
      from: rayFrom,
      to: rayTo,
      skipBackfaces: true
    },
    e => {
      if (e.hasHit && inAir) {
        console.log('landed');
        setLanded(true);
      }
    },
    [position]
  );

  useEffect(() => {
    if (inAir && landed) {
      setCharacterState(prevState => ({
        ...prevState,
        inAir: false,
        animation: 'landing',
        isLanding: true
      }));
    }
  }, [landed, inAir]);

  useEffect(() => {
    setCharacterState(
      prevState =>
        ({
          ...prevState,
          isMoving: up || down || left || right
        } as any)
    );
  }, [up, down, left, right]);

  useEffect(() => {
    if (isJumping || inAir) {
      return;
    }
    const newState = {
      animation: getAnimationFromUserInputs(inputs),
      isJumping: false
    };

    if (jump && !jumpPressed) {
      newState.animation = 'jump';
      newState.isJumping = true;
    }

    // let landing animation playout if we're still landing
    if (isLanding && newState.animation === 'idle') {
      return;
    }

    setCharacterState(prevState => ({
      ...prevState,
      isLanding: false,
      ...newState
    }));
  }, [up, down, left, right, jump, isMouseLooking, isJumping, inAir]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const checker = () => {
      setCharacterState(prevState => ({
        ...prevState,
        isJumping: false,
        inAir: true,
        animation: 'inAir'
      }));
    };
    if (characterState.isJumping) {
      // play 200ms of jump animation then transition to inAir
      timer = setTimeout(checker, 200);
    }
    return () => {
      timer && clearTimeout(timer);
    };
  }, [characterState.isJumping]);

  useEffect(() => {
    if (!mixer) {
      return;
    }
    const onMixerFinish = () => {
      setCharacterState(prevState => ({
        ...prevState,
        isJumping: false,
        inAir: false,
        isLanding: false,
        animation: 'idle'
      }));
    };

    mixer.addEventListener('finished', onMixerFinish);

    return () => {
      mixer.removeEventListener('finished', onMixerFinish);
    };
  }, [mixer]);

  return characterState;
}
