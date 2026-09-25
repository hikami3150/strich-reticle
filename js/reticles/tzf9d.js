/**
 * TZF 9d レティクル描画 (Tiger II - 8.8 cm KwK 43 L/71)
 * 
 * 単眼関節式、可変倍率（2.5x / 5x）。
 * 超高初速砲（KwK 43）に対応したフラットな弾道目盛り。
 * Pzgr. 39/43, Pzgr. 40/43, Sprgr. 43。
 */

export function drawTZF9d(ctx, width, height, options = {}) {
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

  // 1. 水平基準線
  const innerLineDist = strich * 16;
  const outerLineDist = baseRadius * 0.94;
  ctx.beginPath();
  ctx.moveTo(-outerLineDist, 0);
  ctx.lineTo(-innerLineDist, 0);
  ctx.moveTo(innerLineDist, 0);
  ctx.lineTo(outerLineDist, 0);
  ctx.stroke();

  // 2. 垂直下部線 & 目盛り
  ctx.beginPath();
  ctx.moveTo(0, strich * 6);
  ctx.lineTo(0, baseRadius * 0.75);
  ctx.stroke();

  const vertTicks = [8, 12, 16, 20, 24, 28];
  vertTicks.forEach(t => {
    const y = strich * t;
    const tickLen = (t % 8 === 0) ? strich * 2.2 : strich * 1.2;
    ctx.beginPath();
    ctx.moveTo(-tickLen, y);
    ctx.lineTo(tickLen, y);
    ctx.stroke();
  });

  // 3. 三角標 (Stachel)
  // 主三角標 (Hauptstachel): 中空正三角形
  drawHollowTriangle(ctx, 0, 0, strich * 4, strich * 4);

  // 左右各3個の副山型標 (Nebenstachel): 底辺のない逆V字山型
  for (let i = 1; i <= 3; i++) {
    const dist = strich * 4 * i;
    drawChevron(ctx, -dist, 0, strich * 2, strich * 2);
    drawChevron(ctx, dist, 0, strich * 2, strich * 2);
  }

  // 4. TZF 9d 精密レンジスケール (弧状スケール)
  ctx.save();
  ctx.font = `bold ${Math.max(9, Math.round(strich * 1.6))}px "Courier New", monospace, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const arcR1 = baseRadius * 0.88; // 外側弧 (Sprgr. 43)
  const arcR2 = baseRadius * 0.80; // 内側弧 (Pzgr. 39/43)

  // 上部二重円弧
  ctx.beginPath();
  ctx.arc(0, 0, arcR1, -Math.PI * 0.85, -Math.PI * 0.15, false);
  ctx.arc(0, 0, arcR2, -Math.PI * 0.82, -Math.PI * 0.18, false);
  ctx.stroke();

  // 弾種ラベル
  ctx.fillText("Pzgr.39/43", -arcR2 * 0.5, -arcR2 * 0.88);
  ctx.fillText("Sprgr.43", arcR1 * 0.5, -arcR1 * 0.88);
  ctx.fillText("Pzgr.40/43", -arcR1 * 0.82, arcR1 * 0.4);

  // Pzgr. 39/43 目盛り (0〜40 x100m, 高初速で狭い間隔)
  const pzgrMarks = [0, 5, 10, 15, 20, 25, 30, 35, 40];
  pzgrMarks.forEach((val, idx) => {
    const angle = (-150 + (idx / (pzgrMarks.length - 1)) * 54) * (Math.PI / 180);
    const rStart = arcR2 - strich * 1.2;
    const rEnd = arcR2 + (val % 10 === 0 ? strich * 2.2 : strich * 1.2);
    ctx.beginPath();
    ctx.moveTo(rStart * Math.cos(angle), rStart * Math.sin(angle));
    ctx.lineTo(rEnd * Math.cos(angle), rEnd * Math.sin(angle));
    ctx.stroke();

    if (val % 10 === 0) {
      const textR = arcR2 - strich * 3.5;
      ctx.fillText(`${val}`, textR * Math.cos(angle), textR * Math.sin(angle));
    }
  });

  // Sprgr. 43 目盛り (0〜50 x100m)
  const sprgrMarks = [0, 10, 20, 30, 40, 50];
  sprgrMarks.forEach((val, idx) => {
    const angle = (-82 + (idx / (sprgrMarks.length - 1)) * 54) * (Math.PI / 180);
    const rStart = arcR1 - strich * 1.2;
    const rEnd = arcR1 + strich * 2.2;
    ctx.beginPath();
    ctx.moveTo(rStart * Math.cos(angle), rStart * Math.sin(angle));
    ctx.lineTo(rEnd * Math.cos(angle), rEnd * Math.sin(angle));
    ctx.stroke();

    const textR = arcR1 - strich * 3.5;
    ctx.fillText(`${val}`, textR * Math.cos(angle), textR * Math.sin(angle));
  });

  // 照準器型番刻印
  ctx.font = `${Math.max(9, Math.round(strich * 1.4))}px sans-serif`;
  ctx.fillText("T.Z.F. 9d  (8.8 cm Kw.K. 43)", 0, baseRadius * 0.90);

  ctx.restore();
  ctx.restore();
}

function drawHollowTriangle(ctx, cx, cy, width, height) {
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx - width / 2, cy + height);
  ctx.lineTo(cx + width / 2, cy + height);
  ctx.closePath();
  ctx.stroke();
}

function drawChevron(ctx, cx, cy, width, height) {
  ctx.beginPath();
  ctx.moveTo(cx - width / 2, cy + height);
  ctx.lineTo(cx, cy);
  ctx.lineTo(cx + width / 2, cy + height);
  ctx.stroke();
}
