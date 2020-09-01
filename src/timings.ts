
const cubicRoot = (x: number): number => {
  return x < 0 ? - Math.pow(- x, 1 / 3) : Math.pow(x, 1 / 3);
}

/**
 * Resolve equation ax^3+bx^2+cx+d=0
 */
const resolveCubicEquation = (a: number, b: number, c: number, d: number): number => {
  const A = b / a, B = c / a, C = d / a;
  const p = B - A * A / 3;
  const q = 2 * A * A * A / 27 - A * B / 3 + C;
  const delta = Math.sqrt(q * q / 4 + p * p * p / 27);
  return cubicRoot(- q / 2 + delta) + cubicRoot(- q / 2 - delta) - A / 3;
}

export type Timing = (x: number) => number;

export const linear: Timing = (x) => x;
export const easeInOut: Timing = (x) => {
  return (x * x) / (2 * x * x - 2 * x + 1);
}

export const cubicBezier = (a: number, b: number, c: number, d: number): Timing => {
  return (x) => {
    const t = resolveCubicEquation(3 * a - 3 * c + 1, - 6 * a + 3 * c, 3 * a, - x);
    return (3 * b - 3 * d + 1) * t * t * t + (- 6 * b + 3 * d) * t * t + 3 * b * t;
  }
}
