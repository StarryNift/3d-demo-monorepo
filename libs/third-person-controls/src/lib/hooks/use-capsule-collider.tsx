import { useCompoundBody } from '@react-three/cannon';
import { Vec3 } from 'cannon-es';
import { useRef } from 'react';
import { Object3D } from 'three';
import { useCharacterStateStore } from '../store/use-character-state-store';

const upAxis = new Vec3(0, 1, 0);

// shouldn't rerender if the character model is the same
export default function useCapsuleCollider(
  modelRef: React.MutableRefObject<Object3D>
) {
  const setCanJump = useCharacterStateStore(state => state.setCanJump);
  /**
   * 接触点法线向量, 模长为1
   */
  const contactNormal = useRef(new Vec3());

  const [, collider] = useCompoundBody(
    () => {
      const radius = 0.3;
      return {
        mass: 1,
        fixedRotation: true,
        // linearDamping: 0.7,
        // angularDamping: 1,
        allowSleep: true,
        sleepSpeedLimit: 1,
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

          // console.log('collision', e);

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
          } else {
            console.log('cannot jump', contactNormal.current, dotProduct);
          }

          // Angle to positive y axis
          const angleToYAxisRad = Math.acos(dotProduct);
          const angleToYAxisDegree = (angleToYAxisRad * 180) / Math.PI;

          console.debug('angle to positive y axis: ', angleToYAxisDegree);
        },
        onCollideBegin(e) {
          console.log('collide begin', e);
        },
        onCollideEnd(e) {
          console.log('collide end', e);
          console.log(collider.velocity);
        },
        position: [0, 0, 0],
        rotation: [0, Math.PI, 0],
        collisionFilterGroup: 1
      };
    },
    modelRef,
    []
  );

  return collider;
}
