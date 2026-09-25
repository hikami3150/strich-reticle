/**
 * Replica View (レプリカビュー) 描画モジュール
 * 
 * 3Dプリント等の照準器レプリカや鏡筒にスマートフォンを装着した際、
 * 実物の照準器アイピースを覗き込んでいるリアルな視覚体験を提供します。
 * - 外側を完全な遮光黒 (#000000) でマスク
 * - 鏡筒・アイピースの光学レンズ縁ビネット（減光効果）
 * - 金属ベゼルリングおよび円形視野開口
 */

export function drawReplicaMask(ctx, width, height, options = {}) {
  const {
    enabled = true,
    radiusRatio = 0.88, // 画面短辺に対する視野円の割合
    vignetteStrength = 0.5,
    bezelVisible = true,
    shape = "circle", // "circle" または "rect"
    offsetX = 0,
    offsetY = 0
  } = options;

  if (!enabled) return;

  ctx.save();

  const cx = width / 2 + offsetX;
  const cy = height / 2 + offsetY;
  const shortSide = Math.min(width, height);
  const radius = (shortSide * 0.5) * radiusRatio;

  // 1. マスクの描画（偶奇規則 evenodd を使用して中央部をくり抜く）
  ctx.beginPath();
  // 画面全体の外枠
  ctx.rect(0, 0, width, height);

  if (shape === "circle") {
    // 中央の円形視野を逆時計回りにくり抜く
    ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);
  } else {
    // 角丸長方形
    const rw = radius * 1.6;
    const rh = radius * 1.2;
    const r = 20;
    ctx.roundRect(cx - rw / 2, cy - rh / 2, rw, rh, r);
  }

  // 外側を完全な遮光黒で塗りつぶし
  ctx.fillStyle = "#000000";
  ctx.fill("evenodd");

  // 2. レンズ縁のビネット (Vignette) 効果
  if (vignetteStrength > 0 && shape === "circle") {
    const innerVignetteR = radius * (1 - 0.15 * vignetteStrength);
    const grad = ctx.createRadialGradient(cx, cy, innerVignetteR, cx, cy, radius);
    grad.addColorStop(0, "rgba(0, 0, 0, 0)");
    grad.addColorStop(0.7, `rgba(0, 0, 0, ${0.4 * vignetteStrength})`);
    grad.addColorStop(1, `rgba(0, 0, 0, ${0.95 * vignetteStrength})`);

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // 3. アイピース鏡筒の金属ベゼルリング (枠線とハイライト)
  if (bezelVisible && shape === "circle") {
    // 内側境界線 (ダークグレー)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#1a1f1a";
    ctx.lineWidth = 3;
    ctx.stroke();

    // 鏡筒の厚みリング (梨地ブラック・ベークライト調)
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2);
    ctx.strokeStyle = "#080a08";
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  ctx.restore();
}
