import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        message: string;
        userId: number;
        role: import(".prisma/client").$Enums.Role;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        userId: number;
        role: import(".prisma/client").$Enums.Role;
        message: string;
    }>;
    getLineAuthUrl(): import("./line-oauth.service").LineAuthUrlResponse;
    lineCallback(dto: {
        code: string;
        state?: string;
    }): Promise<{
        access_token: string;
        userId: number;
        role: import(".prisma/client").$Enums.Role;
        message: string;
    }>;
    getProfile(req: any): Promise<{
        id: number;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        department: string | null;
        phoneNumber: string | null;
        lineId: string | null;
        profilePicture: string | null;
        createdAt: Date;
    }>;
    updateProfile(req: any, data: {
        name?: string;
        department?: string;
        phoneNumber?: string;
        lineId?: string;
    }): Promise<{
        id: number;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        department: string | null;
        phoneNumber: string | null;
        lineId: string | null;
        profilePicture: string | null;
        createdAt: Date;
    }>;
    uploadProfilePicture(req: any, file: Express.Multer.File): Promise<{
        id: number;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        department: string | null;
        phoneNumber: string | null;
        lineId: string | null;
        profilePicture: string | null;
        createdAt: Date;
    }>;
    verifyLineCode(body: {
        code: string;
    }): Promise<{
        lineUserId: string;
    }>;
}
