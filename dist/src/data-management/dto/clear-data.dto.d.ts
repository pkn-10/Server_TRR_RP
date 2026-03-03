export declare class ClearDataDto {
    types: string[];
    exportFirst: boolean;
}
export declare class ExportDataDto {
    types: string[];
}
export interface DataTypeInfo {
    key: string;
    label: string;
    icon: string;
    count: number;
    description: string;
}
