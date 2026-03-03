"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const line_oauth_service_1 = require("./line-oauth.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    lineOAuth;
    cloudinary;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService, lineOAuth, cloudinary) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.lineOAuth = lineOAuth;
        this.cloudinary = cloudinary;
    }
    async register(dto) {
        const hash = await bcrypt.hash(dto.password, 10);
        try {
            const user = await this.prisma.user.create({
                data: {
                    name: dto.name,
                    email: dto.email,
                    password: hash,
                    role: 'USER',
                    department: dto.department,
                    phoneNumber: dto.phoneNumber,
                    lineId: dto.lineId,
                },
            });
            return {
                message: 'Register success',
                userId: user.id,
                role: user.role,
            };
        }
        catch (error) {
            if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
                throw new common_1.BadRequestException('Email already exists');
            }
            throw error;
        }
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Email or password incorrect');
        }
        const isMatch = await bcrypt.compare(dto.password, user.password);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Email or password incorrect');
        }
        const payload = {
            sub: user.id,
            role: user.role,
        };
        return {
            access_token: this.jwtService.sign(payload),
            userId: user.id,
            role: user.role,
            message: 'Login success',
        };
    }
    getLineAuthUrl() {
        return this.lineOAuth.generateAuthUrl();
    }
    async lineCallback(code, state) {
        if (!code) {
            console.error('[LINE Auth] No authorization code provided');
            throw new common_1.BadRequestException('Authorization code is required');
        }
        this.logger.log('[LINE Auth] Processing callback');
        try {
            const tokenResponse = await this.lineOAuth.exchangeCodeForToken(code);
            const lineAccessToken = tokenResponse.access_token;
            const lineUserId = tokenResponse.user_id;
            let user = await this.prisma.user.findFirst({
                where: {
                    lineOALink: {
                        lineUserId: lineUserId,
                    },
                },
            });
            if (!user) {
                const lineProfile = await this.lineOAuth.getUserProfile(lineAccessToken);
                user = await this.prisma.user.create({
                    data: {
                        name: lineProfile.displayName || 'LINE User',
                        email: `line_${lineUserId}@line.com`,
                        password: await bcrypt.hash(Math.random().toString(36), 10),
                        role: 'USER',
                        lineId: lineUserId,
                        lineOALink: {
                            create: {
                                lineUserId: lineUserId,
                                status: 'VERIFIED',
                            },
                        },
                    },
                });
                this.logger.log(`[LINE Auth] New user created: ${user.id}`);
            }
            else {
                if (!user.lineId) {
                    user = await this.prisma.user.update({
                        where: { id: user.id },
                        data: {
                            lineId: lineUserId,
                        },
                    });
                }
            }
            const payload = {
                sub: user.id,
                role: user.role,
            };
            const result = {
                access_token: this.jwtService.sign(payload),
                userId: user.id,
                role: user.role,
                message: 'LOGIN success via LINE',
            };
            this.logger.log(`[LINE Auth] Authentication successful for user ${user.id}`);
            return result;
        }
        catch (error) {
            this.logger.error('[LINE Auth] Callback error:', error.message);
            throw error;
        }
    }
    async getProfile(userId) {
        try {
            if (!userId || typeof userId !== 'number') {
                throw new common_1.BadRequestException('Invalid user ID');
            }
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    department: true,
                    phoneNumber: true,
                    lineId: true,
                    profilePicture: true,
                    createdAt: true,
                },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            return user;
        }
        catch (error) {
            this.logger.error('Error in getProfile:', error.message);
            throw error;
        }
    }
    async updateProfile(userId, data) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.department && { department: data.department }),
                ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
                ...(data.lineId && { lineId: data.lineId }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                phoneNumber: true,
                lineId: true,
                profilePicture: true,
                createdAt: true,
            },
        });
        return user;
    }
    async uploadProfilePicture(userId, file) {
        const currentUser = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { profilePictureId: true },
        });
        if (currentUser?.profilePictureId) {
            try {
                await this.cloudinary.deleteFile(currentUser.profilePictureId);
            }
            catch (error) {
                console.error('Error deleting old profile picture:', error);
            }
        }
        const uploadResult = await this.cloudinary.uploadFile(file.buffer, file.originalname, 'profile-pictures');
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                profilePicture: uploadResult.url,
                profilePictureId: uploadResult.publicId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                phoneNumber: true,
                lineId: true,
                profilePicture: true,
                createdAt: true,
            },
        });
        return user;
    }
    async getLineUserIdFromCode(code) {
        const tokenResponse = await this.lineOAuth.exchangeCodeForToken(code);
        if (!tokenResponse.user_id) {
            const profile = await this.lineOAuth.getUserProfile(tokenResponse.access_token);
            return profile.userId;
        }
        return tokenResponse.user_id;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        line_oauth_service_1.LineOAuthService,
        cloudinary_service_1.CloudinaryService])
], AuthService);
//# sourceMappingURL=auth.service.js.map