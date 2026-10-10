import { columnSizingFeature, tableFeatures } from "@tanstack/react-table";

// DataTable で使用する機能のみ登録(ソート・フィルタ等は未登録)
export const dataTableFeatures = tableFeatures({ columnSizingFeature });

export type DataTableFeatures = typeof dataTableFeatures;
