import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllUsers(page?: number, limit?: number, roles?: string): Promise<{
        data: {
            lineUserId: string | null;
            displayName: string | null | undefined;
            pictureUrl: string | null | undefined;
            id: number;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            department: string | null;
            phoneNumber: string | null;
            lineId: string | null;
            profilePicture: string | null;
            createdAt: Date;
            updatedAt: Date;
            lineOALink: {
                displayName: string | null;
                pictureUrl: string | null;
                lineUserId: string | null;
            } | null;
            _count: {
                assigned: number;
                tickets: number;
            };
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getITStaff(): Promise<{
        lineUserId: string | null;
        displayName: string | null | undefined;
        pictureUrl: string | null | undefined;
        id: number;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        department: string | null;
        phoneNumber: string | null;
        lineId: string | null;
        profilePicture: string | null;
        lineOALink: {
            displayName: string | null;
            pictureUrl: string | null;
            lineUserId: string | null;
        } | null;
    }[]>;
    getUserById(id: number): Promise<{
        lineUserId: string | null;
        displayName: string | null | undefined;
        pictureUrl: string | null | undefined;
        id: number;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        department: string | null;
        phoneNumber: string | null;
        lineId: string | null;
        profilePicture: string | null;
        createdAt: Date;
        updatedAt: Date;
        lineOALink: {
            displayName: string | null;
            pictureUrl: string | null;
            lineUserId: string | null;
        } | null;
        _count: {
            assigned: number;
            tickets: number;
        };
    }>;
    updateUser(id: number, data: any): Promise<{
        lineUserId: string | null;
        displayName: string | null | undefined;
        pictureUrl: string | null | undefined;
        id: number;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        department: string | null;
        phoneNumber: string | null;
        lineId: string | null;
        profilePicture: string | null;
        createdAt: Date;
        updatedAt: Date;
        lineOALink: {
            displayName: string | null;
            pictureUrl: string | null;
            lineUserId: string | null;
        } | null;
    }>;
    deleteUser(id: number): Promise<{
        id: number;
        name: string;
        email: string;
    }>;
    searchUsers(query: string): Promise<{
        lineUserId: string | null;
        displayName: string | null | undefined;
        pictureUrl: string | null | undefined;
        id: number;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        department: string | null;
        phoneNumber: string | null;
        lineId: string | null;
        profilePicture: string | null;
        createdAt: Date;
        updatedAt: Date;
        lineOALink: {
            displayName: string | null;
            pictureUrl: string | null;
            lineUserId: string | null;
        } | null;
    }[]>;
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
}
