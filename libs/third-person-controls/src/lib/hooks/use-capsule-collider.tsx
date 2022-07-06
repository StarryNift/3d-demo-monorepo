import {
  CharacterStateEventType,
  CharacterStateMachine
} from '@3d/character-state';
import { useCompoundBody } from '@react-three/cannon';
import { Quaternion, Vec3 } from 'cannon-es';
import { useEffect, useRef } from 'react';
import { Object3D, Vector3 } from 'three';
import { InterpreterFrom } from 'xstate';
import shallow from 'zustand/shallow';
import { useCharacterKineticStore } from '../store/kinetic-state.store';
import { useCharacterStateStore } from '../store/use-character-state.store';

const upAxis = new Vec3(0, 1, 0);

// shouldn't rerender if the character model is the same
export default function useCapsuleCollider(
  modelRef: React.MutableRefObject<Object3D>,
  /**
   * Finite state machine for character state.
   * Character's velocity should be updated here
   */
  fsm: InterpreterFrom<CharacterStateMachine>
) {
  const setCanJump = useCharacterStateStore(state => state.setCanJump);
  const colliding = useRef(new Set<Object3D>());
  const { velocity, setPosition } = useCharacterKineticStore(
    state => ({
      velocity: state.velocity,
      setPosition: state.setPosition
    }),
    shallow
  );

  /**
   * 接触点法线向量, 模长为1
   */
  const contactNormal = useRef(new Vec3());

  const freeFallDetector = () => {
    console.log('checking free fall');

    if (velocity.y < -0.0001 && colliding.current.size === 0) {
      fsm.send({ type: CharacterStateEventType.FALL });
    }
  };

  const freeFallChecker = useRef<NodeJS.Timer>();

  // const velocity = useRef(new Vector3());
  useEffect(() => {
    freeFallChecker.current = setInterval(freeFallDetector, 200);
    return () => clearInterval(freeFallChecker.current);
  }, []);

  useEffect(
    () =>
      collider.velocity.subscribe(v => {
        velocity.set(...v);
        // console.log('collider velocity', v[1]);

        // Enter falling
        // NOTE: There is a issue that velocity.y never reaches 0 with gravity
        // if (v[1] < -0.0001 && colliding.current.size === 0) {
        //   fsm.send({ type: CharacterStateEventType.FALL });
        // }
      }),
    []
  );

  useEffect(() => collider.position.subscribe(p => setPosition(p)), []);

  const [, collider] = useCompoundBody(
    () => {
      const radius = 0.3;
      return {
        mass: 1,
        fixedRotation: true,
        // linearDamping: 0.7,
        // angularDamping: 1,
        allowSleep: true,
        // https://github.com/pmndrs/use-cannon/issues/177
        sleepSpeedLimit: 0.05,
        material: {
          friction: 0.08,
          restitution: 0,
          // contactEquationRelaxation: 400,
          name: 'no-fric-zone'
        },
        shapes: [
          { type: 'Sphere', position: [0, 0.3, 0], args: [radius] },
          { type: 'Sphere', position: [0, 1.3, 0], args: [radius] },
          {
            type: 'Sphere',
            position: [0, 1.6 - radius * 2.667, 0],
            args: [radius]
          }
        ],
        onCollide(e) {
          const { contact, target } = e;

          // Contact body can not support character with standing
          // if (!e.body.userData['supporting']) {
          //   return;
          // }

          // 获取接触点相对于所接触物体（非人物刚体本身）的法线向量, 模长为1
          // 用于计算碰撞角度
          // 如果人物垂直落于地面，则此法线向量为(0, 1, 0)

          // contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
          // We do not yet know which one is which! Let's check.
          if (contact.bi.id == target.id) {
            // bi is the player body, flip the contact normal
            contactNormal.current.set(
              -contact.ni[0],
              -contact.ni[1],
              -contact.ni[2]
            );
          } else {
            // bi is something else. Keep the normal as it is
            contactNormal.current.set(
              contact.ni[0],
              contact.ni[1],
              contact.ni[2]
            );
          }

          // 计算法线向量与 y 轴正轴模长为 1 的向量 (0, 1, 0) 的点积
          // 由点积来推导所接触物体面与水平面的夹角:
          // cos(θ) = 点积 / |法线| * |(0, 1, 0)|

          // If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat in the up direction.
          const dotProduct = contactNormal.current.dot(upAxis);
          if (dotProduct > 0.5) {
            console.log('can jump', contactNormal.current, dotProduct);
            setCanJump(true);
            // collider.sleep();

            fsm.send({ type: CharacterStateEventType.LANDED });
          } else {
            console.log('cannot jump', contactNormal.current, dotProduct);
          }

          // Angle to positive y axis
          const angleToYAxisRad = Math.acos(dotProduct);
          const angleToYAxisDegree = (angleToYAxisRad * 180) / Math.PI;

          console.debug('angle to positive y axis: ', angleToYAxisDegree);

          const q = new Quaternion().setFromVectors(
            upAxis,
            contactNormal.current
          );
          console.log('q', q);
        },
        onCollideBegin(e) {
          colliding.current.add(e.body);
          console.log('collide begin', e, colliding.current);

          clearInterval(freeFallChecker.current);
          console.log('clear interval', freeFallChecker.current);
        },
        onCollideEnd(e) {
          colliding.current.delete(e.body);
          // const v = new Vector3();
          // collider.velocity.copy(v);
          console.log('collide end', e, colliding.current);

          if (colliding.current.size === 0) {
            clearInterval(freeFallChecker.current);
            freeFallChecker.current = setInterval(freeFallDetector, 200);
          }

          // if (velocity.y < 0) {
          //   console.log('falling start', e);
          // }

          // if (velocity.current.length() <= 0.05) {
          //   console.log('sleeping now');
          // }
        },
        position: [0, 0, 0],
        rotation: [0, Math.PI, 0],
        collisionFilterGroup: 1,
        collisionFilterMask: 3
      };
    },
    modelRef,
    []
  );

  return collider;
}
