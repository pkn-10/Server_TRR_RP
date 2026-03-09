import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllUsers(page?: number, limit?: number, roles?: string): Promise<{
        data: any[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getITStaff(): Promise<any[]>;
    getUserById(id: number): Promise<any>;
    updateUser(id: number, data: any): Promise<any>;
    deleteUser(id: number): Promise<{
        id: number;
        name: string;
        email: string;
    }>;
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
    changePassword(id: number, newPassword: string): Promise<{
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
    getOrCreateUserFromLine(lineUserId: string, displayName?: string, pictureUrl?: string): Promise<{
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
    getOrCreateGuestUser(): Promise<{
        id: number;
        name: string;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        department: string | null;
        phoneNumber: string | null;
        lineId: string | null;
        profilePicture: string | null;
        profilePictureId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private mapUserLineInfo;
}
