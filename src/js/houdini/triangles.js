/* ! Based on https://generativeartistry.com/tutorials/triangular-mesh/ by maxwellito */
/* global registerPaint */
registerPaint(
  'triangles',
  class {
    /**
     * @return {Array}
     */
    static get inputProperties() {
      return ['--paint-alpha', '--base-hue', '--size', '--max-saturation', '--max-lightness'];
    }

    /**
     *
     * @param {DrawingContext} ctx - 2D Drawing Context for the box
     * @param {object} size - Size of the box
     * @param {object} props - Input properties
     */
    paint(ctx, size, props) {
      const color = props.get('--base-hue');
      const maxS = props.get('--max-saturation');
      const maxL = props.get('--max-lightness');
      const gap = parseFloat(props.get('--size'));
      const alpha = props.get('--paint-alpha');

      ctx.globalAlpha = alpha;

      ctx.scale(1, 1);

      ctx.lineJoin = 'bevel';
      let line;
      let dot;
      let odd = false;
      const lines = [];

      for (let y = -gap; y <= size.height + 1.4 * gap; y += gap) {
        odd = !odd;
        line = [];
        for (let x = -gap; x <= size.width + 1.4 * gap; x += gap) {
          dot = { x: x + (odd ? gap / 2 : 0), y: y };
          line.push({
            x: x + (Math.random() * 0.8 - 0.4) * gap + (odd ? gap / 2 : 0),
            y: y + (Math.random() * 0.8 - 0.4) * gap,
          });
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, 1, 0, 2 * Math.PI, true);
        }
        lines.push(line);
      }

      let dotLine;
      odd = true;

      for (let y = 0; y < lines.length - 1; y++) {
        odd = !odd;
        dotLine = [];
        for (let i = 0; i < lines[y].length; i++) {
          dotLine.push(odd ? lines[y][i] : lines[y + 1][i]);
          dotLine.push(odd ? lines[y + 1][i] : lines[y][i]);
        }
        for (let i = 0; i < dotLine.length - 2; i++) {
          this.drawTriangle(ctx, dotLine[i], dotLine[i + 1], dotLine[i + 2], color, maxS, maxL);
        }
      }
    }

    /**
     *
     * @param {DrawingContext} ctx - 2D Drawing Context
     * @param {object} a - Point A
     * @param {object} b  - Point b
     * @param {object} c  - Point C
     * @param {number} h - Hue
     * @param {number} ms - Maximum Saturation
     * @param {number} ml - Maximum Lightness
     */
    drawTriangle(ctx, a, b, c, h, ms, ml) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(c.x, c.y);
      ctx.lineTo(a.x, a.y);
      ctx.closePath();
      const s = Math.random() * ms;
      const l = Math.random() * ml;
      ctx.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;
      ctx.fill();
      ctx.stroke();
    }
  },
);
