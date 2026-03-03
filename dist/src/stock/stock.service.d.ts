import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class StockService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        category: string | null;
        code: string;
        quantity: number;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        category: string | null;
        code: string;
        quantity: number;
    } | null>;
    create(data: Prisma.StockItemCreateInput): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        category: string | null;
        code: string;
        quantity: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        category: string | null;
        code: string;
        quantity: number;
    }>;
}
