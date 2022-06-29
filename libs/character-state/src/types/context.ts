import { CharacterMoveMode } from './move-mode';

export enum CharacterAnimation {
  IDLE = 'idle',
  WALKING = 'walking',
  RUNNING = 'running',
  JUMPING = 'jumping',
  FALLING = 'falling'
}

export interface CharacterStateContext {
  /**
   * 人物是否已经着陆
   */
  grounded: boolean;
  /**
   * 人物行走状态
   */
  moveMode: CharacterMoveMode;
  /**
   * 是否允许角色移动
   */
  allowMoving: boolean;
  /**
   * 是否允许旋转角色朝向
   */
  allowRotation: boolean;
  /**
   * 人物动画状态
   */
  animation: CharacterAnimation | string;
  /**
   * 交互动作是否触发状态锁定
   */
  locked: boolean;
}
