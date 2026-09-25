/**
 * ドイツ戦車照準器 歴史資料データ (Historical Approximation)
 * 
 * 照準器の史料に基づく諸元および解説データ。
 * ※本アプリは歴史学習・展示・レプリカ鑑賞用途であり、
 * 現存資料に差異がある場合は「史料に基づく近似 (Historical approximation)」としています。
 */

export const HISTORICAL_DATA = {
  tzf9b: {
    id: "tzf9b",
    name: "TZF 9b",
    fullGermanName: "Turmzielfernrohr 9b",
    tankName: "Tiger I (Panzerkampfwagen VI Ausf. E 初期〜中期型)",
    mainGun: "8.8 cm KwK 36 L/56",
    manufacturer: "Carl Zeiss Jena (カール・ツァイス)",
    opticalType: "双眼望遠式 (Binocular, 照準レティクルは右眼側)",
    magnification: "2.5x",
    fieldOfView: "25° (約437m / 1000m)",
    reticleFeatures: [
      "中央の主照準三角標 (Hauptstachel: 底辺4ミル・高さ4ミル)",
      "左右の補助照準三角標 (Nebenstachel: 2ミル×2ミル、頂点間隔4ミル)",
      "Strich (ミル) 単位による見越し角および距離算定",
      "Pzgr. 39 (徹甲榴弾: 0〜4,000m) 距離スケール円弧",
      "Sprgr. (榴弾: 0〜4,000m) および MG 34 用距離スケール"
    ],
    description: `タイガーI戦車の初期型から中期型にかけて搭載された双眼鏡式照準器。
砲塔防盾に2つの覗き窓があるのが外見上の大きな特徴です。
右側の望遠鏡内に精密な目盛りが刻印されたガラスレティクルがあり、左側は視界確保用の簡略レティクル（または補助視野）となっていました。
中央の大きな三角標（Hauptstachel）の頂点を目標の中心に合わせ、左右の小三角（4ミル間隔）を使って移動目標の見越し射撃やミル計測による目標距離の推定を行いました。
※後期型タイガーIでは生産簡略化のため単眼式のTZF 9cへ更新されました。`,
    disclaimer: "現存する実物写真・図面・ドイツ軍教本(H.Dv.)に基づく近似再現です。"
  },

  tzf9d: {
    id: "tzf9d",
    name: "TZF 9d",
    fullGermanName: "Turmzielfernrohr 9d",
    tankName: "Tiger II (Panzerkampfwagen VI Ausf. B 'キングタイガー')",
    mainGun: "8.8 cm KwK 43 L/71",
    manufacturer: "Carl Zeiss Jena / Leitz",
    opticalType: "単眼関節式 (Monocular articulated)",
    magnification: "2.5x / 5x (2段階可変倍率)",
    fieldOfView: "28° (2.5x時) / 14° (5x時)",
    reticleFeatures: [
      "長砲身KwK 43の高初速（初速1,000m/s超）に対応したフラットな弾道目盛り",
      "中央主三角標 (Hauptstachel) および 左右各3個の補助三角標 (4ミル間隔)",
      "Pzgr. 39/43 (APC-HE: 0〜4,000m) 距離目盛り",
      "Pzgr. 40/43 (APCR 高速徹甲弾: 0〜3,000m) 距離目盛り",
      "Sprgr. 43 (榴弾: 0〜5,000m) 距離目盛り"
    ],
    description: `ティーガーIIに搭載された長砲身71口径8.8cm戦車砲用の単眼関節式照準器。
砲の仰俯角に合わせて接眼部が固定され、砲手は無理のない姿勢で照準が可能でした。
索敵・近距離用の低倍率（2.5倍・広視野28度）と、長距離精密射撃用の高倍率（5倍・視野14度）を光学的に切り替え可能でした。
高初速砲のため弾道落差が小さく、長距離まで高密度かつ平坦なレンジスケールが特徴です。`,
    disclaimer: "可変倍率機構および当時の刻印資料に基づく近似再現です。"
  },

  tzf12a: {
    id: "tzf12a",
    name: "TZF 12a",
    fullGermanName: "Turmzielfernrohr 12a",
    tankName: "Panther (Panzerkampfwagen V Ausf. A / G)",
    mainGun: "7.5 cm KwK 42 L/70",
    manufacturer: "Carl Zeiss / Leitz",
    opticalType: "単眼関節式望遠鏡 (Monocular articulated)",
    magnification: "2.5x / 5x (2段階可変倍率)",
    fieldOfView: "28° (2.5x時) / 14° (5x時)",
    reticleFeatures: [
      "左右に計7個配置された特徴的な三角照準標 (Stachel)",
      "外周の回転式レンジリング連動の弾種別距離目盛り",
      "Pzgr. 39/42 (徹甲弾: 0〜3,000m)",
      "Pzgr. 40/42 (高初速徹甲弾: 0〜2,000m)",
      "Sprgr. 42 (榴弾: 0〜4,000m) および MG 34 (0〜2,000m)"
    ],
    description: `パンター戦車の中・後期型（Ausf. A および G）に標準装備された代表的な照準器。
初期のAusf. Dに搭載されていた双眼式のTZF 12から改良され、防盾開口部を1つにした単眼関節式となりました。
水平線上に並んだ7つの三角形は、目標の移動速度に応じたリード（見越し角）を瞬時に取るために4ミル（Strich）等間隔で配置されています。
70口径の超高初速7.5cm砲との組み合わせにより、大戦最優秀クラスの射撃命中精度を誇りました。`,
    disclaimer: "現存するパンター照準器マニュアルおよび展示光学系に基づく近似再現です。"
  },

  tzf5b: {
    id: "tzf5b",
    name: "TZF 5b",
    fullGermanName: "Turmzielfernrohr 5b",
    tankName: "Panzer IV (Panzerkampfwagen IV Ausf. A〜F型)",
    mainGun: "7.5 cm KwK 37 L/24 (短砲身)",
    manufacturer: "Ernst Leitz Wetzlar (ライツ)",
    opticalType: "単眼関節式望遠鏡 (Monocular articulated)",
    magnification: "約2.4x 〜 2.5x",
    fieldOfView: "約23.5° 〜 24°",
    reticleFeatures: [
      "短砲身低初速砲特有の大きな弾道落差に対応した距離目盛り",
      "中央主三角標および左右補助三角標",
      "K.Gr.rot Pz. (徹甲弾) / Gr. 38 (成型炸薬弾・HEAT) 用目盛り",
      "Sprgr. (榴弾: 曲射用) および 同軸MG 34用目盛り"
    ],
    description: `IV号戦車の初期〜中期の支援戦車時代（短砲身7.5cm KwK 37 L/24搭載車）に用いられた照準器。
歩兵支援を目的とした大口径短砲身砲は初速が低く（約385m/s〜420m/s）、弾道が虹を描くように大きく落下するため、照準器の距離目盛りの間隔が距離に応じて急激に広がるのが特徴です。
ライツ社等により製造された堅牢な関節式構造を持ちます。`,
    disclaimer: "短砲身KwK 37用光学諸元およびマニュアル資料に基づく近似再現です。"
  }
};
