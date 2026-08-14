// プルダウンの選択肢。フェーズ4の設定画面でマスタ編集できるようにするまでの暫定値。
export const MATERIAL_OPTIONS = ["SS400", "SUS304", "SPCC", "アルミ", "その他"];
export const FINISH_OPTIONS = [
  "溶融亜鉛めっき",
  "焼付塗装",
  "生地",
  "研磨（ヘアライン）",
  "その他",
];

export const SITE_STATUS = ["進行中", "保留", "完了"] as const;
export const MATERIAL_STATUS = ["未発注", "発注済", "入荷済"] as const;
export const SURFACE_TYPE = ["自社", "外注"] as const;
export const PRODUCT_STATUS = ["未着手", "製作中", "完了", "出荷済"] as const;

export const DAYS_BEFORE_NEAR = 3;
