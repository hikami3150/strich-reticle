/**
 * レティクル＆Replica View レンダリングエンジン
 * 
 * 高解像度ディスプレイ（Retina / devicePixelRatio）に対応し、
 * 各照準器のベクター描画およびアイピースマスクの合成を行います。
 */

import { drawTZF9b } from "./reticles/tzf9b.js";
import { drawTZF9d } from "./reticles/tzf9d.js";
import { drawTZF12a } from "./reticles/tzf12a.js";
import { drawTZF5b } from "./reticles/tzf5b.js";
import { drawReplicaMask } from "./replicaView.js";

const RETICLE_DRAW_MAP = {
  tzf9b: drawTZF9b,
  tzf9d: drawTZF9d,
  tzf12a: drawTZF12a,
  tzf5b: drawTZF5b
};

export class ReticleRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.cssWidth = 0;
    this.cssHeight = 0;
    this.currentSettings = null;

    // リサイズ監視
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.canvas);
    this.handleResize();
  }

  handleResize() {
    const rect = this.canvas.getBoundingClientRect();
    this.cssWidth = rect.width;
    this.cssHeight = rect.height;
    this.dpr = window.devicePixelRatio || 1;

    this.canvas.width = Math.round(this.cssWidth * this.dpr);
    this.canvas.height = Math.round(this.cssHeight * this.dpr);

    if (this.currentSettings) {
      this.render(this.currentSettings);
    }
  }

  /**
   * レティクルおよびReplica Viewを描画
   * @param {Object} settings 現在の設定オブジェクト
   */
  render(settings) {
    this.currentSettings = settings;
    const { ctx, canvas, dpr, cssWidth, cssHeight } = this;

    if (cssWidth === 0 || cssHeight === 0) return;

    // キャンバスのクリア
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // DPRスケーリング適用
    ctx.scale(dpr, dpr);

    const activeId = settings.reticleType || "tzf9b";
    const drawFn = RETICLE_DRAW_MAP[activeId] || drawTZF9b;

    // 1. レティクルを描画
    drawFn(ctx, cssWidth, cssHeight, {
      color: settings.reticleColor || "#ffffff",
      opacity: settings.reticleOpacity !== undefined ? settings.reticleOpacity : 0.95,
      brightness: settings.reticleBrightness !== undefined ? settings.reticleBrightness : 1.0,
      scale: settings.scale !== undefined ? settings.scale : 1.0,
      offsetX: settings.offsetX || 0,
      offsetY: settings.offsetY || 0
    });

    // 2. Replica View マスクを描画（有効な場合）
    if (settings.replicaViewEnabled) {
      drawReplicaMask(ctx, cssWidth, cssHeight, {
        enabled: true,
        radiusRatio: settings.replicaRadiusRatio !== undefined ? settings.replicaRadiusRatio : 0.88,
        vignetteStrength: settings.replicaVignette !== undefined ? settings.replicaVignette : 0.6,
        bezelVisible: settings.replicaBezel !== undefined ? settings.replicaBezel : true,
        shape: settings.replicaShape || "circle",
        offsetX: settings.offsetX || 0,
        offsetY: settings.offsetY || 0
      });
    }
  }
}
