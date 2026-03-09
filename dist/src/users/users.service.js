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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllUsers(page = 1, limit = 10, roles) {
        const skip = (page - 1) * limit;
        const where = {};
        if (roles) {
            const rolesArray = roles.split(',').map(r => r.trim());
            where.role = { in: rolesArray };
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    department: true,
                    phoneNumber: true,
                    lineId: true,
                    lineOALink: {
                        select: {
                            lineUserId: true,
                            displayName: true,
                            pictureUrl: true,
                        }
                    },
                    profilePicture: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            repairTickets: true,
                            repairAssignments: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        const mappedUsers = users.map(user => this.mapUserLineInfo(user));
        return {
            data: mappedUsers,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getITStaff() {
        return this.prisma.user.findMany({
            where: {
                role: {
                    in: ['IT', 'ADMIN']
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                phoneNumber: true,
                lineId: true,
                lineOALink: {
                    select: {
                        lineUserId: true,
                        displayName: true,
                        pictureUrl: true
                    }
                },
                profilePicture: true,
            },
            orderBy: {
                name: 'asc'
            }
        }).then(users => users.map(user => this.mapUserLineInfo(user)));
    }
    async getUserById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                phoneNumber: true,
                lineId: true,
                lineOALink: {
                    select: {
                        lineUserId: true,
                        displayName: true,
                        pictureUrl: true,
                    }
                },
                profilePicture: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        repairTickets: true,
                        repairAssignments: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return this.mapUserLineInfo(user);
    }
    async updateUser(id, data) {
        const userExists = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!userExists) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        const updateData = {};
        if (data.name)
            updateData.name = data.name;
        if (data.email)
            updateData.email = data.email;
        if (data.role)
            updateData.role = data.role;
        if (data.department)
            updateData.department = data.department;
        if (data.phoneNumber)
            updateData.phoneNumber = data.phoneNumber;
        if (data.lineId)
            updateData.lineId = data.lineId;
        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10);
        }
        return this.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                phoneNumber: true,
                lineId: true,
                lineOALink: {
                    select: {
                        lineUserId: true,
                        displayName: true,
                        pictureUrl: true,
                    }
                },
                profilePicture: true,
                createdAt: true,
                updatedAt: true,
            },
        }).then(user => this.mapUserLineInfo(user));
    }
    async deleteUser(id) {
        const userExists = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!userExists) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return this.prisma.user.delete({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });
    }
    async searchUsers(query) {
        return this.prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                    { department: { contains: query, mode: 'insensitive' } },
                    {
                        lineOALink: {
                            OR: [
                                { displayName: { contains: query, mode: 'insensitive' } },
                                { lineUserId: { contains: query, mode: 'insensitive' } }
                            ]
                        }
                    }
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                phoneNumber: true,
                lineId: true,
                lineOALink: {
                    select: {
                        lineUserId: true,
                        displayName: true,
                        pictureUrl: true,
                    }
                },
                profilePicture: true,
                createdAt: true,
                updatedAt: true,
            },
            take: 10,
        }).then(users => users.map(user => this.mapUserLineInfo(user)));
    }
    async createUser(data) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        try {
            return await this.prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    password: hashedPassword,
                    role: data.role || 'ผู้ใช้ทั่วไป',
                    department: data.department || '',
                    phoneNumber: data.phoneNumber || '',
                    lineId: data.lineId || '',
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    department: true,
                    phoneNumber: true,
                    lineId: true,
                    createdAt: true,
                },
            });
        }
        catch (error) {
            if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
                throw new common_1.ConflictException('อีเมลนี้ถูกใช้งานแล้ว');
            }
            throw error;
        }
    }
    async changePassword(id, newPassword) {
        const userExists = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!userExists) {
            throw new common_1.NotFoundException(`ผู้ใช้ ${id} ไม่พบ`);
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        return this.prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                phoneNumber: true,
                lineId: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async getOrCreateUserFromLine(lineUserId, displayName, pictureUrl) {
        if (!lineUserId || lineUserId === 'Guest' || lineUserId.toLowerCase() === 'null') {
            return this.getOrCreateGuestUser();
        }
        const existingLink = await this.prisma.lineOALink.findFirst({
            where: { lineUserId },
            include: { user: true },
        });
        if (existingLink) {
            if (displayName && existingLink.displayName !== displayName ||
                pictureUrl && existingLink.pictureUrl !== pictureUrl) {
                await this.prisma.lineOALink.update({
                    where: { id: existingLink.id },
                    data: {
                        displayName: displayName || existingLink.displayName,
                        pictureUrl: pictureUrl || existingLink.pictureUrl,
                    },
                });
            }
            return existingLink.user;
        }
        const timestamp = Date.now();
        const systemEmail = `line-${lineUserId}@repair-system.local`;
        const registerName = displayName || `User ${lineUserId.substring(0, 6)}`;
        const user = await this.prisma.user.create({
            data: {
                email: systemEmail,
                name: registerName,
                password: await bcrypt.hash(`temp_${lineUserId}`, 10),
                role: 'USER',
                lineOALink: {
                    create: {
                        lineUserId,
                        displayName,
                        pictureUrl,
                        status: 'VERIFIED',
                        verificationToken: '',
                        verificationExpiry: null,
                    },
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                phoneNumber: true,
                lineId: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return user;
    }
    async getOrCreateGuestUser() {
        const guestEmail = 'guest@repair-system.local';
        let guest = await this.prisma.user.findUnique({
            where: { email: guestEmail },
        });
        if (!guest) {
            const hashedPassword = await bcrypt.hash('guest_password', 10);
            guest = await this.prisma.user.create({
                data: {
                    email: guestEmail,
                    name: 'Guest User',
                    password: hashedPassword,
                    role: 'USER',
                    department: 'General',
                },
            });
        }
        return guest;
    }
    mapUserLineInfo(user) {
        if (!user)
            return null;
        return {
            ...user,
            lineUserId: user.lineOALink?.lineUserId || user.lineId,
            displayName: user.lineOALink?.displayName,
            pictureUrl: user.lineOALink?.pictureUrl,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map