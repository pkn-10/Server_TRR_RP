import { StockService } from './stock.service';
export declare class StockController {
    private readonly stockService;
    constructor(stockService: StockService);
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
    create(data: any): Promise<{
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
