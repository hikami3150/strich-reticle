/**
 * TZF 5b レティクル描画 (Panzer IV - 7.5 cm KwK 37 L/24 短砲身)
 * 
 * 単眼関節式望遠鏡 (ライツ製等)。
 * 短砲身・低初速（大落差弾道）特有の非線形距離目盛り。
 * K.Gr.rot Pz. (徹甲弾), Sprgr. 34 (榴弾), MG 34。
 */

export function drawTZF5b(ctx, width, height, options = {}) {
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
  const strich = baseRadius / 30;

  // 1. 水平基準線
  const innerLineDist = strich * 16;
  const outerLineDist = baseRadius * 0.94;
  ctx.beginPath();
  ctx.moveTo(-outerLineDist, 0);
  ctx.lineTo(-innerLineDist, 0);
  ctx.moveTo(innerLineDist, 0);
  ctx.lineTo(outerLineDist, 0);
  ctx.stroke();

  // 2. 短砲身特有の垂直弾道落差スケール (下部)
  // 初速が遅いため下方の落差目盛りが深く伸びる
  ctx.beginPath();
  ctx.moveTo(0, strich * 5);
  ctx.lineTo(0, baseRadius * 0.85);
  ctx.stroke();

  // 非線形目盛り（距離の2乗に比例して間隔が広がる物理特性を近似表現）
  const dropDistances = [2, 4, 6, 8, 10, 12, 14, 16]; // x100m
  dropDistances.forEach(d => {
    // 弾道ドロップ近似 (y ∝ d^1.3)
    const y = strich * (3.5 + Math.pow(d / 3.2, 1.35) * 4);
    if (y < baseRadius * 0.82) {
      const isMajor = (d % 4 === 0);
      const tickLen = isMajor ? strich * 2.8 : strich * 1.5;
      ctx.beginPath();
      ctx.moveTo(-tickLen, y);
      ctx.lineTo(tickLen, y);
      ctx.stroke();

      if (isMajor) {
        ctx.save();
        ctx.font = `${Math.max(8, Math.round(strich * 1.3))}px "Courier New", monospace`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(`${d}`, tickLen + strich * 0.8, y);
        ctx.restore();
      }
    }
  });

  // 3. 三角標 (Stachel)
  // 主三角標 (Hauptstachel): 中空正三角形
  drawHollowTriangle(ctx, 0, 0, strich * 4, strich * 4);

  // 左右各3個の副山型標 (Nebenstachel, 4ミル間隔): 底辺のない逆V字山型
  for (let i = 1; i <= 3; i++) {
    const dist = strich * 4 * i;
    drawChevron(ctx, -dist, 0, strich * 2, strich * 2);
    drawChevron(ctx, dist, 0, strich * 2, strich * 2);
  }

  // 4. 外周レンジスケール (弧状スケール)
  ctx.save();
  ctx.font = `bold ${Math.max(9, Math.round(strich * 1.6))}px "Courier New", monospace, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const arcR = baseRadius * 0.86;

  // 上部円弧
  ctx.beginPath();
  ctx.arc(0, 0, arcR, -Math.PI * 0.84, -Math.PI * 0.16, false);
  ctx.stroke();

  // ラベル表示 (短砲身用弾薬)
  ctx.fillText("K.Gr.rot Pz.", -arcR * 0.52, -arcR * 0.9);
  ctx.fillText("Sprgr.34", arcR * 0.52, -arcR * 0.9);
  ctx.fillText("MG 34", -arcR * 0.84, arcR * 0.36);

  // K.Gr.rot Pz. (0〜14 x100m, 短距離)
  const pzgrMarks = [0, 2, 4, 6, 8, 10, 12, 14];
  pzgrMarks.forEach((val, idx) => {
    const angle = (-150 + (idx / (pzgrMarks.length - 1)) * 52) * (Math.PI / 180);
    const rStart = arcR - strich * 1.5;
    const rEnd = arcR + (val % 4 === 0 ? strich * 2.2 : strich * 1.2);
    ctx.beginPath();
    ctx.moveTo(rStart * Math.cos(angle), rStart * Math.sin(angle));
    ctx.lineTo(rEnd * Math.cos(angle), rEnd * Math.sin(angle));
    ctx.stroke();

    if (val % 4 === 0) {
      const textR = arcR - strich * 3.6;
      ctx.fillText(`${val}`, textR * Math.cos(angle), textR * Math.sin(angle));
    }
  });

  // Sprgr. 34 (0〜30 x100m)
  const sprgrMarks = [0, 5, 10, 15, 20, 25, 30];
  sprgrMarks.forEach((val, idx) => {
    const angle = (-84 + (idx / (sprgrMarks.length - 1)) * 52) * (Math.PI / 180);
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

  // 照準器型番刻印
  ctx.font = `${Math.max(9, Math.round(strich * 1.4))}px sans-serif`;
  ctx.fillText("T.Z.F. 5b  (7.5 cm Kw.K. 37)", 0, baseRadius * 0.90);

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
