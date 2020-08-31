import { walk } from "./animate";
import { $ } from "./utils";
import { linear } from "./timings";
import * as Key from './key-events';

class Transform {
  top: number;
  left: number;
  width: number;
  height: number;
  rotate: number;
  animating: boolean = false;

  constructor(width: number, height: number, top: number, left: number, rotate: number) {
    this.top = top;
    this.left = left;
    this.width = width;
    this.height = height;
    this.rotate = rotate;
  }

  applyTo(img: HTMLImageElement) {
    img.style.top = this.top + 'px';
    img.style.left = this.left + 'px';
    img.style.width = this.width + 'px';
    img.style.height = this.height + 'px';
    img.style.transform = `rotate(${-this.rotate}deg)`;
  }

  async animate(img: HTMLImageElement, dest: Transform, duration: number = 200) {
    if (this.animating) {
      return;
    }
    this.applyTo(img);

    if (duration) {
      this.animating = true;
      
      await walk((x) => {
        new Transform(
          (dest.width  - this.width)  * x + this.width,
          (dest.height - this.height) * x + this.height,
          (dest.top    - this.top)    * x + this.top,
          (dest.left   - this.left)   * x + this.left,
          (dest.rotate - this.rotate) * x + this.rotate
        ).applyTo(img);
      }, duration);

      this.animating = false;
    } else {
      dest.applyTo(img);
    }

    this.top = dest.top;
    this.left = dest.left;
    this.width = dest.width;
    this.height = dest.height;
    this.rotate = dest.rotate;
  }

  _fit(maxWidth: number, maxHeight: number) {
    const wh = maxWidth / maxHeight;
    const twh = this.width / this.height;
    
    if (twh > wh) {
      const nw = maxWidth - 50;
      const nh = nw / twh;
      return new Transform(nw, nh, (maxHeight - nh) / 2, 25, this.rotate);
    } else {
      const nh = maxHeight - 50;
      const nw = nh * twh;
      return new Transform(nw, nh, 25, (maxWidth - nw) / 2, this.rotate);
    }
  }

  fit(maxWidth: number, maxHeight: number) {
    if (this.rotate % 180 === 90) {
      const fits = this._fit(maxHeight, maxWidth);
      return new Transform(
        fits.width,
        fits.height,
        fits.left - (fits.height - fits.width) / 2,
        fits.top + (fits.height - fits.width) / 2,
        this.rotate,
      );
    } else {
      return this._fit(maxWidth, maxHeight);
    }
  }

  rotate90(maxWidth: number, maxHeight: number) {
    const org = new Transform(this.width, this.height, 0, 0, this.rotate + 90);
    return org.fit(maxWidth, maxHeight);
  }
}

const div = $('.imageview') as HTMLDivElement;
const nimg = $('#imageview-img') as HTMLImageElement;
const rotate = $('#rotate-btn') as HTMLDivElement;

const getPosition = (img: HTMLImageElement) => {
  const rect = img.getBoundingClientRect();
  return new Transform(img.clientWidth, img.clientHeight, rect.top, rect.left, 0);
}

const mountTo = (img: HTMLImageElement) => () => {
  Key.disable();
  nimg.src = img.src;

  const nowState = getPosition(img);
  nowState.applyTo(nimg);

  div.onclick = async () => {
    nowState.rotate = ((nowState.rotate + 180) % 360) - 180;
    await Promise.all([
      nowState.animate(nimg, getPosition(img)),
      walk((x) => div.style.backgroundColor = `rgba(0, 0, 0, ${(1 - x) * .9})`, 200, linear),
    ]);
    div.style.display = 'none';
    window.removeEventListener('resize', resize);
    Key.enable();
  };
  
  nimg.onload = () => {
    div.style.display = 'block';
    nowState.animate(nimg, nowState.fit(window.innerWidth, window.innerHeight));
    walk((x) => div.style.backgroundColor = `rgba(0, 0, 0, ${x * .9})`, 200, linear);
  }

  rotate.onclick = (e) => {
    e.stopPropagation();
    nowState.animate(nimg, nowState.rotate90(window.innerWidth, window.innerHeight));
  }

  const resize = () => {
    nowState.animate(nimg, nowState.fit(window.innerWidth, window.innerHeight), 0);
  }

  window.addEventListener('resize', resize);
}

export const mount = (img: HTMLImageElement) => {
  img.style.cursor = 'pointer';
  img.addEventListener('click', mountTo(img));
}

