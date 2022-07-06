export enum ActionName {
  TOGGLE_MOVE_MODE = 'toggleMoveMode',
  START_MOVING = 'startMoving',
  ENABLE_MOVING_INPUTS = 'enableMovingInputs',
  DISABLE_MOVING_INPUTS = 'disableMovingInputs',
  UPDATE_ANIMATION = 'updateAnimation',
  START_INTERACTION = 'startInteraction',
  LOCK = 'lock',
  UNLOCK = 'unlock',
  LEFT_GROUND = 'leftGround',
  GROUNDED = 'grounded',

  /**
   * Setup character rigid body
   */
  ATTACH_RIGID_BODY = 'AttachRigidBody',

  /**
   * Update direction where the character is facing
   */
  LOOK_AT = 'lookAt',

  /**
   * Update velocity of the character
   */
  UPDATE_VELOCITY = 'updateVelocity',

  /**
   * Perform actual jump (Apply initial velocity)
   */
  JUMP = 'jump'
}
