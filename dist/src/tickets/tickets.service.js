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
var TicketsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const path = __importStar(require("path"));
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
let TicketsService = TicketsService_1 = class TicketsService {
    prisma;
    cloudinaryService;
    logger = new common_1.Logger(TicketsService_1.name);
    constructor(prisma, cloudinaryService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
    }
    generateTicketCode() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0');
        return `TKT-${new Date().getFullYear()}-${timestamp}${random}`;
    }
    async create(userId, createTicketDto, files) {
        const ticketCode = this.generateTicketCode();
        const data = {
            ticketCode,
            title: createTicketDto.title,
            description: createTicketDto.description,
            equipmentName: createTicketDto.equipmentName,
            priority: createTicketDto.priority || client_1.Priority.MEDIUM,
            userId,
            location: createTicketDto.location || 'N/A',
            category: createTicketDto.category || 'OTHER',
            problemCategory: createTicketDto.problemCategory || 'HARDWARE',
            problemSubcategory: createTicketDto.problemSubcategory || 'OTHER',
        };
        if (createTicketDto.guestName)
            data.guestName = createTicketDto.guestName;
        if (createTicketDto.guestEmail)
            data.guestEmail = createTicketDto.guestEmail;
        if (createTicketDto.guestPhone)
            data.guestPhone = createTicketDto.guestPhone;
        if (createTicketDto.guestDepartment)
            data.guestDepartment = createTicketDto.guestDepartment;
        if (createTicketDto.equipmentId !== undefined)
            data.equipmentId = createTicketDto.equipmentId;
        if (createTicketDto.notes !== undefined)
            data.notes = createTicketDto.notes;
        if (createTicketDto.requiredDate !== undefined)
            data.requiredDate = createTicketDto.requiredDate;
        if (createTicketDto.assignee?.id) {
            data.assignedTo = parseInt(createTicketDto.assignee.id);
        }
        const ticket = await this.prisma.ticket.create({
            data,
            include: {
                attachments: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (files && files.length > 0) {
            const attachments = [];
            for (const file of files) {
                try {
                    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
                        this.logger.warn(`Rejected file with invalid MIME type: ${file.mimetype}`);
                        continue;
                    }
                    if (file.size > MAX_FILE_SIZE) {
                        this.logger.warn(`Rejected file exceeding size limit: ${file.size} bytes`);
                        continue;
                    }
                    const sanitizedName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
                    const result = await this.cloudinaryService.uploadFile(file.buffer, sanitizedName, 'tickets');
                    attachments.push({
                        ticketId: ticket.id,
                        filename: sanitizedName,
                        fileUrl: result.url,
                        fileSize: file.size,
                        mimeType: file.mimetype,
                    });
                }
                catch (error) {
                    this.logger.error(`เกิดข้อผิดพลาดในการอัปโหลดไฟล์ ${file.originalname}:`, error);
                }
            }
            if (attachments.length > 0) {
                await this.prisma.attachment.createMany({
                    data: attachments,
                });
            }
        }
        return ticket;
    }
    async findAll(userId, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const where = userId ? { userId } : undefined;
        const [data, total] = await Promise.all([
            this.prisma.ticket.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    assignee: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    attachments: true,
                    logs: true,
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.ticket.count({ where }),
        ]);
        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        return this.prisma.ticket.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
    }
    async findByCode(code) {
        return this.prisma.ticket.findUnique({
            where: { ticketCode: code },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                attachments: true,
                logs: true,
            },
        });
    }
    async findByEmail(email) {
        return this.prisma.ticket.findMany({
            where: {
                OR: [
                    { user: { email } },
                    { guestEmail: email },
                ],
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                attachments: true,
                logs: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async update(id, updateTicketDto) {
        const updateData = {};
        if (updateTicketDto.title !== undefined)
            updateData.title = updateTicketDto.title;
        if (updateTicketDto.description !== undefined)
            updateData.description = updateTicketDto.description;
        if (updateTicketDto.equipmentName !== undefined)
            updateData.equipmentName = updateTicketDto.equipmentName;
        if (updateTicketDto.equipmentId !== undefined)
            updateData.equipmentId = updateTicketDto.equipmentId;
        if (updateTicketDto.notes !== undefined)
            updateData.notes = updateTicketDto.notes;
        if (updateTicketDto.requiredDate !== undefined)
            updateData.requiredDate = updateTicketDto.requiredDate;
        if (updateTicketDto.priority !== undefined)
            updateData.priority = updateTicketDto.priority;
        if (updateTicketDto.status !== undefined)
            updateData.status = updateTicketDto.status;
        if (updateTicketDto.assignee !== undefined) {
            if (updateTicketDto.assignee && updateTicketDto.assignee.id) {
                updateData.assignedTo = parseInt(updateTicketDto.assignee.id);
            }
            else {
                updateData.assignedTo = null;
            }
        }
        return this.prisma.ticket.update({
            where: { id },
            data: updateData,
            include: {
                attachments: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async remove(id) {
        return this.prisma.ticket.delete({
            where: { id },
        });
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = TicketsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map