import { walk } from "./animate";
import { $ } from "./utils";
import { linear } from "./timings";

class Transform {
  top: number;
  left: number;
  width: number;
  height: number;
  rotate: number;
  animating: boolean;

  constructor(width: number, height: number, top: number, left: number, rotate: number) {
    this.top = top;
    this.left = left;
    this.width = width;
    this.height = height;
    this.rotate = rotate;

    this.animating = false;
  }

  applyTo(img: HTMLImageElement) {
    img.style.top = this.top + 'px';
    img.style.left = this.left + 'px';
    img.style.width = this.width + 'px';
    img.style.height = this.height + 'px';
    img.style.transform = `rotate(${-this.rotate}deg)`;
  }

  async animate(img: HTMLImageElement, dest: Transform) {
    if (this.animating) {
      return;
    }
    this.applyTo(img);
    this.animating = true;

    await walk((x) => {
      new Transform(
        (dest.width  - this.width)  * x + this.width,
        (dest.height - this.height) * x + this.height,
        (dest.top    - this.top)    * x + this.top,
        (dest.left   - this.left)   * x + this.left,
        (dest.rotate - this.rotate) * x + this.rotate
      ).applyTo(img);
    });

    this.top = dest.top;
    this.left = dest.left;
    this.width = dest.width;
    this.height = dest.height;
    this.rotate = dest.rotate;

    this.animating = false;
  }

  fit(maxWidth: number, maxHeight: number) {
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

  rotate90(maxWidth: number, maxHeight: number) {
    const org = new Transform(this.height, this.width, 0, 0, this.rotate + 90)
    const res = this.rotate % 180 > 0 ? org.fit(maxHeight, maxWidth) : org.fit(maxWidth, maxHeight);
    if (this.rotate % 180 === 0) {
      res.left -= (res.height - res.width) / 2;
      res.top  += (res.height - res.width) / 2;
    } else {
      const tmp = res.left;
      res.left = res.top;
      res.top = tmp;
    }
    
    const tmp = res.height;
    res.height = res.width;
    res.width = tmp;
    return res;
  }
}

const div = $('.imageview') as HTMLDivElement;
const nimg = $('#imageview-img') as HTMLImageElement;
const rotate = $('#rotate-btn') as HTMLDivElement;

const mountTo = (img: HTMLImageElement) => () => {
  const rect = img.getBoundingClientRect();
  const origin = new Transform(img.clientWidth, img.clientHeight, rect.top, rect.left, 0);
  const nowState = new Transform(img.clientWidth, img.clientHeight, rect.top, rect.left, 0);

  nimg.src = img.src;
  origin.applyTo(nimg);

  div.onclick = async () => {
    nowState.rotate = ((nowState.rotate + 180) % 360) - 180;
    await Promise.all([
      nowState.animate(nimg, origin),
      walk((x) => div.style.backgroundColor = `rgba(0, 0, 0, ${(1 - x) * .9})`, 200, linear),
    ]);
    div.style.display = 'none';
  };
  
  nimg.onload = () => {
    div.style.display = 'block';
    nowState.animate(nimg, origin.fit(window.innerWidth, window.innerHeight));
    walk((x) => div.style.backgroundColor = `rgba(0, 0, 0, ${x * .9})`, 200, linear);
  }

  rotate.onclick = (e) => {
    e.stopPropagation();
    nowState.animate(nimg, nowState.rotate90(window.innerWidth, window.innerHeight));
  }
}

export const mount = (img: HTMLImageElement) => {
  img.style.cursor = 'pointer';
  img.addEventListener('click', mountTo(img));
}
