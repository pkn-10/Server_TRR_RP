import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { DataTypeInfo } from './dto/clear-data.dto';
export type DataType = 'repairs' | 'loans' | 'notifications' | 'stock' | 'departments';
export declare class DataManagementService {
    private prisma;
    private cloudinary;
    private readonly logger;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    private readonly dataTypeDefinitions;
    getDataTypes(): Promise<DataTypeInfo[]>;
    private getDataCounts;
    exportToExcel(types: DataType[]): Promise<{
        buffer: Buffer;
        fileName: string;
        mimeType: string;
    }>;
    private addSheetForType;
    private addRepairsSheet;
    private addLoansSheet;
    private addNotificationsSheet;
    private addStockSheet;
    private addDepartmentsSheet;
    private styleHeaderRow;
    clearData(types: DataType[]): Promise<{
        success: boolean;
        deleted: Record<string, number>;
    }>;
}
