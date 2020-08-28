import { easeInOut, Timing } from "./timings";

export interface StepFunction {
  (x: number): void;
}

export const walk = (step: StepFunction, duration: number = 200, timing: Timing = easeInOut) => {
  return new Promise<void>((resolve) => {    
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
