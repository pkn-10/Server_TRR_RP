import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LineOAuthService } from './line-oauth.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private lineOAuth;
    private cloudinary;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, lineOAuth: LineOAuthService, cloudinary: CloudinaryService);
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
    lineCallback(code: string, state?: string): Promise<{
        access_token: string;
        userId: number;
        role: import(".prisma/client").$Enums.Role;
        message: string;
    }>;
    getProfile(userId: number): Promise<{
        id: number;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        phoneNumber: string | null;
        profilePicture: string | null;
        createdAt: Date;
    }>;
    updateProfile(userId: number, data: {
        name?: string;
        phoneNumber?: string;
    }): Promise<{
        id: number;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        phoneNumber: string | null;
        profilePicture: string | null;
        createdAt: Date;
    }>;
    uploadProfilePicture(userId: number, file: Express.Multer.File): Promise<{
        id: number;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        phoneNumber: string | null;
        profilePicture: string | null;
        createdAt: Date;
    }>;
    getLineUserIdFromCode(code: string): Promise<string>;
}
