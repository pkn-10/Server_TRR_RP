import { LoansService } from './loans.service';
export declare class LoansController {
    private loansService;
    constructor(loansService: LoansService);
    create(body: any, req: any): Promise<{
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
    findAllForAdmin(req: any): Promise<({
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
    findAll(req: any): Promise<({
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
    findOne(id: string): Promise<({
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
    update(id: string, body: any): Promise<{
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
    delete(id: string): Promise<{
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
