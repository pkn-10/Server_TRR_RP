import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
interface StockImportItem {
    code: string;
    name: string;
    category?: string;
    quantity: number;
}
export declare class StockService {
    private prisma;
    constructor(prisma: PrismaService);
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
    create(data: Prisma.StockItemCreateInput): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        quantity: number;
        category: string | null;
    }>;
    update(id: number, data: Prisma.StockItemUpdateInput): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        quantity: number;
        category: string | null;
    }>;
    withdraw(id: number, quantity: number, reference?: string, note?: string, userId?: number): Promise<{
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
    addStock(id: number, quantity: number, reference?: string, note?: string, userId?: number): Promise<{
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
    findTransactions(stockItemId?: number): Promise<({
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
    remove(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        quantity: number;
        category: string | null;
    }>;
    deleteCategory(name: string): Promise<Prisma.BatchPayload>;
    bulkImport(items: StockImportItem[]): Promise<{
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
export {};
