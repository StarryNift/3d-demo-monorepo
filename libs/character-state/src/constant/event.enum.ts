export enum CharacterStateEventType {
  MOVE = 'MOVE',
  ROTATE = 'ROTATE',
  CANCEL = 'CANCEL',
  JUMP = 'JUMP',
  FALL = 'FALL',
  JUMPED = 'JUMPED',
  LANDED = 'LANDED',
  INTERACTION = 'INTERACTION',
  INTERACTION_DONE = 'INTERACTION_DONE',
  FLOAT = 'FLOAT',
  TOGGLE_MOVE = 'TOGGLE_MOVE',

  /**
   * 不可中断的交互
   * 如：打开宝箱
   */
  UNINTERRUPTIBLE_INTERACTION = 'UNINTERRUPTIBLE_INTERACTION',
  /**
   * 可中断的交互
   * 如：跳舞
   */
  INTERRUPTIBLE_INTERACTION = 'INTERRUPTIBLE_INTERACTION',

  /**
   * Update direction where the character is facing
   */
  FACE = 'LookAt',

  /**
   * Update velocity of the character
   */
  UPDATE_VELOCITY = 'UPDATE_VELOCITY'
}
