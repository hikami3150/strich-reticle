/**
 * TZF 12a レティクル描画 (Panther - 7.5 cm KwK 42 L/70)
 * 
 * 単眼関節式望遠鏡。
 * 特徴的な7つの三角照準標 (Hauptstachel + 6 Nebenstachel)。
 * Pzgr. 39/42 (0〜30 x100m), Sprgr. 42 (0〜40 x100m), MG 34 (0〜20 x100m)。
 */

export function drawTZF12a(ctx, width, height, options = {}) {
  const {
    color = "#ffffff",
    opacity = 1.0,
    brightness = 1.0,
    scale = 1.0,
    offsetX = 0,
    offsetY = 0
  } = options;

  ctx.save();
  ctx.translate(width / 2 + offsetX, height / 2 + offsetY);
  ctx.scale(scale, scale);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity;
  ctx.lineWidth = Math.max(1, 1.6 * brightness);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const baseRadius = Math.min(width, height) * 0.42;
  const strich = baseRadius / 32;

  // 1. 水平基準線 (7つの三角形の外側へ)
  const innerLineDist = strich * 16;
  const outerLineDist = baseRadius * 0.94;
  ctx.beginPath();
  ctx.moveTo(-outerLineDist, 0);
  ctx.lineTo(-innerLineDist, 0);
  ctx.moveTo(innerLineDist, 0);
  ctx.lineTo(outerLineDist, 0);
  ctx.stroke();

  // 水平線上の微細なStrich補助目盛り（左右各4本）
  for (let s = 18; s <= 28; s += 4) {
    const x = strich * s;
    ctx.beginPath();
    ctx.moveTo(-x, -strich * 0.9);
    ctx.lineTo(-x, strich * 0.9);
    ctx.moveTo(x, -strich * 0.9);
    ctx.lineTo(x, strich * 0.9);
    ctx.stroke();
  }

  // 2. 垂直下部線 & 目盛り
  ctx.beginPath();
  ctx.moveTo(0, strich * 6);
  ctx.lineTo(0, baseRadius * 0.72);
  ctx.stroke();

  const vertTicks = [8, 12, 16, 20, 24];
  vertTicks.forEach(t => {
    const y = strich * t;
    const tickLen = (t % 8 === 0) ? strich * 2.2 : strich * 1.2;
    ctx.beginPath();
    ctx.moveTo(-tickLen, y);
    ctx.lineTo(tickLen, y);
    ctx.stroke();
  });

  // 3. 7つの三角形 (Stachel)
  // 中央主三角: Hauptstachel (幅4ミル、高さ4ミル)
  drawTriangle(ctx, 0, 0, strich * 4, strich * 4);

  // 左右各3個の副三角: Nebenstachel (幅2ミル、高さ2ミル、先端間隔4ミル)
  for (let i = 1; i <= 3; i++) {
    const dist = strich * 4 * i;
    drawTriangle(ctx, -dist, 0, strich * 2, strich * 2);
    drawTriangle(ctx, dist, 0, strich * 2, strich * 2);
  }

  // 4. 外周レンジスケール (Panther TZF 12a 式)
  ctx.save();
  ctx.font = `bold ${Math.max(9, Math.round(strich * 1.6))}px "Courier New", monospace, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const arcR = baseRadius * 0.86;

  // 上部スケール円弧
  ctx.beginPath();
  ctx.arc(0, 0, arcR, -Math.PI * 0.84, -Math.PI * 0.16, false);
  ctx.stroke();

  // ラベル表示
  ctx.fillText("Pzgr.39/42", -arcR * 0.52, -arcR * 0.9);
  ctx.fillText("Sprgr.42", arcR * 0.52, -arcR * 0.9);
  ctx.fillText("MG 34", -arcR * 0.84, arcR * 0.36);

  // Pzgr. 39/42 スケール (0〜30 x100m)
  const pzgrMarks = [0, 5, 10, 15, 20, 25, 30];
  pzgrMarks.forEach((val, idx) => {
    const angle = (-150 + (idx / (pzgrMarks.length - 1)) * 52) * (Math.PI / 180);
    const rStart = arcR - strich * 1.5;
    const rEnd = arcR + (val % 10 === 0 ? strich * 2.2 : strich * 1.2);
    ctx.beginPath();
    ctx.moveTo(rStart * Math.cos(angle), rStart * Math.sin(angle));
    ctx.lineTo(rEnd * Math.cos(angle), rEnd * Math.sin(angle));
    ctx.stroke();

    if (val % 10 === 0) {
      const textR = arcR - strich * 3.6;
      ctx.fillText(`${val}`, textR * Math.cos(angle), textR * Math.sin(angle));
    }
  });

  // Sprgr. 42 スケール (0〜40 x100m)
  const sprgrMarks = [0, 8, 16, 24, 32, 40];
  sprgrMarks.forEach((val, idx) => {
    const angle = (-84 + (idx / (sprgrMarks.length - 1)) * 52) * (Math.PI / 180);
    const rStart = arcR - strich * 1.5;
    const rEnd = arcR + (val % 16 === 0 ? strich * 2.2 : strich * 1.2);
    ctx.beginPath();
    ctx.moveTo(rStart * Math.cos(angle), rStart * Math.sin(angle));
    ctx.lineTo(rEnd * Math.cos(angle), rEnd * Math.sin(angle));
    ctx.stroke();

    if (val % 16 === 0) {
      const textR = arcR - strich * 3.6;
      ctx.fillText(`${val}`, textR * Math.cos(angle), textR * Math.sin(angle));
    }
  });

  // 照準器型番刻印
  ctx.font = `${Math.max(9, Math.round(strich * 1.4))}px sans-serif`;
  ctx.fillText("T.Z.F. 12a  (7.5 cm Kw.K. 42)", 0, baseRadius * 0.90);

  ctx.restore();
  ctx.restore();
}

function drawTriangle(ctx, cx, cy, width, height) {
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx - width / 2, cy + height);
  ctx.lineTo(cx + width / 2, cy + height);
  ctx.closePath();
  ctx.fill();
}
