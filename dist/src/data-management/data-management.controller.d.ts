import type { Response } from 'express';
import { DataManagementService } from './data-management.service';
import { ClearDataDto, ExportDataDto } from './dto/clear-data.dto';
export declare class DataManagementController {
    private readonly dataManagementService;
    constructor(dataManagementService: DataManagementService);
    getDataTypes(): Promise<import("./dto/clear-data.dto").DataTypeInfo[]>;
    exportData(dto: ExportDataDto, res: Response): Promise<Response<any, Record<string, any>>>;
    clearData(dto: ClearDataDto, res: Response): Promise<Response<any, Record<string, any>>>;
}
