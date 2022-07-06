import type { PublicApi } from '@react-three/cannon';
import { CharacterMoveMode } from './move-mode';

export enum CharacterAnimation {
  IDLE = 'idle',
  WALKING = 'walking',
  ROTATING = 'rotating',
  RUNNING = 'running',
  JUMPING = 'jumping',
  FALLING = 'falling'
}

export interface CharacterStateContext {
  /**
   * 人物刚体 API (Cannon.js)
   */
  rigidBody?: PublicApi;
  /**
   * 人物速度
   */
  velocity: [number, number, number];
  /**
   * 人物位置 (预留)
   */
  position?: [number, number, number];
  /**
   * 人物朝向
   */
  facing: [number, number, number];
  /**
   * 人物是否已经着陆
   */
  grounded: boolean;
  /**
   * 人物当前正处于跳跃状态
   */
  jumping: boolean;
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
