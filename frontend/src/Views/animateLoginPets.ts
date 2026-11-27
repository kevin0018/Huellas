import type { PetPose } from './LoginPets';

const ground = 292;
const poses: PetPose[] = ['idle', 'attentive', 'hiding', 'watching'];
const pets = [
  { x: 265, lag: 0, peekLag: 0.15, speed: 11, phase: 0.5, draw: drawRaccoon },
  { x: 123, lag: 0.05, peekLag: 0.05, speed: 13, phase: 0, draw: drawDog },
  { x: 403, lag: 0.12, peekLag: 0.28, speed: 12, phase: 1, draw: drawCat },
];

type Drawing = CanvasRenderingContext2D;
type Expression = { x: number; y: number; blink: number; hide: number; peek: number; play: number };

function readPalette(canvas: HTMLCanvasElement) {
  const styles = getComputedStyle(canvas);
  const color = (name: string) => styles.getPropertyValue(`--pet-${name}`).trim();
  return {
    ink: color('ink'),
    paper: color('paper'),
    raccoonFur: color('raccoon-fur'),
    raccoonMask: color('raccoon-mask'),
    raccoonBelly: color('raccoon-belly'),
    raccoonEar: color('raccoon-ear'),
    raccoonMuzzle: color('raccoon-muzzle'),
    bookCover: color('book-cover'),
    bookPages: color('book-pages'),
    bookSpine: color('book-spine'),
    bookPaw: color('book-paw'),
    dogFur: color('dog-fur'),
    dogTail: color('dog-tail'),
    dogPaw: color('dog-paw'),
    dogMuzzle: color('dog-muzzle'),
    dogEar: color('dog-ear'),
    dogEarHighlight: color('dog-ear-highlight'),
    catFur: color('cat-fur'),
    catTail: color('cat-tail'),
    catEar: color('cat-ear'),
    catBelly: color('cat-belly'),
    catPaw: color('cat-paw'),
    catWhiskers: color('cat-whiskers'),
    groundShadow: color('ground-shadow'),
    ballShadow: color('ball-shadow'),
    ball: color('ball'),
    ballSeam: color('ball-seam'),
  };
}

type Palette = ReturnType<typeof readPalette>;

function oval(ctx: Drawing, x: number, y: number, rx: number, ry: number, color: string) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function rounded(ctx: Drawing, x: number, y: number, w: number, h: number, r: number | number[], color: string) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = color;
  ctx.fill();
}

function stroke(ctx: Drawing, color: string, width: number) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function eye(ctx: Drawing, x: number, y: number, expression: Expression, palette: Palette) {
  if (expression.blink > 0.82) {
    rounded(ctx, x - 7, y - 1.5, 14, 3, 1.5, palette.ink);
    return;
  }
  const openness = 1 - expression.blink;
  oval(ctx, x, y, 10, 12 * openness, palette.paper);
  oval(ctx, x + expression.x, y + expression.y * openness, 4.5, 5.5 * openness, palette.ink);
}

function smile(ctx: Drawing, x: number, y: number, palette: Palette) {
  ctx.beginPath();
  ctx.moveTo(x - 5, y);
  ctx.quadraticCurveTo(x, y + 6, x + 5, y);
  stroke(ctx, palette.ink, 2.6);
}

function drawRaccoon(ctx: Drawing, face: Expression, palette: Palette) {
  const fur = palette.raccoonFur;
  const mask = palette.raccoonMask;
  ctx.beginPath();
  ctx.moveTo(47, -27);
  ctx.bezierCurveTo(90, -20, 104, -51, 95, -72);
  stroke(ctx, mask, 21);
  ctx.beginPath();
  ctx.moveTo(75, -33);
  ctx.quadraticCurveTo(82, -33, 86, -39);
  stroke(ctx, fur, 15);

  rounded(ctx, -60, -212, 120, 212, [58, 58, 19, 19], fur);
  oval(ctx, 0, -55, 43, 42, palette.raccoonBelly);
  for (const x of [-39, 39]) {
    oval(ctx, x, -204, 19, 20, fur);
    oval(ctx, x, -204, 10, 10, palette.raccoonEar);
  }
  const glance = face.x * 0.9;
  oval(ctx, glance, -153, 48, 25, mask);
  eye(ctx, glance - 20, -155, face, palette);
  eye(ctx, glance + 20, -155, face, palette);
  oval(ctx, glance, -128, 24, 14, palette.raccoonMuzzle);
  oval(ctx, glance, -134, 6, 4, palette.ink);
  smile(ctx, glance, -124, palette);

  ctx.save();
  ctx.translate(3, -76 - face.hide * 66 - face.peek * 42);
  ctx.rotate(-0.1 + face.hide * 0.06 + face.peek * 0.18 + face.play * 0.055);
  rounded(ctx, -37, -26, 74, 53, 7, palette.bookCover);
  rounded(ctx, -31, -22, 62, 4, 2, palette.bookPages);
  rounded(ctx, -2, -17, 3, 41, 1.5, palette.bookSpine);
  oval(ctx, 13, 9, 5.8, 4.5, palette.bookPaw);
  for (const x of [7, 13, 19]) oval(ctx, x, 2, 2.2, 2.8, palette.bookPaw);
  oval(ctx, -36, 3, 10, 13, mask);
  oval(ctx, 36, 5, 10, 13, mask);
  ctx.restore();
}

function drawDog(ctx: Drawing, face: Expression, palette: Palette) {
  const fur = palette.dogFur;
  ctx.beginPath();
  ctx.moveTo(-58, -34);
  ctx.quadraticCurveTo(-91 - face.play * 8, -37, -85 - face.play * 9, -64);
  stroke(ctx, palette.dogTail, 14);

  rounded(ctx, -71, -108, 154, 108, [50, 55, 20, 20], fur);
  rounded(ctx, -68, -26, 29, 26, [8, 8, 9, 9], palette.dogPaw);
  rounded(ctx, 48 + face.play * 9, -26 - face.play * 11, 30, 26, [8, 8, 9, 9], palette.dogPaw);
  oval(ctx, 58, -55, 35, 21, palette.dogMuzzle);
  const glance = face.x + 2 - face.hide * 12;
  eye(ctx, 11 + glance, -75, face, palette);
  eye(ctx, 39 + glance, -75, face, palette);
  oval(ctx, 82 - face.hide * 10, -60, 12, 8, palette.ink);
  smile(ctx, 58 - face.hide * 4, -45, palette);

  ctx.save();
  ctx.translate(-36 + 24 * face.hide + 12 * face.peek, -92);
  ctx.rotate(0.21 + face.play * 0.24 - face.hide * 0.86 - face.peek * 0.32);
  rounded(ctx, -13, -10, 31, 72, [15, 13, 16, 20], palette.dogEar);
  rounded(ctx, -5, 6, 6, 35, 3, palette.dogEarHighlight);
  ctx.restore();
}

function drawCat(ctx: Drawing, face: Expression, palette: Palette) {
  const fur = palette.catFur;
  ctx.beginPath();
  ctx.moveTo(31, -19);
  ctx.bezierCurveTo(83, -4, 98 + face.play * 6, -46, 73 + face.play * 12, -56 - face.play * 15);
  stroke(ctx, palette.catTail, 15);

  rounded(ctx, -51, -163, 102, 163, [44, 45, 19, 19], fur);
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.scale(side, 1);
    ctx.translate(0, -8 * face.play);
    ctx.beginPath();
    ctx.moveTo(13, -155);
    ctx.quadraticCurveTo(40, -184, 47, -184);
    ctx.quadraticCurveTo(52, -183, 50, -146);
    ctx.closePath();
    ctx.fillStyle = fur;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(31, -158);
    ctx.lineTo(44, -174);
    ctx.lineTo(43, -153);
    ctx.closePath();
    ctx.fillStyle = palette.catEar;
    ctx.fill();
    ctx.restore();
  }
  oval(ctx, 1, -49, 32, 36, palette.catBelly);
  rounded(ctx, -47 - face.play * 9, -21 - face.play * 12, 21, 20, 9, palette.catPaw);
  const glance = face.x + 13 * face.hide;
  eye(ctx, -16 + glance, -112, face, palette);
  eye(ctx, 16 + glance, -112, face, palette);
  oval(ctx, glance, -94, 4.7, 3.1, palette.ink);
  smile(ctx, glance, -89, palette);
  for (const side of [-1, 1]) {
    rounded(ctx, side * 33 + glance * 0.25 - 5, -91, 10, 2.5, 1, palette.catWhiskers);
    rounded(ctx, side * 31 + glance * 0.25 - 4, -85, 8, 2.5, 1, palette.catWhiskers);
  }
}

export function animateLoginPets(canvas: HTMLCanvasElement, pose: () => PetPose) {
  const context = typeof CanvasRenderingContext2D !== 'undefined' && canvas.getContext('2d');
  if (!context) return;
  const ctx = context;
  const palette = readPalette(canvas);
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const wide = window.matchMedia('(min-width: 56rem)');
  const weights = pets.map(() => poses.map(state => Number(state === pose())));
  let target = pose();
  let age = 0;
  let clock = 0;
  let pass = 0.15;
  let previous = 0;
  let frame = 0;
  const stops = [170, 363];

  function draw(now = performance.now()) {
    cancelAnimationFrame(frame);
    const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
    previous = now;
    const still = motion.matches;
    const towardsForm = wide.matches ? -1 : 0;
    if (target !== pose()) {
      target = pose();
      age = 0;
    }
    age += dt;
    clock += dt;
    pets.forEach(({ lag, peekLag, speed }, index) => {
      const delay = target === 'watching' ? peekLag : lag;
      const blend = still ? 1 : age >= delay ? 1 - Math.exp(-dt * speed) : 0;
      poses.forEach((state, row) => {
        weights[index][row] += (Number(target === state) - weights[index][row]) * blend;
      });
    });
    pass = still ? 0.22 : (pass + dt * weights[0][0] * 0.91) % 2;
    const leg = Math.floor(pass);
    const progress = pass - leg;
    const ballX = stops[leg] + (stops[1 - leg] - stops[leg]) * progress;
    const ballY = ground - 8 - 4 * progress * (1 - progress) * 30 * weights[0][0];

    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, 540, 348);
    oval(ctx, 270, ground + 7, 219, 15, palette.groundShadow);
    pets.forEach(({ x, phase, draw: paint }, index) => {
      const [idle, attentive, hide, peek] = weights[index];
      const play = still ? 0 : idle * Math.exp(-(((ballX - x) / 73) ** 2));
      const glance = Math.max(-4, Math.min(4, (ballX - x) / 16));
      const breath = still ? 0 : Math.sin(clock * 3 + phase * 3) * 0.012;
      const blinkTime = (clock + phase * 1.9) % (3.3 + phase);
      const blink = !still && blinkTime > 3.1 + phase ? Math.sin((blinkTime - 3.1 - phase) / 0.2 * Math.PI) : 0;
      const direction = index === 2 ? -1 : 1;
      const closed = index === 0 ? blink : Math.max(blink, hide * 0.98);
      ctx.save();
      ctx.translate(x, ground);
      const lean = towardsForm * (0.13 * hide - 0.13 * attentive - 0.07 * peek) - direction * 0.08 * play;
      ctx.transform(1, 0, lean, 1 + breath + 0.045 * attentive - 0.08 * hide - 0.035 * play, 0, 0);
      paint(ctx, {
        x: glance * idle + towardsForm * (4 * attentive - 3 * hide + 4 * peek),
        y: 2 * idle + (wide.matches ? 0 : 4 * attentive - 3 * hide + 3 * peek),
        blink: closed,
        hide,
        peek,
        play,
      }, palette);
      ctx.restore();
    });
    oval(ctx, ballX, ground + 4, 10, 3, palette.ballShadow);
    oval(ctx, ballX, ballY, 9, 9, palette.ball);
    ctx.beginPath();
    ctx.moveTo(ballX - 6, ballY + 3);
    ctx.quadraticCurveTo(ballX, ballY - 3, ballX + 5, ballY - 4);
    stroke(ctx, palette.ballSeam, 2);
    if (!still && !document.hidden) frame = requestAnimationFrame(draw);
  }

  const refresh = () => { previous = 0; draw(); };
  motion.addEventListener('change', refresh);
  wide.addEventListener('change', refresh);
  document.addEventListener('visibilitychange', refresh);
  draw();
  return { draw, stop() {
    cancelAnimationFrame(frame);
    motion.removeEventListener('change', refresh);
    wide.removeEventListener('change', refresh);
    document.removeEventListener('visibilitychange', refresh);
  } };
}
