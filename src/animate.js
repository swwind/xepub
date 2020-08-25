
export const timings = {
  'ease-in-out': (x) => {
    return (x * x) / (2 * x * x - 2 * x + 1);
  },
  'linear': (x) => x
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
  