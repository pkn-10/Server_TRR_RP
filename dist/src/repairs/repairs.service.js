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
var RepairsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepairsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const line_oa_notification_service_1 = require("../line-oa/line-oa-notification.service");
const path = __importStar(require("path"));
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
let RepairsService = RepairsService_1 = class RepairsService {
    prisma;
    cloudinaryService;
    lineNotificationService;
    logger = new common_1.Logger(RepairsService_1.name);
    statusTransitions = {
        [client_1.RepairTicketStatus.PENDING]: [client_1.RepairTicketStatus.ASSIGNED, client_1.RepairTicketStatus.IN_PROGRESS, client_1.RepairTicketStatus.CANCELLED],
        [client_1.RepairTicketStatus.ASSIGNED]: [client_1.RepairTicketStatus.PENDING, client_1.RepairTicketStatus.IN_PROGRESS, client_1.RepairTicketStatus.CANCELLED],
        [client_1.RepairTicketStatus.IN_PROGRESS]: [client_1.RepairTicketStatus.WAITING_PARTS, client_1.RepairTicketStatus.COMPLETED, client_1.RepairTicketStatus.CANCELLED],
        [client_1.RepairTicketStatus.WAITING_PARTS]: [client_1.RepairTicketStatus.IN_PROGRESS, client_1.RepairTicketStatus.COMPLETED, client_1.RepairTicketStatus.CANCELLED],
        [client_1.RepairTicketStatus.COMPLETED]: [],
        [client_1.RepairTicketStatus.CANCELLED]: [],
    };
    constructor(prisma, cloudinaryService, lineNotificationService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
        this.lineNotificationService = lineNotificationService;
    }
    validateStatusTransition(from, to) {
        if (from === to)
            return true;
        return this.statusTransitions[from]?.includes(to) || false;
    }
    sanitizeFilename(filename) {
        const basename = path.basename(filename);
        return basename.replace(/[^a-zA-Z0-9.-]/g, '_');
    }
    generateRandomCode(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    async generateTicketCode() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = String(now.getFullYear() + 543);
        const prefix = `TRR-${day}${month}${year}`;
        const lastTicket = await this.prisma.repairTicket.findFirst({
            where: {
                ticketCode: {
                    startsWith: prefix,
                },
            },
            orderBy: {
                ticketCode: 'desc',
            },
            select: {
                ticketCode: true,
            },
        });
        let sequence = 1;
        if (lastTicket && lastTicket.ticketCode) {
            const lastSequenceStr = lastTicket.ticketCode.slice(-3);
            const lastSequence = parseInt(lastSequenceStr, 10);
            if (!isNaN(lastSequence)) {
                sequence = lastSequence + 1;
            }
        }
        const sequenceStr = String(sequence).padStart(3, '0');
        return `${prefix}${sequenceStr}`;
    }
    async create(userId, dto, files, lineUserId) {
        this.logger.log(`Creating ticket - lineUserId parameter: ${lineUserId || 'NOT PROVIDED'}`);
        this.logger.log(`Creating ticket - dto.reporterLineId: ${dto.reporterLineId || 'NOT PROVIDED'}`);
        const ticketCode = await this.generateTicketCode();
        const linkingCode = lineUserId ? undefined : `${ticketCode}-${this.generateRandomCode(4)}`;
        const attachmentData = [];
        if (files && files.length > 0) {
            for (const file of files) {
                try {
                    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
                        this.logger.warn(`Rejected file with invalid MIME type: ${file.mimetype}`);
                        throw new common_1.BadRequestException(`Invalid file type: ${file.mimetype}. Only images are allowed.`);
                    }
                    if (file.size > MAX_FILE_SIZE) {
                        this.logger.warn(`Rejected file exceeding size limit: ${file.size} bytes`);
                        throw new common_1.BadRequestException(`File size exceeds 5MB limit`);
                    }
                    const sanitizedName = this.sanitizeFilename(file.originalname);
                    const result = await this.cloudinaryService.uploadFile(file.buffer, sanitizedName, 'repairs');
                    attachmentData.push({
                        filename: sanitizedName,
                        fileUrl: result.url,
                        fileSize: file.size,
                        mimeType: file.mimetype,
                    });
                }
                catch (error) {
                    if (error instanceof common_1.BadRequestException) {
                        throw error;
                    }
                    this.logger.error(`Failed to upload file ${file.originalname}:`, error);
                }
            }
        }
        const ticket = await this.prisma.repairTicket.create({
            data: {
                ticketCode,
                linkingCode,
                reporterLineUserId: lineUserId || null,
                reporterName: dto.reporterName,
                reporterDepartment: dto.reporterDepartment || null,
                reporterPhone: dto.reporterPhone || null,
                reporterLineId: dto.reporterLineId || null,
                problemCategory: dto.problemCategory,
                problemTitle: dto.problemTitle,
                problemDescription: dto.problemDescription || null,
                location: dto.location,
                urgency: dto.urgency || client_1.UrgencyLevel.NORMAL,
                userId,
                notes: dto.notes || null,
                scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : new Date(),
                attachments: {
                    create: attachmentData,
                },
            },
        });
        try {
            const imageUrl = attachmentData.length > 0 ? attachmentData[0].fileUrl : undefined;
            const targetLineUserId = lineUserId || (dto.reporterLineId && dto.reporterLineId.startsWith('U') ? dto.reporterLineId : undefined);
            if (targetLineUserId) {
                await this.lineNotificationService.notifyReporterDirectly(targetLineUserId, {
                    ticketCode: ticket.ticketCode,
                    status: ticket.status,
                    urgency: ticket.urgency,
                    problemTitle: ticket.problemTitle,
                    description: ticket.problemDescription || ticket.problemTitle,
                    imageUrl,
                    createdAt: ticket.createdAt,
                });
                this.logger.log(`LINE notification sent to reporter: ${targetLineUserId} (Source: ${lineUserId ? 'Direct' : 'Fallback'})`);
            }
            else if (userId) {
                await this.lineNotificationService.notifyRepairTicketStatusUpdate(userId, {
                    ticketCode: ticket.ticketCode,
                    problemTitle: ticket.problemTitle,
                    status: ticket.status,
                    technicianNames: [],
                    updatedAt: ticket.createdAt,
                });
                this.logger.log(`LINE notification sent to user ${userId}`);
            }
        }
        catch (error) {
            this.logger.error('Failed to initiate reporter LINE notification:', error);
        }
        return ticket;
    }
    safeUserSelect = {
        id: true, name: true, email: true, role: true,
        department: true, phoneNumber: true, lineId: true,
        profilePicture: true,
    };
    async findOne(id) {
        const ticket = await this.prisma.repairTicket.findUnique({
            where: { id },
            include: {
                user: { select: this.safeUserSelect },
                assignees: { include: { user: { select: this.safeUserSelect } } },
                attachments: true,
                logs: { include: { user: { select: this.safeUserSelect } }, orderBy: { createdAt: 'desc' } },
                assignmentHistory: {
                    include: {
                        assigner: { select: this.safeUserSelect },
                        assignee: { select: this.safeUserSelect }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            },
        });
        if (!ticket)
            throw new common_1.NotFoundException(`Repair ticket #${id} not found`);
        return ticket;
    }
    async findByCode(ticketCode) {
        const ticket = await this.prisma.repairTicket.findUnique({
            where: { ticketCode },
            include: {
                user: { select: this.safeUserSelect },
                assignees: { include: { user: { select: this.safeUserSelect } } },
                attachments: true,
                logs: { include: { user: { select: this.safeUserSelect } }, orderBy: { createdAt: 'desc' } },
                assignmentHistory: {
                    include: {
                        assigner: { select: this.safeUserSelect },
                        assignee: { select: this.safeUserSelect }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            },
        });
        if (!ticket)
            throw new common_1.NotFoundException(`Ticket ${ticketCode} not found`);
        return ticket;
    }
    async update(id, dto, updatedById, files) {
        const originalTicket = await this.prisma.repairTicket.findUnique({
            where: { id },
            include: {
                assignees: { select: { userId: true } },
                attachments: { orderBy: { id: 'asc' }, take: 1 },
            },
        });
        if (dto.status !== undefined && originalTicket && dto.status !== originalTicket.status) {
            if (!this.validateStatusTransition(originalTicket.status, dto.status)) {
                throw new common_1.BadRequestException(`ไม่สามารถเปลี่ยนสถานะจาก ${originalTicket.status} เป็น ${dto.status} ได้`);
            }
        }
        const updateData = {};
        if (dto.status !== undefined)
            updateData.status = dto.status;
        if (dto.notes !== undefined)
            updateData.notes = dto.notes;
        if (dto.messageToReporter !== undefined)
            updateData.messageToReporter = dto.messageToReporter;
        if (dto.completionReport !== undefined)
            updateData.notes = dto.completionReport;
        if (dto.scheduledAt)
            updateData.scheduledAt = new Date(dto.scheduledAt);
        if (dto.completedAt)
            updateData.completedAt = new Date(dto.completedAt);
        if (dto.estimatedCompletionDate)
            updateData.estimatedCompletionDate = new Date(dto.estimatedCompletionDate);
        if (dto.problemTitle !== undefined)
            updateData.problemTitle = dto.problemTitle;
        if (dto.problemDescription !== undefined)
            updateData.problemDescription = dto.problemDescription;
        if (dto.location !== undefined)
            updateData.location = dto.location;
        if (dto.urgency !== undefined)
            updateData.urgency = dto.urgency;
        try {
            const previousAssigneeIds = originalTicket?.assignees.map(a => a.userId) || [];
            if (dto.assigneeIds !== undefined) {
                dto.assigneeIds = Array.isArray(dto.assigneeIds)
                    ? dto.assigneeIds.map((id) => Number(id))
                    : [];
                await this.prisma.repairTicketAssignee.deleteMany({
                    where: { repairTicketId: id },
                });
                if (dto.assigneeIds.length > 0) {
                    await this.prisma.repairTicketAssignee.createMany({
                        data: dto.assigneeIds.map((userId) => ({
                            repairTicketId: id,
                            userId,
                        })),
                    });
                    const addedIds = dto.assigneeIds.filter((id) => !previousAssigneeIds.includes(id));
                    const removedIds = previousAssigneeIds.filter((id) => !dto.assigneeIds.includes(id));
                    const historyData = [];
                    for (const uid of addedIds) {
                        historyData.push({
                            repairTicketId: id,
                            action: 'ASSIGN',
                            assignerId: updatedById,
                            assigneeId: uid,
                            note: 'มอบหมายงาน'
                        });
                    }
                    for (const uid of removedIds) {
                        historyData.push({
                            repairTicketId: id,
                            action: 'UNASSIGN',
                            assignerId: updatedById,
                            assigneeId: uid,
                            note: 'ยกเลิกการมอบหมาย'
                        });
                    }
                    if (historyData.length > 0) {
                        await this.prisma.repairAssignmentHistory.createMany({ data: historyData });
                    }
                }
            }
            const uploadedImageUrls = [];
            if (files && files.length > 0) {
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
                        const sanitizedName = this.sanitizeFilename(file.originalname);
                        const result = await this.cloudinaryService.uploadFile(file.buffer, sanitizedName, 'repairs/completion');
                        await this.prisma.repairAttachment.create({
                            data: {
                                repairTicketId: id,
                                filename: sanitizedName,
                                fileUrl: result.url,
                                fileSize: file.size,
                                mimeType: file.mimetype,
                            },
                        });
                        uploadedImageUrls.push(result.url);
                    }
                    catch (error) {
                        this.logger.error(`Failed to upload completion file ${file.originalname}:`, error);
                    }
                }
            }
            if (dto.status !== undefined && originalTicket && dto.status !== originalTicket.status) {
                let action = 'STATUS_CHANGE';
                const statusTh = {
                    PENDING: 'รอรับงาน',
                    ASSIGNED: 'มอบหมายแล้ว',
                    IN_PROGRESS: 'กำลังดำเนินการ',
                    WAITING_PARTS: 'รออะไหล่',
                    COMPLETED: 'เสร็จสิ้น',
                    CANCELLED: 'ยกเลิก'
                };
                const oldStatus = statusTh[originalTicket.status] || originalTicket.status;
                const newStatus = statusTh[dto.status] || dto.status;
                let note = `เปลี่ยนสถานะจาก ${oldStatus} เป็น ${newStatus}`;
                if (dto.status === 'IN_PROGRESS' && originalTicket.status === 'ASSIGNED') {
                    action = 'ACCEPT';
                    note = 'รับงาน';
                }
                else if (dto.status === 'PENDING' && originalTicket.status === 'ASSIGNED') {
                    action = 'REJECT';
                    note = 'ปฏิเสธงาน';
                }
                if (dto.status === 'COMPLETED') {
                    if (dto.completionReport) {
                        note += `\nรายงาน: ${dto.completionReport}`;
                    }
                    if (uploadedImageUrls.length > 0) {
                        note += `\n[IMAGES:${uploadedImageUrls.join(',')}]`;
                    }
                }
                await this.prisma.repairAssignmentHistory.create({
                    data: {
                        repairTicketId: id,
                        action,
                        assignerId: updatedById,
                        assigneeId: updatedById,
                        note
                    }
                });
            }
            if (dto.notes || dto.messageToReporter) {
                const logs = [];
                if (dto.notes) {
                    logs.push({
                        repairTicketId: id,
                        action: 'NOTE',
                        assignerId: updatedById,
                        note: `หมายเหตุ: ${dto.notes}`
                    });
                }
                if (dto.messageToReporter) {
                    logs.push({
                        repairTicketId: id,
                        action: 'MESSAGE_TO_REPORTER',
                        assignerId: updatedById,
                        note: `แจ้งผู้ซ่อม: ${dto.messageToReporter}`
                    });
                }
                if (logs.length > 0) {
                    await this.prisma.repairAssignmentHistory.createMany({ data: logs });
                }
            }
            const ticket = await this.prisma.repairTicket.update({
                where: { id },
                data: updateData,
                include: {
                    user: true,
                    assignees: { include: { user: true } },
                },
            });
            const cachedImageUrl = originalTicket?.attachments?.[0]?.fileUrl;
            try {
                if (dto.assigneeIds !== undefined) {
                    const newAssigneeIds = dto.assigneeIds.filter((id) => !previousAssigneeIds.includes(id));
                    if (newAssigneeIds.length > 0) {
                        await Promise.allSettled(newAssigneeIds.map((techId) => this.lineNotificationService.notifyTechnicianTaskAssignment(techId, {
                            ticketCode: ticket.ticketCode,
                            ticketId: ticket.id,
                            problemTitle: ticket.problemTitle,
                            problemDescription: ticket.problemDescription || undefined,
                            adminNote: dto.notes || undefined,
                            reporterName: ticket.reporterName,
                            reporterPhone: ticket.reporterPhone || undefined,
                            department: ticket.reporterDepartment || 'ไม่ระบุแผนก',
                            location: ticket.location,
                            urgency: ticket.urgency,
                            action: 'ASSIGNED',
                            imageUrl: cachedImageUrl,
                        }).then(() => this.logger.log(`Notified technician ${techId} for assignment: ${ticket.ticketCode}`))));
                    }
                }
                if (dto.rushAssigneeIds && dto.rushAssigneeIds.length > 0) {
                    const adminUser = await this.prisma.user.findUnique({
                        where: { id: updatedById },
                        select: { name: true },
                    });
                    await Promise.allSettled(dto.rushAssigneeIds.map((techId) => this.lineNotificationService.notifyTechnicianRush(techId, {
                        ticketCode: ticket.ticketCode,
                        ticketId: ticket.id,
                        problemTitle: ticket.problemTitle,
                        rushMessage: dto.notes || undefined,
                        adminName: adminUser?.name,
                        reporterName: ticket.reporterName,
                        reporterPhone: ticket.reporterPhone || undefined,
                        department: ticket.reporterDepartment || undefined,
                        location: ticket.location,
                        urgency: ticket.urgency,
                        imageUrl: cachedImageUrl,
                    }).then(() => this.logger.log(`Sent rush notification to technician ${techId} for: ${ticket.ticketCode}`))));
                    const rushUserNames = await this.prisma.user.findMany({
                        where: { id: { in: dto.rushAssigneeIds } },
                        select: { id: true, name: true },
                    });
                    const rushNames = rushUserNames.map(u => u.name).join(', ');
                    await this.prisma.repairAssignmentHistory.create({
                        data: {
                            repairTicketId: id,
                            action: 'RUSH',
                            assignerId: updatedById,
                            assigneeId: dto.rushAssigneeIds[0],
                            note: `เร่งงาน: ${rushNames}${dto.notes ? ` - ${dto.notes}` : ''}`,
                        },
                    });
                }
                if (dto.status === 'COMPLETED' && originalTicket && originalTicket.status !== 'COMPLETED') {
                    const assignees = await this.prisma.repairTicketAssignee.findMany({
                        where: { repairTicketId: id },
                        include: { user: true }
                    });
                    await Promise.allSettled(assignees.map(assignee => this.lineNotificationService.notifyTechnicianJobCompletion(assignee.userId, {
                        ticketCode: ticket.ticketCode,
                        ticketId: ticket.id,
                        problemTitle: ticket.problemTitle,
                        reporterName: ticket.reporterName,
                        department: ticket.reporterDepartment || undefined,
                        location: ticket.location,
                        completedAt: ticket.completedAt || new Date(),
                        completionNote: dto.completionReport || dto.notes,
                        problemImageUrl: cachedImageUrl,
                    }).then(() => this.logger.log(`Notified technician ${assignee.userId} for completion: ${ticket.ticketCode}`))));
                }
                if (dto.status === 'CANCELLED' && originalTicket && originalTicket.status !== 'CANCELLED') {
                    const assignees = await this.prisma.repairTicketAssignee.findMany({
                        where: { repairTicketId: id },
                        include: { user: true }
                    });
                    await Promise.allSettled(assignees.map(assignee => this.lineNotificationService.notifyTechnicianJobCancellation(assignee.userId, {
                        ticketCode: ticket.ticketCode,
                        ticketId: ticket.id,
                        problemTitle: ticket.problemTitle,
                        reporterName: ticket.reporterName,
                        department: ticket.reporterDepartment || undefined,
                        location: ticket.location,
                        cancelledAt: new Date(),
                        cancelNote: dto.notes,
                        problemImageUrl: cachedImageUrl,
                    }).then(() => this.logger.log(`Notified technician ${assignee.userId} for cancellation: ${ticket.ticketCode}`))));
                }
                if (dto.status !== undefined && originalTicket && dto.status !== originalTicket.status) {
                    const technicianNames = ticket.assignees.map(a => a.user.name);
                    let remarkMessage = dto.messageToReporter || undefined;
                    if (dto.status === 'COMPLETED' && dto.completionReport) {
                        remarkMessage = `รายงานการซ่อม: ${dto.completionReport}`;
                    }
                    if (originalTicket.reporterLineUserId) {
                        await this.lineNotificationService.notifyReporterDirectly(originalTicket.reporterLineUserId, {
                            ticketCode: ticket.ticketCode,
                            status: dto.status,
                            urgency: ticket.urgency,
                            problemTitle: ticket.problemTitle,
                            description: ticket.problemDescription || ticket.problemTitle,
                            imageUrl: cachedImageUrl,
                            createdAt: ticket.createdAt,
                            remark: remarkMessage,
                        });
                        this.logger.log(`Notified reporter directly for: ${ticket.ticketCode}`);
                    }
                    else {
                        await this.lineNotificationService.notifyRepairTicketStatusUpdate(ticket.userId, {
                            ticketCode: ticket.ticketCode,
                            problemTitle: ticket.problemTitle,
                            status: dto.status,
                            remark: remarkMessage,
                            technicianNames,
                            updatedAt: new Date(),
                        });
                        this.logger.log(`Notified reporter via userId for: ${ticket.ticketCode}`);
                    }
                }
                if (dto.messageToReporter && !(dto.status !== undefined && originalTicket && dto.status !== originalTicket.status)) {
                    if (originalTicket?.reporterLineUserId) {
                        await this.lineNotificationService.notifyReporterDirectly(originalTicket.reporterLineUserId, {
                            ticketCode: ticket.ticketCode,
                            status: ticket.status,
                            urgency: ticket.urgency,
                            problemTitle: ticket.problemTitle,
                            description: ticket.problemDescription || ticket.problemTitle,
                            imageUrl: cachedImageUrl,
                            createdAt: ticket.createdAt,
                            remark: dto.messageToReporter,
                        });
                    }
                    else {
                        const technicianNames = ticket.assignees.map(a => a.user.name);
                        await this.lineNotificationService.notifyRepairTicketStatusUpdate(ticket.userId, {
                            ticketCode: ticket.ticketCode,
                            problemTitle: ticket.problemTitle,
                            status: ticket.status,
                            remark: dto.messageToReporter,
                            technicianNames,
                            updatedAt: new Date(),
                        });
                    }
                    this.logger.log(`Notified reporter for message: ${ticket.ticketCode}`);
                }
            }
            catch (notifError) {
                this.logger.error('Failed to send LINE notification:', notifError);
            }
            return ticket;
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Repair ticket #${id} not found`);
            }
            if (error.code === 'P2003') {
                throw new common_1.BadRequestException(`ข้อมูลอ้างอิงไม่ถูกต้อง (เช่น ผู้รับผิดชอบไม่มีอยู่ในระบบ)`);
            }
            throw error;
        }
    }
    async remove(id) {
        const ticket = await this.prisma.repairTicket.findUnique({
            where: { id },
            include: {
                attachments: true,
            },
        });
        if (!ticket) {
            throw new common_1.NotFoundException(`Repair ticket #${id} not found`);
        }
        await this.prisma.repairTicket.delete({
            where: { id },
        });
        this.logger.log(`Hard deleted repair ticket: ${ticket.ticketCode}`);
        return { message: 'Deleted successfully', ticketCode: ticket.ticketCode };
    }
    async getStatistics() {
        const stats = await this.prisma.repairTicket.groupBy({
            by: ['status'],
            _count: {
                status: true,
            },
        });
        const total = stats.reduce((acc, curr) => acc + curr._count.status, 0);
        const getCount = (status) => stats.find(s => s.status === status)?._count.status || 0;
        return {
            total,
            pending: getCount(client_1.RepairTicketStatus.PENDING),
            assigned: getCount(client_1.RepairTicketStatus.ASSIGNED),
            inProgress: getCount(client_1.RepairTicketStatus.IN_PROGRESS),
            waitingParts: getCount(client_1.RepairTicketStatus.WAITING_PARTS),
            completed: getCount(client_1.RepairTicketStatus.COMPLETED),
            cancelled: getCount(client_1.RepairTicketStatus.CANCELLED),
        };
    }
    async getDashboardStatistics(filter = 'day', date, limit) {
        const targetDate = date || new Date();
        let startDate;
        let endDate;
        if (filter === 'day') {
            startDate = new Date(targetDate);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(targetDate);
            endDate.setHours(23, 59, 59, 999);
        }
        else if (filter === 'week') {
            startDate = new Date(targetDate);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
        }
        else {
            startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
            endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);
        }
        const allStats = await this.prisma.repairTicket.groupBy({
            by: ['status'],
            _count: { status: true },
        });
        const filteredStats = await this.prisma.repairTicket.groupBy({
            by: ['status'],
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _count: { status: true },
        });
        const getCount = (stats, status) => stats.find(s => s.status === status)?._count.status || 0;
        const allTotal = allStats.reduce((acc, curr) => acc + curr._count.status, 0);
        const filteredTotal = filteredStats.reduce((acc, curr) => acc + curr._count.status, 0);
        const recentRepairs = await this.prisma.repairTicket.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                id: true,
                ticketCode: true,
                createdAt: true,
                problemTitle: true,
                location: true,
                urgency: true,
                status: true,
            },
            orderBy: { createdAt: 'desc' },
            take: limit || 20,
        });
        return {
            all: {
                total: allTotal,
                inProgress: getCount(allStats, client_1.RepairTicketStatus.IN_PROGRESS),
                completed: getCount(allStats, client_1.RepairTicketStatus.COMPLETED),
                cancelled: getCount(allStats, client_1.RepairTicketStatus.CANCELLED),
            },
            filtered: {
                total: filteredTotal,
                pending: getCount(filteredStats, client_1.RepairTicketStatus.PENDING),
                inProgress: getCount(filteredStats, client_1.RepairTicketStatus.IN_PROGRESS),
                completed: getCount(filteredStats, client_1.RepairTicketStatus.COMPLETED),
                cancelled: getCount(filteredStats, client_1.RepairTicketStatus.CANCELLED),
            },
            recentRepairs,
            dateRange: { startDate, endDate },
        };
    }
    async getDepartmentStatistics(filter, date) {
        let dateWhere = {};
        if (filter && date) {
            let startDate;
            let endDate;
            if (filter === 'day') {
                startDate = new Date(date);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(date);
                endDate.setHours(23, 59, 59, 999);
            }
            else if (filter === 'week') {
                const dayOfWeek = date.getDay();
                startDate = new Date(date);
                startDate.setDate(date.getDate() - dayOfWeek);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 6);
                endDate.setHours(23, 59, 59, 999);
            }
            else {
                startDate = new Date(date.getFullYear(), date.getMonth(), 1);
                endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
            }
            dateWhere = { createdAt: { gte: startDate, lte: endDate } };
        }
        const rawStats = await this.prisma.repairTicket.groupBy({
            by: ['reporterDepartment', 'status'],
            _count: { status: true },
            where: {
                reporterDepartment: { not: null },
                ...dateWhere,
            },
        });
        const deptMap = new Map();
        for (const row of rawStats) {
            const dept = row.reporterDepartment || 'ไม่ระบุ';
            if (!deptMap.has(dept)) {
                deptMap.set(dept, { total: 0, pending: 0, inProgress: 0, completed: 0, cancelled: 0 });
            }
            const stat = deptMap.get(dept);
            const count = row._count.status;
            stat.total += count;
            switch (row.status) {
                case client_1.RepairTicketStatus.PENDING:
                    stat.pending += count;
                    break;
                case client_1.RepairTicketStatus.IN_PROGRESS:
                case client_1.RepairTicketStatus.ASSIGNED:
                case client_1.RepairTicketStatus.WAITING_PARTS:
                    stat.inProgress += count;
                    break;
                case client_1.RepairTicketStatus.COMPLETED:
                    stat.completed += count;
                    break;
                case client_1.RepairTicketStatus.CANCELLED:
                    stat.cancelled += count;
                    break;
            }
        }
        return Array.from(deptMap.entries()).map(([department, stats]) => ({
            department,
            ...stats,
        }));
    }
    async getSchedule() {
        return this.prisma.repairTicket.findMany({
            select: {
                id: true,
                ticketCode: true,
                problemTitle: true,
                problemDescription: true,
                status: true,
                urgency: true,
                scheduledAt: true,
                createdAt: true,
                completedAt: true,
                location: true,
                reporterName: true,
            },
            orderBy: { scheduledAt: 'asc' },
        });
    }
    async findAll(params) {
        const { userId, isAdmin, status, urgency, assignedTo, limit, } = params;
        const where = {};
        if (!isAdmin && userId) {
            where.userId = userId;
        }
        if (status)
            where.status = status;
        if (urgency)
            where.urgency = urgency;
        if (assignedTo)
            where.assignedTo = assignedTo;
        return this.prisma.repairTicket.findMany({
            where,
            take: limit,
            include: {
                user: { select: this.safeUserSelect },
                assignees: { include: { user: { select: this.safeUserSelect } } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findUserByLineId(lineUserId) {
        const link = await this.prisma.lineOALink.findFirst({
            where: { lineUserId },
            include: { user: true },
        });
        return link?.user;
    }
    async getUserTickets(userId) {
        return this.prisma.repairTicket.findMany({
            where: { userId },
            include: {
                user: { select: this.safeUserSelect },
                assignees: { include: { user: { select: this.safeUserSelect } } },
                attachments: true,
                logs: {
                    include: { user: { select: this.safeUserSelect } },
                    orderBy: { createdAt: 'desc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.RepairsService = RepairsService;
exports.RepairsService = RepairsService = RepairsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService,
        line_oa_notification_service_1.LineOANotificationService])
], RepairsService);
//# sourceMappingURL=repairs.service.js.map