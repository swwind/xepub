import { animate, walk, timings } from "./animate";

class Transform {
  constructor(width, height, top, left) {
    this.top = top;
    this.left = left;
    this.width = width;
    this.height = height;
  }

  bindImage(img) {
    img.style.top = this.top + 'px';
    img.style.left = this.left + 'px';
    img.style.width = this.width + 'px';
    img.style.height = this.height + 'px';
  }

  fit(maxWidth, maxHeight) {
    const wh = maxWidth / maxHeight;
    const twh = this.width / this.height;
    
    if (twh > wh) {
      const nw = maxWidth - 50;
      const nh = nw / twh;
      return new Transform(nw, nh, (maxHeight - nh) / 2, 25);
    } else {
      const nh = maxHeight - 50;
      const nw = nh * twh;
      return new Transform(nw, nh, 25, (maxWidth - nw) / 2);
    }
  }
}

export const mount = (/** @type {HTMLImageElement} */ img) => {
  img.style.cursor = 'pointer';

  img.addEventListener('click', (e) => {
    const div = document.createElement('div');
    div.classList.add('imageview');

    const rect = img.getBoundingClientRect();
    const origin = new Transform(img.clientWidth, img.clientHeight, rect.top, rect.left);

    const nimg = document.createElement('img');
    div.appendChild(nimg);
    nimg.src = img.src;
    origin.bindImage(nimg);

    div.addEventListener('click', async () => {
      await Promise.all([
        animate(nimg, origin),
        walk((x) => div.style.backgroundColor = `rgba(0, 0, 0, ${(1 - x) * .9})`, 200, timings.linear),
      ]);
      div.remove();
    });
    const scaled = origin.fit(window.innerWidth, window.innerHeight);
    document.body.appendChild(div);
    walk((x) => div.style.backgroundColor = `rgba(0, 0, 0, ${x * .9})`, 200, timings.linear);

    nimg.onload = () => animate(nimg, scaled);
  });
}
