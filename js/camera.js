/**
 * カメラ制御モジュール (CameraManager)
 * 
 * - getUserMedia による背面カメラ優先起動
 * - 左右非反転でのフルスクリーンリアルタイム描画
 * - カメラデバイスの列挙と切り替え
 * - デジタルズーム制御 (MediaStreamTrack.applyConstraints & CSS transform fallback)
 * - 完全端末内処理（プライバシー保護、録画・送信なし）
 */

export class CameraManager {
  constructor(videoElement, containerElement) {
    this.video = videoElement;
    this.container = containerElement;
    this.stream = null;
    this.currentTrack = null;
    this.availableDevices = [];
    this.selectedDeviceId = null;
    this.zoomLevel = 1.0;
    this.supportsHardwareZoom = false;
    this.zoomCapabilities = null;
  }

  /**
   * カメラデバイス一覧を取得
   */
  async updateDeviceList() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return [];
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableDevices = devices.filter(d => d.kind === "videoinput");
      return this.availableDevices;
    } catch (err) {
      console.warn("デバイス一覧の取得に失敗しました:", err);
      return [];
    }
  }

  /**
   * カメラを起動
   * @param {string|null} preferredDeviceId 特定のカメラID（省略時は背面カメラ優先）
   */
  async startCamera(preferredDeviceId = null) {
    this.stopCamera();

    const constraints = {
      audio: false,
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    };

    if (preferredDeviceId) {
      constraints.video.deviceId = { exact: preferredDeviceId };
    } else {
      // 背面カメラを優先 (environment)
      constraints.video.facingMode = { ideal: "environment" };
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;
      await this.video.play();

      const videoTracks = this.stream.getVideoTracks();
      if (videoTracks.length > 0) {
        this.currentTrack = videoTracks[0];
        this.selectedDeviceId = this.currentTrack.getSettings().deviceId || preferredDeviceId;

        // ハードウェアズーム対応チェック
        if (typeof this.currentTrack.getCapabilities === "function") {
          const caps = this.currentTrack.getCapabilities();
          if (caps.zoom) {
            this.supportsHardwareZoom = true;
            this.zoomCapabilities = caps.zoom;
          }
        }
      }

      // デバイス一覧を更新
      await this.updateDeviceList();

      // 現在のズーム値を再適用
      this.setZoom(this.zoomLevel);

      return { success: true };
    } catch (error) {
      console.error("カメラ起動エラー:", error);
      let errorMsg = "カメラへのアクセスに失敗しました。";
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMsg = "カメラのアクセス権限が拒否されています。ブラウザの設定でカメラへのアクセスを許可してください。";
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        errorMsg = "利用可能なカメラが見つかりませんでした。";
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        errorMsg = "カメラが他のアプリで使用されているか、ハードウェアエラーが発生しています。";
      }
      return { success: false, error: errorMsg, rawError: error };
    }
  }

  /**
   * カメラを停止
   */
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.currentTrack = null;
    this.video.srcObject = null;
  }

  /**
   * ズーム倍率を設定 (1.0x 〜 5.0x)
   * @param {number} level ズーム倍率
   */
  async setZoom(level) {
    this.zoomLevel = Math.max(1.0, Math.min(5.0, level));

    // ハードウェアズームが利用可能な場合
    if (this.supportsHardwareZoom && this.currentTrack && this.zoomCapabilities) {
      const min = this.zoomCapabilities.min || 1;
      const max = this.zoomCapabilities.max || 5;
      const targetZoom = Math.min(max, Math.max(min, this.zoomLevel));
      try {
        await this.currentTrack.applyConstraints({
          advanced: [{ zoom: targetZoom }]
        });
        // ハードウェアズームが効いた場合はCSS拡大をリセット
        this.video.style.transform = "scale(1)";
        return;
      } catch (e) {
        console.warn("ハードウェアズーム適用失敗、CSSズームへフォールバック:", e);
      }
    }

    // 未対応（iOS Safari等）または失敗時のCSSズーム
    // 左右反転は行わない (背面映像)
    this.video.style.transform = `scale(${this.zoomLevel})`;
  }

  getZoom() {
    return this.zoomLevel;
  }
}
