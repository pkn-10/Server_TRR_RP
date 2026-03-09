import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { WithdrawStockDto } from './dto/withdraw-stock.dto';
import { AddStockDto } from './dto/add-stock.dto';
import { BulkImportStockDto } from './dto/bulk-import-stock.dto';
export declare class StockController {
    private readonly stockService;
    constructor(stockService: StockService);
    findAll(): Promise<({
        _count: {
            transactions: number;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        quantity: number;
        category: string | null;
    })[]>;
    getTransactions(stockItemId?: string): Promise<({
        stockItem: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            quantity: number;
            category: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        userId: number | null;
        type: import(".prisma/client").$Enums.TransactionType;
        quantity: number;
        note: string | null;
        previousQty: number;
        newQty: number;
        reference: string | null;
        stockItemId: number;
    })[]>;
    findOne(id: number): Promise<{
        transactions: {
            id: number;
            createdAt: Date;
            userId: number | null;
            type: import(".prisma/client").$Enums.TransactionType;
            quantity: number;
            note: string | null;
            previousQty: number;
            newQty: number;
            reference: string | null;
            stockItemId: number;
        }[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        quantity: number;
        category: string | null;
    }>;
    create(createStockDto: CreateStockDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        quantity: number;
        category: string | null;
    }>;
    update(id: number, updateStockDto: UpdateStockDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        quantity: number;
        category: string | null;
    }>;
    withdraw(id: number, withdrawDto: WithdrawStockDto): Promise<{
        id: number;
        createdAt: Date;
        userId: number | null;
        type: import(".prisma/client").$Enums.TransactionType;
        quantity: number;
        note: string | null;
        previousQty: number;
        newQty: number;
        reference: string | null;
        stockItemId: number;
    }>;
    addStock(id: number, addStockDto: AddStockDto): Promise<{
        id: number;
        createdAt: Date;
        userId: number | null;
        type: import(".prisma/client").$Enums.TransactionType;
        quantity: number;
        note: string | null;
        previousQty: number;
        newQty: number;
        reference: string | null;
        stockItemId: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        quantity: number;
        category: string | null;
    }>;
    deleteCategory(name: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    bulkImport(bulkImportDto: BulkImportStockDto): Promise<{
        created: number;
        updated: number;
        total: number;
        errors: {
            code: string;
            name: string;
            error: string;
            category: string;
        }[];
    }>;
}
