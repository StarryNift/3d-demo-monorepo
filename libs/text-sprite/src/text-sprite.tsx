import type { SpriteProps } from '@react-three/fiber';
import { useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import { TextureLoader } from 'three';
import { DrawTextOptions, useTextSpriteStore } from './store';

export interface TextSpriteProps extends DrawTextOptions, SpriteProps {}

export function TextSprite({
  text,
  fontSize,
  fontFamily,
  italic,
  bold,
  textAlign,
  textBaseline,
  fontColor,
  bgColor,
  borderRadius,
  ...props
}: TextSpriteProps) {
  const drawText = useTextSpriteStore(state => state.drawText);
  const [texture, cWidth, cHeight] = useMemo(() => {
    const [dataUrl, width, height] = drawText({
      text,
      fontSize,
      fontFamily,
      italic,
      bold,
      textAlign,
      textBaseline,
      fontColor,
      bgColor,
      borderRadius
    });

    const texture = new TextureLoader().load(dataUrl);
    texture.needsUpdate = true;

    console.debug('sprite texture created for:', text);

    return [texture, width, height];
  }, [
    text,
    fontSize,
    fontFamily,
    italic,
    bold,
    textAlign,
    textBaseline,
    fontColor,
    bgColor,
    borderRadius
  ]);

  const viewport = useThree(state => state.viewport);
  const width = cWidth / viewport.factor;
  const height = cHeight / viewport.factor;
  console.log('viewport', viewport);

  return (
    <sprite scale={[width, height, 1]} position={[0, 0, 0]} {...props}>
      <spriteMaterial attach="material" map={texture}></spriteMaterial>
    </sprite>
  );
}
