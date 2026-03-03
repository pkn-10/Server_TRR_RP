import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getAllUsers(page?: string, limit?: string, roles?: string): Promise<{
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
    getUserById(id: string): Promise<{
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
    updateUser(id: string, data: any): Promise<{
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
