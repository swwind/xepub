
const cubicRoot = (x) => {
  return x < 0 ? - Math.pow(- x, 1 / 3) : Math.pow(x, 1 / 3);
}

/**
 * Resolve equation ax^3+bx^2+cx+d=0
 */
const resolveCubicEquation = (a, b, c, d) => {
  const A = b / a, B = c / a, C = d / a;
  const p = B - A * A / 3;
  const q = 2 * A * A * A / 27 - A * B / 3 + C;
  const delta = Math.sqrt(q * q / 4 + p * p * p / 27);
  return cubicRoot(- q / 2 + delta) + cubicRoot(- q / 2 - delta) - A / 3;
}

export const timings = {
  'ease-in-out': (x) => {
    return (x * x) / (2 * x * x - 2 * x + 1);
  },
  'linear': (x) => x,
  'cubic-bezier': (a, b, c, d) => (x) => {
    const t = resolveCubicEquation(3 * a - 3 * c + 1, - 6 * a + 3 * c, 3 * a, - x);
    return (3 * b - 3 * d + 1) * t * t * t + (- 6 * b + 3 * d) * t * t + 3 * b * t;
  }
}

export const walk = (step, duration = 200, timing = timings['ease-in-out']) => {
  return new Promise((resolve) => {    
    const start = Date.now();
    const fn = () => {
      const now = Date.now();
      if (now - start >= duration) {
        step(1);
        resolve();
      } else {
        step(timing((now - start) / duration));
        requestAnimationFrame(fn);
      }
    }
    
    requestAnimationFrame(fn);
  });
}

export const animate = async (target, dest, duration = 200, timing = timings['ease-in-out']) => {
  const from = { };
  for (const key in dest) {
    if (typeof dest[key] === 'number') {
      from[key] = parseFloat(target.style[key]);
    }
  }
  await walk((x) => {
    for (const key in from) {
      const now = (dest[key] - from[key]) * x + from[key];
      target.style[key] = now + 'px';
    }
  }, duration, timing);
}
