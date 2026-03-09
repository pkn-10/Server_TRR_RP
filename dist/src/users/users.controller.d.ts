import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getAllUsers(page?: string, limit?: string, roles?: string): Promise<{
        data: any[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getITStaff(): Promise<any[]>;
    searchUsers(query: string): Promise<any[]>;
    createUser(data: any): Promise<{
        id: number;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        department: string | null;
        phoneNumber: string | null;
        lineId: string | null;
        createdAt: Date;
    }>;
    getUserById(id: string): Promise<any>;
    updateUser(id: string, data: any): Promise<any>;
    changePassword(id: string, body: {
        newPassword: string;
    }): Promise<{
        id: number;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        department: string | null;
        phoneNumber: string | null;
        lineId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteUser(id: string): Promise<{
        id: number;
        name: string;
        email: string;
    }>;
}
