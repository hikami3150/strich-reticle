/**
 * メインアプリケーションロジック (app.js)
 * 
 * - カメラ制御とレンダラーの初期化
 * - 照準器ごとの個別キャリブレーション (localStorage)
 * - UIイベントリスナーおよびMuseum Mode管理
 * - 歴史情報パネルの更新
 */

import { CameraManager } from "./camera.js";
import { ReticleRenderer } from "./reticleRenderer.js";
import { HISTORICAL_DATA } from "./historicalData.js";

// 各照準器のデフォルト設定値
const DEFAULT_RETICLE_CONFIG = {
  offsetX: 0,
  offsetY: 0,
  scale: 1.0,
  reticleOpacity: 0.95,
  reticleBrightness: 1.0,
  reticleColor: "#ffffff"
};

// アプリ全体のグローバル設定
const DEFAULT_GLOBAL_CONFIG = {
  activeReticle: "tzf9b",
  replicaViewEnabled: true,
  replicaRadiusRatio: 0.88,
  replicaVignette: 0.6,
  replicaBezel: true,
  replicaShape: "circle",
  museumMode: false,
  zoomLevel: 1.0,
  preferredDeviceId: null
};

class App {
  constructor() {
    this.globalConfig = { ...DEFAULT_GLOBAL_CONFIG };
    this.reticleConfigs = {}; // id -> config

    // DOM要素の参照
    this.dom = {
      video: document.getElementById("camera-video"),
      videoContainer: document.getElementById("camera-container"),
      canvas: document.getElementById("reticle-canvas"),
      startModal: document.getElementById("start-modal"),
      errorModal: document.getElementById("error-modal"),
      errorMessage: document.getElementById("error-message"),
      btnStartCamera: document.getElementById("btn-start-camera"),
      btnRetryCamera: document.getElementById("btn-retry-camera"),
      btnCancelError: document.getElementById("btn-cancel-error"),
      settingsDrawer: document.getElementById("settings-drawer"),
      btnOpenSettings: document.getElementById("btn-open-settings"),
      btnCloseSettings: document.getElementById("btn-close-settings"),
      btnFullscreen: document.getElementById("btn-fullscreen"),
      badgeSightName: document.getElementById("badge-sight-name"),
      
      // 設定フォーム
      selectReticle: document.getElementById("select-reticle"),
      selectCamera: document.getElementById("select-camera"),
      sliderZoom: document.getElementById("slider-zoom"),
      valZoom: document.getElementById("val-zoom"),
      sliderOpacity: document.getElementById("slider-opacity"),
      valOpacity: document.getElementById("val-opacity"),
      sliderBrightness: document.getElementById("slider-brightness"),
      valBrightness: document.getElementById("val-brightness"),
      sliderScale: document.getElementById("slider-scale"),
      valScale: document.getElementById("val-scale"),
      colorOptions: document.querySelectorAll(".color-option"),
      
      // Replica View
      toggleReplica: document.getElementById("toggle-replica"),
      sliderReplicaRadius: document.getElementById("slider-replica-radius"),
      valReplicaRadius: document.getElementById("val-replica-radius"),
      sliderReplicaVignette: document.getElementById("slider-replica-vignette"),
      valReplicaVignette: document.getElementById("val-replica-vignette"),
      replicaControlsGroup: document.getElementById("replica-controls-group"),

      // キャリブレーションパッド
      dpadUp: document.getElementById("dpad-up"),
      dpadDown: document.getElementById("dpad-down"),
      dpadLeft: document.getElementById("dpad-left"),
      dpadRight: document.getElementById("dpad-right"),
      valOffset: document.getElementById("val-offset"),
      btnResetCalib: document.getElementById("btn-reset-calib"),

      // その他機能
      toggleMuseum: document.getElementById("toggle-museum"),
      historyContainer: document.getElementById("history-container")
    };

    this.cameraManager = new CameraManager(this.dom.video, this.dom.videoContainer);
    this.renderer = new ReticleRenderer(this.dom.canvas);

    this.loadAllConfigs();
    this.initEventListeners();
    this.updateUIFromCurrentConfig();
  }

  /**
   * localStorageから設定をロード
   */
  loadAllConfigs() {
    try {
      const savedGlobal = localStorage.getItem("strich_global_config");
      if (savedGlobal) {
        this.globalConfig = { ...this.globalConfig, ...JSON.parse(savedGlobal) };
      }

      // 4種類の照準器設定を個別ロード
      const reticleIds = ["tzf9b", "tzf9d", "tzf12a", "tzf5b"];
      reticleIds.forEach(id => {
        const saved = localStorage.getItem(`strich_reticle_${id}`);
        if (saved) {
          this.reticleConfigs[id] = { ...DEFAULT_RETICLE_CONFIG, ...JSON.parse(saved) };
        } else {
          this.reticleConfigs[id] = { ...DEFAULT_RETICLE_CONFIG };
        }
      });
    } catch (e) {
      console.warn("設定ロードエラー:", e);
    }
  }

  /**
   * 現在の照準器設定をlocalStorageに保存
   */
  saveCurrentReticleConfig() {
    const activeId = this.globalConfig.activeReticle;
    try {
      localStorage.setItem(`strich_reticle_${activeId}`, JSON.stringify(this.reticleConfigs[activeId]));
      localStorage.setItem("strich_global_config", JSON.stringify(this.globalConfig));
    } catch (e) {
      console.warn("設定保存エラー:", e);
    }
  }

  /**
   * 現在のアクティブ設定オブジェクトを取得
   */
  getMergedSettings() {
    const activeId = this.globalConfig.activeReticle;
    const reticleConf = this.reticleConfigs[activeId] || DEFAULT_RETICLE_CONFIG;

    return {
      reticleType: activeId,
      offsetX: reticleConf.offsetX,
      offsetY: reticleConf.offsetY,
      scale: reticleConf.scale,
      reticleOpacity: reticleConf.reticleOpacity,
      reticleBrightness: reticleConf.reticleBrightness,
      reticleColor: reticleConf.reticleColor,
      replicaViewEnabled: this.globalConfig.replicaViewEnabled,
      replicaRadiusRatio: this.globalConfig.replicaRadiusRatio,
      replicaVignette: this.globalConfig.replicaVignette,
      replicaBezel: this.globalConfig.replicaBezel,
      replicaShape: this.globalConfig.replicaShape
    };
  }

  /**
   * 画面およびレティクルの再描画
   */
  refresh() {
    const settings = this.getMergedSettings();
    this.renderer.render(settings);
    this.saveCurrentReticleConfig();
  }

  /**
   * UI部品の表示状態を設定値と同期
   */
  updateUIFromCurrentConfig() {
    const activeId = this.globalConfig.activeReticle;
    const reticleConf = this.reticleConfigs[activeId] || DEFAULT_RETICLE_CONFIG;

    // ヘッダーバッジ
    this.dom.badgeSightName.textContent = activeId.toUpperCase();

    // 照準器選択セレクト
    this.dom.selectReticle.value = activeId;

    // スライダー類
    this.dom.sliderZoom.value = this.globalConfig.zoomLevel;
    this.dom.valZoom.textContent = `${Number(this.globalConfig.zoomLevel).toFixed(1)}x`;

    this.dom.sliderOpacity.value = reticleConf.reticleOpacity;
    this.dom.valOpacity.textContent = `${Math.round(reticleConf.reticleOpacity * 100)}%`;

    this.dom.sliderBrightness.value = reticleConf.reticleBrightness;
    this.dom.valBrightness.textContent = `${Number(reticleConf.reticleBrightness).toFixed(1)}x`;

    this.dom.sliderScale.value = reticleConf.scale;
    this.dom.valScale.textContent = `${Number(reticleConf.scale).toFixed(2)}x`;

    // オフセット表示
    this.dom.valOffset.textContent = `X:${reticleConf.offsetX} Y:${reticleConf.offsetY}`;

    // カラーセレクター
    this.dom.colorOptions.forEach(opt => {
      if (opt.dataset.color === reticleConf.reticleColor) {
        opt.classList.add("active");
      } else {
        opt.classList.remove("active");
      }
    });

    // Replica View
    this.dom.toggleReplica.checked = this.globalConfig.replicaViewEnabled;
    this.dom.replicaControlsGroup.style.display = this.globalConfig.replicaViewEnabled ? "flex" : "none";
    this.dom.sliderReplicaRadius.value = this.globalConfig.replicaRadiusRatio;
    this.dom.valReplicaRadius.textContent = `${Math.round(this.globalConfig.replicaRadiusRatio * 100)}%`;
    this.dom.sliderReplicaVignette.value = this.globalConfig.replicaVignette;
    this.dom.valReplicaVignette.textContent = `${Math.round(this.globalConfig.replicaVignette * 100)}%`;

    // Museum Mode
    this.dom.toggleMuseum.checked = this.globalConfig.museumMode;
    if (this.globalConfig.museumMode) {
      document.body.classList.add("museum-mode");
    } else {
      document.body.classList.remove("museum-mode");
    }

    // 歴史情報の更新
    this.renderHistoryInfo(activeId);

    // 再描画
    this.refresh();
  }

  /**
   * 歴史情報パネルの描画
   */
  renderHistoryInfo(id) {
    const data = HISTORICAL_DATA[id];
    if (!data) return;

    this.dom.historyContainer.innerHTML = `
      <div class="history-card">
        <table class="specs-table">
          <tr><td>正式名称:</td><td>${data.fullGermanName}</td></tr>
          <tr><td>搭載戦車:</td><td>${data.tankName}</td></tr>
          <tr><td>主砲:</td><td>${data.mainGun}</td></tr>
          <tr><td>製造元:</td><td>${data.manufacturer}</td></tr>
          <tr><td>光学諸元:</td><td>倍率 ${data.magnification} / 視野 ${data.fieldOfView}</td></tr>
        </table>
        <div class="history-text">${data.description}</div>
        <div class="history-disclaimer">※ ${data.disclaimer}</div>
      </div>
    `;
  }

  /**
   * イベントリスナー設定
   */
  initEventListeners() {
    // 1. カメラ開始ボタン (ユーザー操作起点の明示的トリガー)
    this.dom.btnStartCamera.addEventListener("click", () => this.handleStartCamera());
    this.dom.btnRetryCamera.addEventListener("click", () => this.handleStartCamera());
    this.dom.btnCancelError.addEventListener("click", () => {
      this.dom.errorModal.style.display = "none";
    });

    // 2. 設定ドロワー開閉
    this.dom.btnOpenSettings.addEventListener("click", () => {
      this.populateCameraList();
      this.dom.settingsDrawer.classList.add("open");
    });
    this.dom.btnCloseSettings.addEventListener("click", () => {
      this.dom.settingsDrawer.classList.remove("open");
    });

    // 3. 照準器切り替え
    this.dom.selectReticle.addEventListener("change", (e) => {
      this.globalConfig.activeReticle = e.target.value;
      this.updateUIFromCurrentConfig();
    });

    // 4. カメラ選択
    this.dom.selectCamera.addEventListener("change", (e) => {
      this.globalConfig.preferredDeviceId = e.target.value;
      this.cameraManager.startCamera(this.globalConfig.preferredDeviceId);
      this.saveCurrentReticleConfig();
    });

    // 5. デジタルズーム
    this.dom.sliderZoom.addEventListener("input", (e) => {
      const zoom = parseFloat(e.target.value);
      this.globalConfig.zoomLevel = zoom;
      this.dom.valZoom.textContent = `${zoom.toFixed(1)}x`;
      this.cameraManager.setZoom(zoom);
      this.saveCurrentReticleConfig();
    });

    // 6. レティクル調整（透明度、明るさ、スケール）
    const getActiveConf = () => this.reticleConfigs[this.globalConfig.activeReticle];

    this.dom.sliderOpacity.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      getActiveConf().reticleOpacity = val;
      this.dom.valOpacity.textContent = `${Math.round(val * 100)}%`;
      this.refresh();
    });

    this.dom.sliderBrightness.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      getActiveConf().reticleBrightness = val;
      this.dom.valBrightness.textContent = `${val.toFixed(1)}x`;
      this.refresh();
    });

    this.dom.sliderScale.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      getActiveConf().scale = val;
      this.dom.valScale.textContent = `${val.toFixed(2)}x`;
      this.refresh();
    });

    // 7. カラー選択
    this.dom.colorOptions.forEach(opt => {
      opt.addEventListener("click", () => {
        getActiveConf().reticleColor = opt.dataset.color;
        this.updateUIFromCurrentConfig();
      });
    });

    // 8. キャリブレーション方向キー (D-Pad)
    const step = 2; // 移動ステップ(px)
    this.dom.dpadUp.addEventListener("click", () => {
      getActiveConf().offsetY -= step;
      this.updateOffsetUI();
    });
    this.dom.dpadDown.addEventListener("click", () => {
      getActiveConf().offsetY += step;
      this.updateOffsetUI();
    });
    this.dom.dpadLeft.addEventListener("click", () => {
      getActiveConf().offsetX -= step;
      this.updateOffsetUI();
    });
    this.dom.dpadRight.addEventListener("click", () => {
      getActiveConf().offsetX += step;
      this.updateOffsetUI();
    });

    // 9. キャリブレーションリセット
    this.dom.btnResetCalib.addEventListener("click", () => {
      const activeId = this.globalConfig.activeReticle;
      this.reticleConfigs[activeId] = { ...DEFAULT_RETICLE_CONFIG };
      this.updateUIFromCurrentConfig();
    });

    // 10. Replica View
    this.dom.toggleReplica.addEventListener("change", (e) => {
      this.globalConfig.replicaViewEnabled = e.target.checked;
      this.dom.replicaControlsGroup.style.display = e.target.checked ? "flex" : "none";
      this.refresh();
    });

    this.dom.sliderReplicaRadius.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      this.globalConfig.replicaRadiusRatio = val;
      this.dom.valReplicaRadius.textContent = `${Math.round(val * 100)}%`;
      this.refresh();
    });

    this.dom.sliderReplicaVignette.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      this.globalConfig.replicaVignette = val;
      this.dom.valReplicaVignette.textContent = `${Math.round(val * 100)}%`;
      this.refresh();
    });

    // 11. Museum Mode
    this.dom.toggleMuseum.addEventListener("change", (e) => {
      this.globalConfig.museumMode = e.target.checked;
      if (e.target.checked) {
        document.body.classList.add("museum-mode");
      } else {
        document.body.classList.remove("museum-mode");
      }
      this.saveCurrentReticleConfig();
    });

    // 12. フルスクリーン
    this.dom.btnFullscreen.addEventListener("click", () => {
      this.toggleFullscreen();
    });

    // 画面の回転・リサイズ監視
    window.addEventListener("resize", () => {
      this.renderer.handleResize();
      this.refresh();
    });
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        this.renderer.handleResize();
        this.refresh();
      }, 300);
    });
  }

  updateOffsetUI() {
    const conf = this.reticleConfigs[this.globalConfig.activeReticle];
    this.dom.valOffset.textContent = `X:${conf.offsetX} Y:${conf.offsetY}`;
    this.refresh();
  }

  /**
   * カメラ起動ハンドラー
   */
  async handleStartCamera() {
    this.dom.startModal.style.display = "none";
    this.dom.errorModal.style.display = "none";

    const result = await this.cameraManager.startCamera(this.globalConfig.preferredDeviceId);
    if (!result.success) {
      this.dom.errorMessage.textContent = result.error;
      this.dom.errorModal.style.display = "flex";
    } else {
      await this.populateCameraList();
      this.cameraManager.setZoom(this.globalConfig.zoomLevel);
    }
  }

  /**
   * カメラ選択肢の生成
   */
  async populateCameraList() {
    const devices = await this.cameraManager.updateDeviceList();
    this.dom.selectCamera.innerHTML = "";

    if (devices.length === 0) {
      const opt = document.createElement("option");
      opt.textContent = "デフォルトカメラ";
      opt.value = "";
      this.dom.selectCamera.appendChild(opt);
      return;
    }

    devices.forEach((dev, index) => {
      const opt = document.createElement("option");
      opt.value = dev.deviceId;
      opt.textContent = dev.label || `カメラ ${index + 1} (${dev.deviceId.slice(0, 5)}...)`;
      if (dev.deviceId === this.cameraManager.selectedDeviceId) {
        opt.selected = true;
      }
      this.dom.selectCamera.appendChild(opt);
    });
  }

  /**
   * フルスクリーン切り替え
   */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn("フルスクリーンエラー:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
}

// アプリの起動
window.addEventListener("DOMContentLoaded", () => {
  window.appInstance = new App();
});
