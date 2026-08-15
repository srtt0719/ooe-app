// 素材・仕上げの選択肢は settings テーブルで管理する(@/lib/settings)。

export const SITE_STATUS = ["進行中", "保留", "完了"] as const;
export const MATERIAL_STATUS = ["未発注", "発注済", "入荷済"] as const;
export const SURFACE_TYPE = ["自社", "外注"] as const;
export const PRODUCT_STATUS = ["未着手", "製作中", "完了", "出荷済"] as const;

export const DAYS_BEFORE_NEAR = 3;
