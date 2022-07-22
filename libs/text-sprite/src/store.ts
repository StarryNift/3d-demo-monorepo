import { ImageUtils } from 'three';
import create from 'zustand';

export interface DrawTextOptions {
  text: string;
  /**
   * Font size in pixels.
   */
  fontSize?: number;
  /**
   * Font family. (default: system-ui, -apple-system, Arial, sans-serif)
   */
  fontFamily?: string;
  /**
   * Text alignment. (default: center)
   */
  textAlign?: 'left' | 'center' | 'right';
  /**
   * Text baseline. (default: middle)
   */
  textBaseline?: 'top' | 'middle' | 'bottom';
  /**
   * Italic font style. (default: false)
   */
  italic?: boolean;
  /**
   * Bold font style. (default: false)
   */
  bold?: boolean;
  /**
   * Text color. (default: black)
   */
  fontColor?: string;
  /**
   * Background color. (default: transparent)
   */
  bgColor?: string;
  /**
   * Color of the border. (default: same as background color)
   */
  borderColor?: string;
  /**
   * Border-radius of background in pixels. (default: 0)
   */
  borderRadius?: number;
}

function drawRoundedBx(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

export interface TextSpriteStore {
  /**
   * Off-screen canvas used to draw text.
   */
  canvas?: HTMLCanvasElement;

  getCanvas(): HTMLCanvasElement;
  drawText(options: DrawTextOptions): [string, number, number];
}

export const createTextSpriteStore = () =>
  create<TextSpriteStore>((set, get) => ({
    getCanvas() {
      let canvas: HTMLCanvasElement | undefined = get().canvas;

      if (!canvas) {
        canvas = document.createElement('canvas');
        set({
          canvas
        });
      }

      return canvas;
    },
    drawText({
      text,
      fontSize = 32,
      fontFamily = 'system-ui, -apple-system, Arial, sans-serif',
      italic = false,
      bold = true,
      textAlign = 'center',
      textBaseline = 'middle',
      fontColor = 'black',
      bgColor = 'transparent',
      borderColor = bgColor,
      borderRadius = 0
    }: DrawTextOptions) {
      // Attempt to reuse the canvas if it already exists.
      const canvas = get().getCanvas();

      const context = canvas.getContext('2d')!;

      const lines = text.split('\n');

      const font = (context.font = `${bold ? 'bold ' : ''}${
        italic ? 'italic' : ''
      } ${fontSize}px ${fontFamily}`);

      // Canvas's width should be equal to the width of the longest line
      let maxLineWidth = 0;
      for (const line of lines) {
        const measurement = context.measureText(line);
        maxLineWidth = Math.max(maxLineWidth, measurement.width);
      }
      const lineHeight = fontSize * 1.4;

      // Rect of the canvas
      const blockWidth = maxLineWidth;
      const blockHeight = lineHeight * lines.length;

      // canvas.style.position = "absolute";
      // canvas.style.top = "calc(50% - 20px)";
      // canvas.style.width = width + 'px';
      // canvas.style.height = height + 'px';
      canvas.width = blockWidth * devicePixelRatio;
      canvas.height = blockHeight * devicePixelRatio;

      context.scale(devicePixelRatio, devicePixelRatio);

      // Draw background
      context.fillStyle = bgColor;
      // context.fillRect(0, 0, blockWidth, blockHeight);
      context.strokeStyle = borderColor;
      drawRoundedBx(context, 0, 0, blockWidth, blockHeight, borderRadius);

      // Draw text
      context.fillStyle = fontColor;
      context.textAlign = textAlign;
      context.textBaseline = textBaseline;

      context.font = font;

      const borderThickness = 0;
      const fillTextX = {
        left: borderThickness,
        start: borderThickness,
        center: blockWidth / 2 + borderThickness,
        right: blockWidth + borderThickness,
        end: blockWidth + borderThickness
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        context.fillText(line, fillTextX[textAlign], (i + 0.5) * lineHeight);
      }

      // Base on how three.js handle canvas texture
      // Canvas => image => dataUrl => texture
      // [Texture.js](https://github.com/mrdoob/three.js/blob/eadd35e44c/src/textures/Texture.js#L352)
      const dataUrl = ImageUtils.getDataURL(canvas);

      return [dataUrl, blockWidth, blockHeight];
    }
  }));

export const useTextSpriteStore = createTextSpriteStore();
