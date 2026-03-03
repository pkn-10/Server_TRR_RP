import { PrismaService } from '../prisma/prisma.service';
export declare class LoansService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        itemName?: string;
        description?: string;
        quantity: number;
        expectedReturnDate?: string;
        userId: number;
        borrowerName?: string;
        borrowerDepartment?: string;
        borrowerPhone?: string;
        borrowerLineId?: string;
    }): Promise<{
        borrowedBy: {
            id: number;
            name: string;
            email: string;
            department: string | null;
            phoneNumber: string | null;
            lineId: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.LoanStatus;
        userId: number;
        itemName: string | null;
        quantity: number;
        borrowDate: Date;
        expectedReturnDate: Date | null;
        returnDate: Date | null;
        borrowerName: string | null;
        borrowerDepartment: string | null;
        borrowerPhone: string | null;
        borrowerLineId: string | null;
    }>;
    findAll(userId?: number | null): Promise<({
        borrowedBy: {
            id: number;
            name: string;
            email: string;
            department: string | null;
            phoneNumber: string | null;
            lineId: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.LoanStatus;
        userId: number;
        itemName: string | null;
        quantity: number;
        borrowDate: Date;
        expectedReturnDate: Date | null;
        returnDate: Date | null;
        borrowerName: string | null;
        borrowerDepartment: string | null;
        borrowerPhone: string | null;
        borrowerLineId: string | null;
    })[]>;
    findOne(id: number): Promise<({
        borrowedBy: {
            id: number;
            name: string;
            email: string;
            department: string | null;
            phoneNumber: string | null;
            lineId: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.LoanStatus;
        userId: number;
        itemName: string | null;
        quantity: number;
        borrowDate: Date;
        expectedReturnDate: Date | null;
        returnDate: Date | null;
        borrowerName: string | null;
        borrowerDepartment: string | null;
        borrowerPhone: string | null;
        borrowerLineId: string | null;
    }) | null>;
    update(id: number, data: {
        status?: string;
        returnDate?: string;
        itemName?: string;
        description?: string;
        quantity?: number;
        expectedReturnDate?: string;
        borrowerName?: string;
        borrowerDepartment?: string;
        borrowerPhone?: string;
        borrowerLineId?: string;
    }): Promise<{
        borrowedBy: {
            id: number;
            name: string;
            email: string;
            department: string | null;
            phoneNumber: string | null;
            lineId: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.LoanStatus;
        userId: number;
        itemName: string | null;
        quantity: number;
        borrowDate: Date;
        expectedReturnDate: Date | null;
        returnDate: Date | null;
        borrowerName: string | null;
        borrowerDepartment: string | null;
        borrowerPhone: string | null;
        borrowerLineId: string | null;
    }>;
    checkOverdue(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.LoanStatus;
        userId: number;
        itemName: string | null;
        quantity: number;
        borrowDate: Date;
        expectedReturnDate: Date | null;
        returnDate: Date | null;
        borrowerName: string | null;
        borrowerDepartment: string | null;
        borrowerPhone: string | null;
        borrowerLineId: string | null;
    }[]>;
    delete(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.LoanStatus;
        userId: number;
        itemName: string | null;
        quantity: number;
        borrowDate: Date;
        expectedReturnDate: Date | null;
        returnDate: Date | null;
        borrowerName: string | null;
        borrowerDepartment: string | null;
        borrowerPhone: string | null;
        borrowerLineId: string | null;
    }>;
}
