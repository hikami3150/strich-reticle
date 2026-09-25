/**
 * TZF 9b レティクル描画 (Tiger I - 8.8 cm KwK 36 L/56)
 * 
 * 双眼望遠式（右眼照準ガラス）。
 * 中央Hauptstachel（4ミル）、左右各3個のNebenstachel（4ミル間隔）。
 * Pzgr. 39 (0〜40 x100m)、Sprgr. (0〜40 x100m)、MG34用スケール円弧。
 */

export function drawTZF9b(ctx, width, height, options = {}) {
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

  // 基本単位: 1 Strich (ミル) のピクセル幅 (基準半径の約1/32)
  const baseRadius = Math.min(width, height) * 0.42;
  const strich = baseRadius / 32;

  // 1. 水平基準線 (左右)
  const innerLineDist = strich * 16;
  const outerLineDist = baseRadius * 0.94;
  ctx.beginPath();
  ctx.moveTo(-outerLineDist, 0);
  ctx.lineTo(-innerLineDist, 0);
  ctx.moveTo(innerLineDist, 0);
  ctx.lineTo(outerLineDist, 0);
  ctx.stroke();

  // 2. 垂直下部基準線
  ctx.beginPath();
  ctx.moveTo(0, strich * 6);
  ctx.lineTo(0, baseRadius * 0.7);
  ctx.stroke();

  // 3. 垂直線のStrich目盛り (下部)
  const vertTicks = [10, 15, 20, 25];
  vertTicks.forEach(t => {
    const y = strich * t;
    const tickLen = (t % 10 === 0) ? strich * 2.5 : strich * 1.5;
    ctx.beginPath();
    ctx.moveTo(-tickLen, y);
    ctx.lineTo(tickLen, y);
    ctx.stroke();
  });

  // 4. 三角標 (Stachel) 描画
  // 中央主三角標: Hauptstachel (底辺4ミル、高さ4ミル、頂点が原点(0,0))
  drawTriangle(ctx, 0, 0, strich * 4, strich * 4);

  // 左右副三角標: Nebenstachel (3個ずつ、間隔4ミル、サイズ 2ミルx2ミル)
  for (let i = 1; i <= 3; i++) {
    const dist = strich * 4 * i;
    // 左
    drawTriangle(ctx, -dist, 0, strich * 2, strich * 2);
    // 右
    drawTriangle(ctx, dist, 0, strich * 2, strich * 2);
  }

  // 5. 目盛り円弧と距離スケール (Range scales)
  // TZF 9b の特徴: 外周部の上部〜左右にかけて弾種別レンジ目盛りが配置
  // Pzgr. 39 (徹甲弾): 左上円弧
  // Sprgr. (榴弾): 右上円弧
  // MG 34: 左下円弧
  ctx.save();
  ctx.font = `bold ${Math.max(10, Math.round(strich * 1.8))}px "Courier New", monospace, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const arcRadius = baseRadius * 0.85;

  // 外周円弧ガイド (上半分)
  ctx.beginPath();
  ctx.arc(0, 0, arcRadius, -Math.PI * 0.82, -Math.PI * 0.18, false);
  ctx.stroke();

  // 弾種ラベル
  ctx.fillText("Pzgr.39", -arcRadius * 0.55, -arcRadius * 0.9);
  ctx.fillText("Sprgr.", arcRadius * 0.55, -arcRadius * 0.9);
  ctx.fillText("MG 34", -arcRadius * 0.85, arcRadius * 0.35);

  // Pzgr. 39 目盛り (左上: 0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40 x100m)
  const pzgrValues = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40];
  pzgrValues.forEach((val, idx) => {
    // 角度範囲: -150度から-95度
    const angle = (-150 + (idx / (pzgrValues.length - 1)) * 52) * (Math.PI / 180);
    const r1 = arcRadius - strich * 1.5;
    const r2 = arcRadius + (val % 8 === 0 ? strich * 2 : strich * 1);
    ctx.beginPath();
    ctx.moveTo(r1 * Math.cos(angle), r1 * Math.sin(angle));
    ctx.lineTo(r2 * Math.cos(angle), r2 * Math.sin(angle));
    ctx.stroke();

    if (val % 8 === 0) {
      const textR = arcRadius - strich * 3.8;
      ctx.fillText(`${val}`, textR * Math.cos(angle), textR * Math.sin(angle));
    }
  });

  // Sprgr. 目盛り (右上: 0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40 x100m)
  const sprgrValues = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40];
  sprgrValues.forEach((val, idx) => {
    // 角度範囲: -85度から-30度
    const angle = (-85 + (idx / (sprgrValues.length - 1)) * 52) * (Math.PI / 180);
    const r1 = arcRadius - strich * 1.5;
    const r2 = arcRadius + (val % 8 === 0 ? strich * 2 : strich * 1);
    ctx.beginPath();
    ctx.moveTo(r1 * Math.cos(angle), r1 * Math.sin(angle));
    ctx.lineTo(r2 * Math.cos(angle), r2 * Math.sin(angle));
    ctx.stroke();

    if (val % 8 === 0) {
      const textR = arcRadius - strich * 3.8;
      ctx.fillText(`${val}`, textR * Math.cos(angle), textR * Math.sin(angle));
    }
  });

  // 照準器型番刻印 (下部・史料風)
  ctx.font = `${Math.max(9, Math.round(strich * 1.4))}px sans-serif`;
  ctx.fillText("T.Z.F. 9b  (8.8 cm Kw.K. 36)", 0, baseRadius * 0.88);

  ctx.restore();
  ctx.restore();
}

/**
 * 正三角形（頂点が上、底辺が下）を描画
 */
function drawTriangle(ctx, cx, cy, width, height) {
  ctx.beginPath();
  ctx.moveTo(cx, cy); // 照準頂点
  ctx.lineTo(cx - width / 2, cy + height);
  ctx.lineTo(cx + width / 2, cy + height);
  ctx.closePath();
  ctx.fill();
}
