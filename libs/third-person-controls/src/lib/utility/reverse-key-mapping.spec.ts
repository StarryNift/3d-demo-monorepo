import { reverseKeyMapping } from './reverse-key-mapping';

describe('Testing reverse key mapping', () => {
  it('should reverse normal key mapping', () => {
    const input = {
      forward: ['w', 'ArrowUp'],
      backward: ['s', 'ArrowDown'],
      left: ['a', 'ArrowLeft'],
      right: ['d', 'ArrowRight'],
      wave: 'Digit1'
    };

    const reversedMap = reverseKeyMapping(input);

    expect(reversedMap).toEqual({
      w: 'forward',
      ArrowUp: 'forward',
      s: 'backward',
      ArrowDown: 'backward',
      a: 'left',
      ArrowLeft: 'left',
      d: 'right',
      ArrowRight: 'right',
      Digit1: 'wave'
    });
  });

  it('should reverse key mapping based on custom mapper of logic', () => {
    const input = {
      jump: ['SpaceDown'],
      toggleMoveMode: ['ShiftLeftUp'],
      open: 'fUp'
    };

    const keyUpMapping = reverseKeyMapping(input, input => {
      if (input.endsWith('Up')) {
        return input.slice(0, -2);
      }

      return false;
    });

    expect(keyUpMapping).toEqual({
      ShiftLeft: 'toggleMoveMode',
      f: 'open'
    });
  });

  it('should reverse key mapping based on custom mapper of logic', () => {
    const input = {
      jump: ['SpaceDown'],
      toggleMoveMode: ['ShiftLeftUp'],
      dance: 'Digit1Down'
    };

    const keyDownMapping = reverseKeyMapping(input, input => {
      if (input.endsWith('Down')) {
        return input.slice(0, -4);
      }

      return false;
    });

    expect(keyDownMapping).toEqual({
      Space: 'jump',
      Digit1: 'dance'
    });
  });
});
