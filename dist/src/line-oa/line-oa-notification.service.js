"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LineOANotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineOANotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const line_oa_service_1 = require("./line-oa.service");
const client_1 = require("@prisma/client");
const NotificationStatus = client_1.LineNotificationStatus;
const COLORS = {
    CRITICAL: '#DC2626',
    URGENT: '#EA580C',
    NORMAL: '#16A34A',
    SUCCESS: '#059669',
    INFO: '#2563EB',
    WARNING: '#D97706',
    SECONDARY: '#6B7280',
    PRIMARY: '#1E293B',
    HEADER_DARK: '#0F172A',
    CARD_BG: '#FFFFFF',
    SECTION_BG: '#F8FAFC',
    BORDER: '#E2E8F0',
    LABEL: '#64748B',
    VALUE: '#1E293B',
    SUBTLE: '#94A3B8',
    FOOTER_BG: '#F1F5F9',
};
let LineOANotificationService = LineOANotificationService_1 = class LineOANotificationService {
    prisma;
    lineOAService;
    logger = new common_1.Logger(LineOANotificationService_1.name);
    constructor(prisma, lineOAService) {
        this.prisma = prisma;
        this.lineOAService = lineOAService;
    }
    async sendNotification(userId, payload) {
        try {
            const lineLink = await this.getVerifiedLineLink(userId);
            if (!lineLink)
                return { success: false, reason: 'User not linked to LINE' };
            const message = payload.richMessage || this.createDefaultTextMessage(payload);
            await this.lineOAService.sendMessage(lineLink.lineUserId, message);
            await this.saveNotificationLog(lineLink.lineUserId, payload, NotificationStatus.SENT);
            return { success: true };
        }
        catch (error) {
            this.logger.error(error.message);
            await this.logFailure(userId, payload, error.message);
            return { success: false };
        }
    }
    async notifyRepairTicketToITTeam(payload) {
        try {
            const itUsers = await this.prisma.user.findMany({
                where: {
                    role: 'IT',
                    lineOALink: { status: 'VERIFIED' },
                },
                include: { lineOALink: true },
            });
            const lineUserIds = itUsers
                .map(u => u.lineOALink?.lineUserId)
                .filter((id) => !!id);
            if (lineUserIds.length === 0)
                return { success: false, reason: 'No IT users linked to LINE' };
            const flexMessage = {
                type: 'flex',
                altText: `งานซ่อมใหม่ ${payload.ticketCode}`,
                contents: this.createRepairTicketFlex(payload),
            };
            await this.lineOAService.sendMulticast(lineUserIds, flexMessage);
            await Promise.all(lineUserIds.map(lineUserId => this.saveNotificationLog(lineUserId, {
                type: 'REPAIR_TICKET_CREATED',
                title: `งานใหม่ ${payload.ticketCode}`,
                message: payload.problemTitle,
            }, NotificationStatus.SENT)));
            return { success: true, count: lineUserIds.length };
        }
        catch (error) {
            this.logger.error(error.message);
            return { success: false };
        }
    }
    async notifyTechnicianTaskAssignment(technicianId, payload) {
        try {
            const lineLink = await this.getVerifiedLineLink(technicianId);
            if (!lineLink)
                return { success: false, reason: 'Technician not linked to LINE' };
            const actionText = {
                ASSIGNED: 'ได้รับมอบหมายงานใหม่',
                TRANSFERRED: 'มีการโอนงานมาให้คุณ',
                CLAIMED: 'คุณรับงานซ่อมแล้ว',
            }[payload.action];
            const flexMessage = {
                type: 'flex',
                altText: `${actionText} ${payload.ticketCode}`,
                contents: this.createTechnicianAssignmentFlex(payload, actionText),
            };
            await this.lineOAService.sendMessage(lineLink.lineUserId, flexMessage);
            await this.saveNotificationLog(lineLink.lineUserId, {
                type: `REPAIR_TICKET_${payload.action}`,
                title: actionText,
                message: `${payload.ticketCode}: ${payload.problemTitle}`,
            }, NotificationStatus.SENT);
            return { success: true };
        }
        catch (error) {
            this.logger.error(error.message);
            return { success: false };
        }
    }
    async notifyTechnicianJobCompletion(technicianId, payload) {
        try {
            const lineLink = await this.getVerifiedLineLink(technicianId);
            if (!lineLink)
                return { success: false, reason: 'Technician not linked to LINE' };
            const flexMessage = {
                type: 'flex',
                altText: `ปิดงานซ่อม ${payload.ticketCode} เรียบร้อยแล้ว`,
                contents: this.createTechnicianCompletionFlex({
                    ...payload,
                }),
            };
            await this.lineOAService.sendMessage(lineLink.lineUserId, flexMessage);
            await this.saveNotificationLog(lineLink.lineUserId, {
                type: 'REPAIR_TICKET_COMPLETED',
                title: 'ปิดงานสำเร็จ',
                message: `${payload.ticketCode}: ${payload.problemTitle}`,
            }, NotificationStatus.SENT);
            return { success: true };
        }
        catch (error) {
            this.logger.error(error.message);
            return { success: false };
        }
    }
    async notifyTechnicianJobCancellation(technicianId, payload) {
        try {
            const lineLink = await this.getVerifiedLineLink(technicianId);
            if (!lineLink)
                return { success: false, reason: 'Technician not linked to LINE' };
            const flexMessage = {
                type: 'flex',
                altText: `ยกเลิกงานซ่อม ${payload.ticketCode}`,
                contents: this.createTechnicianCancellationFlex({
                    ...payload,
                }),
            };
            await this.lineOAService.sendMessage(lineLink.lineUserId, flexMessage);
            await this.saveNotificationLog(lineLink.lineUserId, {
                type: 'REPAIR_TICKET_CANCELLED',
                title: 'ยกเลิกงานซ่อม',
                message: `${payload.ticketCode}: ${payload.problemTitle}`,
            }, NotificationStatus.SENT);
            return { success: true };
        }
        catch (error) {
            this.logger.error(error.message);
            return { success: false };
        }
    }
    async notifyTechnicianRush(technicianId, payload) {
        try {
            const lineLink = await this.getVerifiedLineLink(technicianId);
            if (!lineLink)
                return { success: false, reason: 'Technician not linked to LINE' };
            const flexMessage = {
                type: 'flex',
                altText: `เร่งงาน ${payload.ticketCode}`,
                contents: this.createTechnicianRushFlex(payload),
            };
            await this.lineOAService.sendMessage(lineLink.lineUserId, flexMessage);
            await this.saveNotificationLog(lineLink.lineUserId, {
                type: 'REPAIR_TICKET_RUSH',
                title: 'เร่งงานซ่อม',
                message: `${payload.ticketCode}: ${payload.problemTitle}`,
            }, NotificationStatus.SENT);
            return { success: true };
        }
        catch (error) {
            this.logger.error(error.message);
            return { success: false };
        }
    }
    createTechnicianRushFlex(payload) {
        const urgency = this.getUrgencyConfig(payload.urgency);
        const formattedDate = new Intl.DateTimeFormat('th-TH', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
            timeZone: 'Asia/Bangkok',
        }).format(new Date());
        let frontendUrl = process.env.FRONTEND_URL || 'https://trritrp.vercel.app';
        try {
            frontendUrl = new URL(frontendUrl).origin;
        }
        catch (e) { }
        const actionButtons = [];
        if (payload.ticketCode) {
            actionButtons.push({
                type: 'button',
                action: { type: 'uri', label: 'จัดการงาน', uri: `${frontendUrl}/login/admin?ticketCode=${payload.ticketCode}` },
                style: 'primary',
                height: 'sm',
                color: '#2563EB',
            });
        }
        if (payload.reporterPhone) {
            actionButtons.push({
                type: 'button',
                action: { type: 'uri', label: 'โทรหาผู้แจ้ง', uri: `tel:${payload.reporterPhone}` },
                style: 'primary',
                height: 'sm',
                color: '#16A34A',
            });
        }
        return {
            type: 'bubble',
            size: 'mega',
            header: {
                type: 'box',
                layout: 'vertical',
                backgroundColor: '#FF9800',
                paddingAll: '20px',
                contents: [
                    {
                        type: 'box',
                        layout: 'horizontal',
                        alignItems: 'center',
                        contents: [
                            { type: 'text', text: 'เร่งงานซ่อม', color: '#FFFFFF', weight: 'bold', size: 'lg', flex: 1 },
                            {
                                type: 'box',
                                layout: 'vertical',
                                backgroundColor: urgency.color,
                                cornerRadius: 'xl',
                                paddingAll: '4px',
                                paddingStart: '10px',
                                paddingEnd: '10px',
                                flex: 0,
                                contents: [{ type: 'text', text: urgency.text, color: '#FFFFFF', size: 'xxs', weight: 'bold' }],
                            },
                        ],
                    },
                    { type: 'text', text: payload.ticketCode, color: '#FFFFFFCC', size: 'sm', margin: 'sm', weight: 'bold' },
                ],
            },
            hero: payload.imageUrl ? {
                type: 'image',
                url: payload.imageUrl,
                size: 'full',
                aspectRatio: '20:13',
                aspectMode: 'cover',
            } : undefined,
            body: {
                type: 'box',
                layout: 'vertical',
                paddingAll: '20px',
                backgroundColor: '#FFFFFF',
                contents: [
                    {
                        type: 'box',
                        layout: 'vertical',
                        spacing: 'xs',
                        contents: [
                            { type: 'text', text: 'ปัญหาที่แจ้ง', size: 'xs', color: '#64748B', weight: 'bold' },
                            { type: 'text', text: payload.problemTitle, size: 'md', weight: 'bold', color: '#1E293B', wrap: true },
                        ],
                    },
                    ...(payload.rushMessage ? [{
                            type: 'box',
                            layout: 'vertical',
                            margin: 'md',
                            paddingAll: '12px',
                            backgroundColor: '#FEF2F2',
                            cornerRadius: 'md',
                            borderColor: '#dda148ff',
                            borderWidth: '1px',
                            contents: [
                                { type: 'text', text: `ข้อความจากแอดมิน${payload.adminName ? ` (${payload.adminName})` : ''}`, size: 'xs', color: '#991B1B', weight: 'bold' },
                                { type: 'text', text: payload.rushMessage, size: 'sm', color: '#7F1D1D', wrap: true, margin: 'xs' },
                            ],
                        }] : []),
                    { type: 'separator', margin: 'xl', color: '#F1F5F9' },
                    {
                        type: 'box',
                        layout: 'vertical',
                        margin: 'xl',
                        spacing: 'sm',
                        contents: [
                            {
                                type: 'box', layout: 'horizontal', contents: [
                                    { type: 'text', text: 'ผู้แจ้ง', size: 'sm', color: '#64748B', flex: 3 },
                                    { type: 'text', text: payload.reporterName, size: 'sm', color: '#1E293B', weight: 'bold', flex: 7, wrap: true },
                                ],
                            },
                            ...(payload.department ? [{
                                    type: 'box', layout: 'horizontal', contents: [
                                        { type: 'text', text: 'แผนก', size: 'sm', color: '#64748B', flex: 3 },
                                        { type: 'text', text: payload.department, size: 'sm', color: '#1E293B', flex: 7, wrap: true },
                                    ],
                                }] : []),
                            ...(payload.location ? [{
                                    type: 'box', layout: 'horizontal', contents: [
                                        { type: 'text', text: 'สถานที่', size: 'sm', color: '#64748B', flex: 3 },
                                        { type: 'text', text: payload.location, size: 'sm', color: '#1E293B', flex: 7, wrap: true },
                                    ],
                                }] : []),
                        ],
                    },
                ],
            },
            footer: {
                type: 'box',
                layout: 'vertical',
                paddingAll: '20px',
                backgroundColor: '#F8FAFC',
                spacing: 'md',
                contents: [
                    ...(actionButtons.length > 0 ? [{
                            type: 'box',
                            layout: 'horizontal',
                            spacing: 'sm',
                            contents: actionButtons,
                        }] : []),
                    {
                        type: 'box',
                        layout: 'horizontal',
                        contents: [
                            { type: 'text', text: formattedDate, size: 'xxs', color: '#94A3B8' },
                            { type: 'text', text: 'ระบบแจ้งซ่อม', size: 'xxs', color: '#CBD5E1', align: 'end', weight: 'bold' },
                        ],
                    },
                ],
            },
        };
    }
    async notifyRepairTicketStatusUpdate(userId, payload) {
        const lineLink = await this.getVerifiedLineLink(userId);
        if (!lineLink)
            return { success: false };
        const flexMessage = {
            type: 'flex',
            altText: `อัปเดตสถานะ ${payload.ticketCode}`,
            contents: this.createStatusUpdateFlex(payload),
        };
        try {
            await this.lineOAService.sendMessage(lineLink.lineUserId, flexMessage);
            await this.saveNotificationLog(lineLink.lineUserId, {
                type: 'REPAIR_STATUS_UPDATE',
                title: `อัปเดตงาน ${payload.ticketCode}`,
                message: payload.remark || payload.status,
            }, NotificationStatus.SENT);
            return { success: true };
        }
        catch (error) {
            this.logger.error(error.message);
            return { success: false };
        }
    }
    async notifyReporterDirectly(lineUserId, payload) {
        try {
            const flexMessage = {
                type: 'flex',
                altText: `อัปเดตสถานะ ${payload.ticketCode}`,
                contents: this.createReporterFlexMessage(payload),
            };
            await this.lineOAService.sendMessage(lineUserId, flexMessage);
            await this.saveNotificationLog(lineUserId, {
                type: 'REPAIR_REPORTER_UPDATE',
                title: `อัปเดต ${payload.ticketCode}`,
                message: payload.status,
            }, NotificationStatus.SENT);
            this.logger.log(`Sent notification to reporter ${lineUserId} for ${payload.ticketCode}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to notify reporter:`, error.message);
            return { success: false };
        }
    }
    createReporterFlexMessage(payload) {
        const statusConfig = this.getStatusConfig(payload.status);
        const urgencyConfig = this.getUrgencyConfig(payload.urgency);
        const formattedDate = new Intl.DateTimeFormat('th-TH', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
            timeZone: 'Asia/Bangkok',
        }).format(payload.createdAt);
        return {
            type: 'bubble',
            size: 'mega',
            header: {
                type: 'box',
                layout: 'vertical',
                backgroundColor: statusConfig.color,
                paddingAll: '20px',
                contents: [
                    {
                        type: 'box',
                        layout: 'horizontal',
                        alignItems: 'center',
                        contents: [
                            { type: 'text', text: 'สถานะการแจ้งซ่อม', color: '#FFFFFFCC', size: 'xs', weight: 'bold', flex: 1 },
                            {
                                type: 'box',
                                layout: 'vertical',
                                backgroundColor: '#FFFFFF33',
                                cornerRadius: 'xl',
                                paddingAll: '4px',
                                paddingStart: '12px',
                                paddingEnd: '12px',
                                flex: 0,
                                contents: [{ type: 'text', text: urgencyConfig.text, color: '#FFFFFF', size: 'xxs', weight: 'bold' }],
                            },
                        ],
                    },
                    { type: 'text', text: statusConfig.text, color: '#FFFFFF', size: 'xxl', weight: 'bold', margin: 'sm' },
                ],
            },
            hero: payload.imageUrl ? {
                type: 'image',
                url: payload.imageUrl,
                size: 'full',
                aspectRatio: '20:13',
                aspectMode: 'cover',
            } : undefined,
            body: {
                type: 'box',
                layout: 'vertical',
                paddingAll: '20px',
                backgroundColor: '#FFFFFF',
                contents: [
                    {
                        type: 'box',
                        layout: 'horizontal',
                        contents: [
                            { type: 'text', text: 'หมายเลขงาน', size: 'sm', color: '#64748B', flex: 4 },
                            { type: 'text', text: payload.ticketCode, size: 'sm', color: '#1E293B', weight: 'bold', flex: 6, align: 'end' },
                        ],
                    },
                    { type: 'separator', margin: 'lg', color: '#F1F5F9' },
                    {
                        type: 'box',
                        layout: 'vertical',
                        margin: 'lg',
                        spacing: 'xs',
                        contents: [
                            { type: 'text', text: 'ปัญหาที่แจ้ง', size: 'xs', color: '#64748B', weight: 'bold' },
                            { type: 'text', text: payload.problemTitle, size: 'md', weight: 'bold', color: '#1E293B', wrap: true },
                        ],
                    },
                    ...(payload.description && payload.description !== payload.problemTitle ? [{
                            type: 'box',
                            layout: 'vertical',
                            margin: 'md',
                            paddingAll: '12px',
                            backgroundColor: '#F8FAFC',
                            cornerRadius: 'md',
                            contents: [
                                { type: 'text', text: 'รายละเอียด', size: 'xs', color: '#64748B', weight: 'bold' },
                                { type: 'text', text: payload.description, size: 'sm', color: '#334155', wrap: true, margin: 'xs' },
                            ],
                        }] : []),
                    ...(payload.remark ? [{
                            type: 'box',
                            layout: 'vertical',
                            margin: 'lg',
                            backgroundColor: '#FFF7ED',
                            cornerRadius: 'md',
                            paddingAll: '12px',
                            borderColor: '#FED7AA',
                            borderWidth: '1px',
                            contents: [
                                { type: 'text', text: 'แจ้งจากเจ้าหน้าที่', size: 'xs', color: '#9A3412', weight: 'bold' },
                                { type: 'text', text: payload.remark, size: 'sm', color: '#7C2D12', wrap: true, margin: 'xs' },
                            ],
                        }] : []),
                ],
            },
            footer: {
                type: 'box',
                layout: 'horizontal',
                backgroundColor: '#F8FAFC',
                paddingAll: '16px',
                justifyContent: 'space-between',
                contents: [
                    { type: 'text', text: `แจ้งเมื่อ ${formattedDate}`, size: 'xxs', color: '#94A3B8' },
                    { type: 'text', text: 'ระบบแจ้งซ่อม', size: 'xxs', color: '#CBD5E1', weight: 'bold', align: 'end' },
                ],
            },
        };
    }
    async getVerifiedLineLink(userId) {
        const link = await this.prisma.lineOALink.findUnique({ where: { userId } });
        return (link && link.status === 'VERIFIED' && link.lineUserId) ? link : null;
    }
    async saveNotificationLog(lineUserId, payload, status, errorMessage) {
        return this.prisma.lineNotification.create({
            data: {
                lineUserId,
                type: payload.type ?? '',
                title: payload.title ?? '',
                message: payload.message ?? '',
                status,
                errorMessage,
            },
        });
    }
    async logFailure(userId, payload, error) {
        const link = await this.prisma.lineOALink.findUnique({ where: { userId } });
        if (link?.lineUserId) {
            await this.saveNotificationLog(link.lineUserId, payload, NotificationStatus.FAILED, error);
        }
    }
    createDefaultTextMessage(payload) {
        return {
            type: 'text',
            text: `${payload.title}\n\n${payload.message}${payload.actionUrl ? `\n\n${payload.actionUrl}` : ''}`,
        };
    }
    createRepairTicketFlex(payload) {
        const urgency = this.getUrgencyConfig(payload.urgency);
        const formattedDate = new Intl.DateTimeFormat('th-TH', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
            timeZone: 'Asia/Bangkok',
        }).format(new Date(payload.createdAt));
        let frontendUrl = process.env.FRONTEND_URL || 'https://trritrp.vercel.app';
        try {
            frontendUrl = new URL(frontendUrl).origin;
        }
        catch (e) { }
        const actionButtons = [];
        if (payload.reporterPhone) {
            actionButtons.push({
                type: 'button',
                action: { type: 'uri', label: 'โทรหาผู้แจ้ง', uri: `tel:${payload.reporterPhone}` },
                style: 'primary',
                height: 'sm',
                color: '#63DC75',
            });
        }
        if (payload.ticketCode) {
            actionButtons.push({
                type: 'button',
                action: { type: 'uri', label: 'จัดการงาน', uri: `${frontendUrl}/login/admin?ticketCode=${payload.ticketCode}` },
                style: 'primary',
                height: 'sm',
                color: '#2563EB',
            });
        }
        return {
            type: 'bubble',
            size: 'mega',
            header: {
                type: 'box',
                layout: 'vertical',
                backgroundColor: COLORS.HEADER_DARK,
                paddingAll: '20px',
                contents: [
                    {
                        type: 'box',
                        layout: 'horizontal',
                        alignItems: 'center',
                        contents: [
                            { type: 'text', text: 'แจ้งซ่อมใหม่', color: '#FFFFFF', weight: 'bold', size: 'lg', flex: 1 },
                            {
                                type: 'box',
                                layout: 'vertical',
                                backgroundColor: urgency.color,
                                cornerRadius: 'xl',
                                paddingAll: '4px',
                                paddingStart: '10px',
                                paddingEnd: '10px',
                                flex: 0,
                                contents: [{ type: 'text', text: urgency.text, color: '#FFFFFF', size: 'xxs', weight: 'bold' }],
                            },
                        ],
                    },
                    { type: 'text', text: payload.ticketCode, color: '#94A3B8', size: 'sm', margin: 'sm', weight: 'bold' },
                ],
            },
            hero: payload.imageUrl ? {
                type: 'image',
                url: payload.imageUrl,
                size: 'full',
                aspectRatio: '20:13',
                aspectMode: 'cover',
            } : undefined,
            body: {
                type: 'box',
                layout: 'vertical',
                paddingAll: '20px',
                backgroundColor: '#FFFFFF',
                contents: [
                    {
                        type: 'box',
                        layout: 'vertical',
                        spacing: 'xs',
                        contents: [
                            { type: 'text', text: 'ปัญหาที่แจ้ง', size: 'xs', color: '#64748B', weight: 'bold' },
                            { type: 'text', text: payload.problemTitle, size: 'md', weight: 'bold', color: '#1E293B', wrap: true },
                        ],
                    },
                    ...(payload.problemDescription ? [{
                            type: 'box',
                            layout: 'vertical',
                            margin: 'md',
                            paddingAll: '12px',
                            backgroundColor: '#F8FAFC',
                            cornerRadius: 'md',
                            contents: [
                                { type: 'text', text: 'รายละเอียด', size: 'xs', color: '#64748B', weight: 'bold' },
                                { type: 'text', text: payload.problemDescription, size: 'sm', color: '#334155', wrap: true, margin: 'xs' },
                            ],
                        }] : []),
                    { type: 'separator', margin: 'xl', color: '#F1F5F9' },
                    {
                        type: 'box',
                        layout: 'vertical',
                        margin: 'xl',
                        spacing: 'sm',
                        contents: [
                            {
                                type: 'box', layout: 'horizontal', contents: [
                                    { type: 'text', text: 'ผู้แจ้ง', size: 'sm', color: '#64748B', flex: 3 },
                                    { type: 'text', text: payload.reporterName, size: 'sm', color: '#1E293B', weight: 'bold', flex: 7, wrap: true },
                                ],
                            },
                            {
                                type: 'box', layout: 'horizontal', contents: [
                                    { type: 'text', text: 'แผนก', size: 'sm', color: '#64748B', flex: 3 },
                                    { type: 'text', text: payload.department, size: 'sm', color: '#1E293B', flex: 7, wrap: true },
                                ],
                            },
                            {
                                type: 'box', layout: 'horizontal', contents: [
                                    { type: 'text', text: 'สถานที่', size: 'sm', color: '#64748B', flex: 3 },
                                    { type: 'text', text: payload.location, size: 'sm', color: '#1E293B', flex: 7, wrap: true },
                                ],
                            },
                        ],
                    },
                ],
            },
            footer: {
                type: 'box',
                layout: 'vertical',
                paddingAll: '20px',
                backgroundColor: '#F8FAFC',
                spacing: 'md',
                contents: [
                    ...(actionButtons.length > 0 ? [{
                            type: 'box',
                            layout: 'horizontal',
                            spacing: 'sm',
                            contents: actionButtons,
                        }] : []),
                    {
                        type: 'box',
                        layout: 'horizontal',
                        contents: [
                            { type: 'text', text: formattedDate, size: 'xxs', color: '#94A3B8' },
                            { type: 'text', text: 'ระบบแจ้งซ่อม', size: 'xxs', color: '#CBD5E1', align: 'end', weight: 'bold' },
                        ],
                    },
                ],
            },
        };
    }
    createTechnicianAssignmentFlex(payload, actionText) {
        const urgency = this.getUrgencyConfig(payload.urgency);
        const formattedDate = new Intl.DateTimeFormat('th-TH', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
            timeZone: 'Asia/Bangkok',
        }).format(new Date());
        let frontendUrl = process.env.FRONTEND_URL || 'https://trritrp.vercel.app';
        try {
            frontendUrl = new URL(frontendUrl).origin;
        }
        catch (e) { }
        const actionButtons = [];
        if (payload.reporterPhone) {
            actionButtons.push({
                type: 'button',
                action: { type: 'uri', label: 'โทรหาผู้แจ้ง', uri: `tel:${payload.reporterPhone}` },
                style: 'primary',
                height: 'sm',
                color: '#63DC75',
            });
        }
        if (payload.ticketCode) {
            actionButtons.push({
                type: 'button',
                action: { type: 'uri', label: 'จัดการงาน', uri: `${frontendUrl}/login/admin?ticketCode=${payload.ticketCode}` },
                style: 'primary',
                height: 'sm',
                color: '#2563EB',
            });
        }
        return {
            type: 'bubble',
            size: 'mega',
            header: {
                type: 'box',
                layout: 'vertical',
                backgroundColor: COLORS.HEADER_DARK,
                paddingAll: '20px',
                contents: [
                    {
                        type: 'box',
                        layout: 'horizontal',
                        alignItems: 'center',
                        contents: [
                            { type: 'text', text: actionText, color: '#FFFFFF', weight: 'bold', size: 'lg', flex: 1, wrap: true },
                            {
                                type: 'box',
                                layout: 'vertical',
                                backgroundColor: urgency.color,
                                cornerRadius: 'xl',
                                paddingAll: '4px',
                                paddingStart: '10px',
                                paddingEnd: '10px',
                                flex: 0,
                                contents: [{ type: 'text', text: urgency.text, color: '#FFFFFF', size: 'xxs', weight: 'bold' }],
                            },
                        ],
                    },
                    { type: 'text', text: payload.ticketCode, color: '#94A3B8', size: 'sm', margin: 'sm', weight: 'bold' },
                ],
            },
            hero: payload.imageUrl ? {
                type: 'image',
                url: payload.imageUrl,
                size: 'full',
                aspectRatio: '20:13',
                aspectMode: 'cover',
            } : undefined,
            body: {
                type: 'box',
                layout: 'vertical',
                paddingAll: '20px',
                backgroundColor: '#FFFFFF',
                contents: [
                    {
                        type: 'box',
                        layout: 'vertical',
                        spacing: 'xs',
                        contents: [
                            { type: 'text', text: 'ปัญหาที่แจ้ง', size: 'xs', color: '#64748B', weight: 'bold' },
                            { type: 'text', text: payload.problemTitle, size: 'md', weight: 'bold', color: '#1E293B', wrap: true },
                        ],
                    },
                    ...(payload.adminNote ? [{
                            type: 'box',
                            layout: 'vertical',
                            margin: 'md',
                            paddingAll: '12px',
                            backgroundColor: '#FFF7ED',
                            cornerRadius: 'md',
                            borderColor: '#FED7AA',
                            borderWidth: '1px',
                            contents: [
                                { type: 'text', text: 'หมายเหตุจากแอดมิน', size: 'xs', color: '#9A3412', weight: 'bold' },
                                { type: 'text', text: payload.adminNote, size: 'sm', color: '#7C2D12', wrap: true, margin: 'xs' },
                            ],
                        }] : []),
                    { type: 'separator', margin: 'xl', color: '#F1F5F9' },
                    {
                        type: 'box',
                        layout: 'vertical',
                        margin: 'xl',
                        spacing: 'sm',
                        contents: [
                            {
                                type: 'box', layout: 'horizontal', contents: [
                                    { type: 'text', text: 'ผู้แจ้ง', size: 'sm', color: '#64748B', flex: 3 },
                                    { type: 'text', text: payload.reporterName, size: 'sm', color: '#1E293B', weight: 'bold', flex: 7, wrap: true },
                                ],
                            },
                            ...(payload.department ? [{
                                    type: 'box', layout: 'horizontal', contents: [
                                        { type: 'text', text: 'แผนก', size: 'sm', color: '#64748B', flex: 3 },
                                        { type: 'text', text: payload.department, size: 'sm', color: '#1E293B', flex: 7, wrap: true },
                                    ],
                                }] : []),
                            ...(payload.location ? [{
                                    type: 'box', layout: 'horizontal', contents: [
                                        { type: 'text', text: 'สถานที่', size: 'sm', color: '#64748B', flex: 3 },
                                        { type: 'text', text: payload.location, size: 'sm', color: '#1E293B', flex: 7, wrap: true },
                                    ],
                                }] : []),
                        ],
                    },
                ],
            },
            footer: {
                type: 'box',
                layout: 'vertical',
                paddingAll: '20px',
                backgroundColor: '#F8FAFC',
                spacing: 'md',
                contents: [
                    ...(actionButtons.length > 0 ? [{
                            type: 'box',
                            layout: 'horizontal',
                            spacing: 'sm',
                            contents: actionButtons,
                        }] : []),
                    {
                        type: 'box',
                        layout: 'horizontal',
                        contents: [
                            { type: 'text', text: formattedDate, size: 'xxs', color: '#94A3B8' },
                            { type: 'text', text: 'ระบบแจ้งซ่อม', size: 'xxs', color: '#CBD5E1', align: 'end', weight: 'bold' },
                        ],
                    },
                ],
            },
        };
    }
    createTechnicianCompletionFlex(payload) {
        const formattedDate = new Intl.DateTimeFormat('th-TH', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
            timeZone: 'Asia/Bangkok',
        }).format(payload.completedAt || new Date());
        let frontendUrl = process.env.FRONTEND_URL || 'https://trritrp.vercel.app';
        try {
            frontendUrl = new URL(frontendUrl).origin;
        }
        catch (e) { }
        const actionButtons = [];
        if (payload.ticketCode) {
            actionButtons.push({
                type: 'button',
                action: { type: 'uri', label: 'ดูรายละเอียดงาน', uri: `${frontendUrl}/login/admin?ticketCode=${payload.ticketCode}` },
                style: 'primary',
                height: 'sm',
                color: '#059669',
            });
        }
        return {
            type: 'bubble',
            size: 'mega',
            header: {
                type: 'box',
                layout: 'vertical',
                backgroundColor: '#059669',
                paddingAll: '20px',
                contents: [
                    {
                        type: 'box',
                        layout: 'horizontal',
                        alignItems: 'center',
                        contents: [
                            { type: 'text', text: 'ปิดงานเรียบร้อย', color: '#FFFFFF', weight: 'bold', size: 'lg', flex: 1, wrap: true },
                            {
                                type: 'box',
                                layout: 'vertical',
                                backgroundColor: '#DCFCE7',
                                cornerRadius: 'xl',
                                paddingAll: '4px',
                                paddingStart: '10px',
                                paddingEnd: '10px',
                                flex: 0,
                                contents: [{ type: 'text', text: 'เสร็จสิ้น', color: '#166534', size: 'xxs', weight: 'bold' }],
                            },
                        ],
                    },
                    { type: 'text', text: payload.ticketCode, color: '#DCFCE7CC', size: 'sm', margin: 'sm', weight: 'bold' },
                ],
            },
            hero: payload.problemImageUrl ? {
                type: 'image',
                url: payload.problemImageUrl,
                size: 'full',
                aspectRatio: '20:13',
                aspectMode: 'cover',
            } : undefined,
            body: {
                type: 'box',
                layout: 'vertical',
                paddingAll: '20px',
                backgroundColor: '#FFFFFF',
                contents: [
                    {
                        type: 'box',
                        layout: 'vertical',
                        spacing: 'xs',
                        contents: [
                            { type: 'text', text: 'งานซ่อม', size: 'xs', color: '#64748B', weight: 'bold' },
                            { type: 'text', text: payload.problemTitle, size: 'md', weight: 'bold', color: '#1E293B', wrap: true },
                        ],
                    },
                    ...(payload.completionNote ? [{
                            type: 'box',
                            layout: 'vertical',
                            margin: 'md',
                            paddingAll: '12px',
                            backgroundColor: '#F0FDF4',
                            cornerRadius: 'md',
                            borderColor: '#BBF7D0',
                            borderWidth: '1px',
                            contents: [
                                { type: 'text', text: 'สรุปการปิดงาน', size: 'xs', color: '#15803D', weight: 'bold' },
                                { type: 'text', text: payload.completionNote, size: 'sm', color: '#166534', wrap: true, margin: 'xs' },
                            ],
                        }] : []),
                    { type: 'separator', margin: 'xl', color: '#F1F5F9' },
                    {
                        type: 'box',
                        layout: 'vertical',
                        margin: 'xl',
                        spacing: 'sm',
                        contents: [
                            {
                                type: 'box', layout: 'horizontal', contents: [
                                    { type: 'text', text: 'ผู้แจ้ง', size: 'sm', color: '#64748B', flex: 3 },
                                    { type: 'text', text: payload.reporterName, size: 'sm', color: '#1E293B', weight: 'bold', flex: 7, wrap: true },
                                ],
                            },
                            {
                                type: 'box', layout: 'horizontal', contents: [
                                    { type: 'text', text: 'แผนก', size: 'sm', color: '#64748B', flex: 3 },
                                    { type: 'text', text: payload.department || '-', size: 'sm', color: '#1E293B', flex: 7, wrap: true },
                                ],
                            },
                            {
                                type: 'box', layout: 'horizontal', contents: [
                                    { type: 'text', text: 'สถานที่', size: 'sm', color: '#64748B', flex: 3 },
                                    { type: 'text', text: payload.location || '-', size: 'sm', color: '#1E293B', flex: 7, wrap: true },
                                ],
                            },
                        ],
                    },
                ],
            },
            footer: {
                type: 'box',
                layout: 'vertical',
                paddingAll: '20px',
                backgroundColor: '#F8FAFC',
                spacing: 'md',
                contents: [
                    ...(actionButtons.length > 0 ? [{
                            type: 'box',
                            layout: 'horizontal',
                            spacing: 'sm',
                            contents: actionButtons,
                        }] : []),
                    {
                        type: 'box',
                        layout: 'horizontal',
                        contents: [
                            { type: 'text', text: `ปิดงานเมื่อ ${formattedDate}`, size: 'xxs', color: '#94A3B8' },
                            { type: 'text', text: 'ระบบแจ้งซ่อม', size: 'xxs', color: '#CBD5E1', align: 'end', weight: 'bold' },
                        ],
                    },
                ],
            },
        };
    }
    createTechnicianCancellationFlex(payload) {
        const formattedDate = new Intl.DateTimeFormat('th-TH', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
            timeZone: 'Asia/Bangkok',
        }).format(payload.cancelledAt || new Date());
        let frontendUrl = process.env.FRONTEND_URL || 'https://trritrp.vercel.app';
        try {
            frontendUrl = new URL(frontendUrl).origin;
        }
        catch (e) { }
        const actionButtons = [];
        if (payload.ticketCode) {
            actionButtons.push({
                type: 'button',
                action: { type: 'uri', label: 'ดูรายละเอียดงาน', uri: `${frontendUrl}/login/admin?ticketCode=${payload.ticketCode}` },
                style: 'primary',
                height: 'sm',
                color: '#DC2626',
            });
        }
        return {
            type: 'bubble',
            size: 'mega',
            header: {
                type: 'box',
                layout: 'vertical',
                backgroundColor: '#DC2626',
                paddingAll: '20px',
                contents: [
                    {
                        type: 'box',
                        layout: 'horizontal',
                        alignItems: 'center',
                        contents: [
                            { type: 'text', text: 'ยกเลิกงานซ่อม', color: '#FFFFFF', weight: 'bold', size: 'lg', flex: 1, wrap: true },
                            {
                                type: 'box',
                                layout: 'vertical',
                                backgroundColor: '#FEE2E2',
                                cornerRadius: 'xl',
                                paddingAll: '4px',
                                paddingStart: '10px',
                                paddingEnd: '10px',
                                flex: 0,
                                contents: [{ type: 'text', text: 'ยกเลิก', color: '#991B1B', size: 'xxs', weight: 'bold' }],
                            },
                        ],
                    },
                    { type: 'text', text: payload.ticketCode, color: '#FEE2E2CC', size: 'sm', margin: 'sm', weight: 'bold' },
                ],
            },
            hero: payload.problemImageUrl ? {
                type: 'image',
                url: payload.problemImageUrl,
                size: 'full',
                aspectRatio: '20:13',
                aspectMode: 'cover',
            } : undefined,
            body: {
                type: 'box',
                layout: 'vertical',
                paddingAll: '20px',
                backgroundColor: '#FFFFFF',
                contents: [
                    {
                        type: 'box',
                        layout: 'vertical',
                        spacing: 'xs',
                        contents: [
                            { type: 'text', text: 'งานซ่อม', size: 'xs', color: '#64748B', weight: 'bold' },
                            { type: 'text', text: payload.problemTitle, size: 'md', weight: 'bold', color: '#1E293B', wrap: true },
                        ],
                    },
                    ...(payload.cancelNote ? [{
                            type: 'box',
                            layout: 'vertical',
                            margin: 'md',
                            paddingAll: '12px',
                            backgroundColor: '#FEF2F2',
                            cornerRadius: 'md',
                            borderColor: '#FECACA',
                            borderWidth: '1px',
                            contents: [
                                { type: 'text', text: 'เหตุผลการยกเลิก', size: 'xs', color: '#B91C1C', weight: 'bold' },
                                { type: 'text', text: payload.cancelNote, size: 'sm', color: '#991B1B', wrap: true, margin: 'xs' },
                            ],
                        }] : []),
                    { type: 'separator', margin: 'xl', color: '#F1F5F9' },
                    {
                        type: 'box',
                        layout: 'vertical',
                        margin: 'xl',
                        spacing: 'sm',
                        contents: [
                            {
                                type: 'box', layout: 'horizontal', contents: [
                                    { type: 'text', text: 'ผู้แจ้ง', size: 'sm', color: '#64748B', flex: 3 },
                                    { type: 'text', text: payload.reporterName, size: 'sm', color: '#1E293B', weight: 'bold', flex: 7, wrap: true },
                                ],
                            },
                            {
                                type: 'box', layout: 'horizontal', contents: [
                                    { type: 'text', text: 'แผนก', size: 'sm', color: '#64748B', flex: 3 },
                                    { type: 'text', text: payload.department || '-', size: 'sm', color: '#1E293B', flex: 7, wrap: true },
                                ],
                            },
                            {
                                type: 'box', layout: 'horizontal', contents: [
                                    { type: 'text', text: 'สถานที่', size: 'sm', color: '#64748B', flex: 3 },
                                    { type: 'text', text: payload.location || '-', size: 'sm', color: '#1E293B', flex: 7, wrap: true },
                                ],
                            },
                        ],
                    },
                ],
            },
            footer: {
                type: 'box',
                layout: 'vertical',
                paddingAll: '20px',
                backgroundColor: '#F8FAFC',
                spacing: 'md',
                contents: [
                    ...(actionButtons.length > 0 ? [{
                            type: 'box',
                            layout: 'horizontal',
                            spacing: 'sm',
                            contents: actionButtons,
                        }] : []),
                    {
                        type: 'box',
                        layout: 'horizontal',
                        contents: [
                            { type: 'text', text: `ยกเลิกเมื่อ ${formattedDate}`, size: 'xxs', color: '#94A3B8' },
                            { type: 'text', text: 'ระบบแจ้งซ่อม', size: 'xxs', color: '#CBD5E1', align: 'end', weight: 'bold' },
                        ],
                    },
                ],
            },
        };
    }
    createStatusUpdateFlex(payload) {
        const config = this.getStatusConfig(payload.status);
        const formattedDate = new Intl.DateTimeFormat('th-TH', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
            timeZone: 'Asia/Bangkok',
        }).format(payload.updatedAt || new Date());
        const hasTechnician = payload.technicianNames && payload.technicianNames.length > 0;
        return {
            type: 'bubble',
            size: 'mega',
            header: {
                type: 'box',
                layout: 'vertical',
                backgroundColor: config.color,
                paddingAll: '20px',
                contents: [
                    {
                        type: 'text',
                        text: 'อัปเดตสถานะงาน',
                        color: '#FFFFFFCC',
                        size: 'xs',
                        weight: 'bold',
                    },
                    {
                        type: 'text',
                        text: config.text,
                        color: '#FFFFFF',
                        size: 'xxl',
                        weight: 'bold',
                        margin: 'sm',
                        wrap: true,
                    },
                ],
            },
            body: {
                type: 'box',
                layout: 'vertical',
                backgroundColor: '#FFFFFF',
                paddingAll: '20px',
                contents: [
                    {
                        type: 'box',
                        layout: 'horizontal',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        contents: [
                            {
                                type: 'text',
                                text: 'หมายเลขงาน',
                                color: '#94A3B8',
                                size: 'xs',
                                weight: 'bold',
                            },
                            {
                                type: 'text',
                                text: payload.ticketCode,
                                color: '#1E293B',
                                size: 'md',
                                weight: 'bold',
                                align: 'end',
                            },
                        ],
                    },
                    {
                        type: 'separator',
                        margin: 'lg',
                        color: '#F1F5F9',
                    },
                    {
                        type: 'box',
                        layout: 'vertical',
                        margin: 'lg',
                        spacing: 'sm',
                        contents: [
                            {
                                type: 'text',
                                text: 'แจ้งเรื่อง',
                                color: '#94A3B8',
                                size: 'xs',
                                weight: 'bold',
                            },
                            {
                                type: 'text',
                                text: payload.problemTitle || '-',
                                color: '#1E293B',
                                size: 'sm',
                                weight: 'regular',
                                wrap: true,
                            },
                        ],
                    },
                    {
                        type: 'box',
                        layout: 'vertical',
                        margin: 'lg',
                        spacing: 'sm',
                        contents: [
                            {
                                type: 'text',
                                text: 'ผู้รับผิดชอบ',
                                color: '#94A3B8',
                                size: 'xs',
                                weight: 'bold',
                            },
                            {
                                type: 'text',
                                text: hasTechnician
                                    ? payload.technicianNames.join(', ')
                                    : 'กำลังตรวจสอบ',
                                color: hasTechnician ? '#1E293B' : '#F59E0B',
                                size: 'sm',
                                weight: 'regular',
                                wrap: true,
                            },
                        ],
                    },
                    ...(payload.remark
                        ? [
                            {
                                type: 'box',
                                layout: 'vertical',
                                margin: 'lg',
                                backgroundColor: '#FFF7ED',
                                cornerRadius: 'md',
                                paddingAll: '12px',
                                borderColor: '#FED7AA',
                                borderWidth: '1px',
                                contents: [
                                    {
                                        type: 'text',
                                        text: 'หมายเหตุเพิ่มเติม',
                                        color: '#9A3412',
                                        size: 'xs',
                                        weight: 'bold',
                                    },
                                    {
                                        type: 'text',
                                        text: payload.remark,
                                        color: '#7C2D12',
                                        size: 'sm',
                                        wrap: true,
                                        margin: 'xs',
                                    },
                                ],
                            },
                        ]
                        : []),
                ],
            },
            footer: {
                type: 'box',
                layout: 'horizontal',
                backgroundColor: '#F8FAFC',
                paddingAll: '16px',
                justifyContent: 'space-between',
                contents: [
                    {
                        type: 'text',
                        text: formattedDate,
                        color: '#94A3B8',
                        size: 'xxs',
                    },
                    {
                        type: 'text',
                        text: 'ระบบแจ้งซ่อม',
                        color: '#CBD5E1',
                        size: 'xxs',
                        weight: 'bold',
                        align: 'end',
                    },
                ],
            },
            styles: {
                footer: {
                    separator: false,
                },
            },
        };
    }
    createInfoRow(icon, label, value, bold = false) {
        return {
            type: 'box', layout: 'horizontal', spacing: 'sm',
            contents: [
                { type: 'text', text: `${icon} ${label}`, size: 'xs', color: COLORS.LABEL, flex: 3 },
                { type: 'text', text: value, size: 'xs', color: COLORS.VALUE, flex: 5, weight: bold ? 'bold' : 'regular', wrap: true },
            ],
        };
    }
    createCheckStatusCarousel(tickets, page = 1, pageSize = 3) {
        let frontendUrl = process.env.FRONTEND_URL || 'https://trritrp.vercel.app';
        try {
            frontendUrl = new URL(frontendUrl).origin;
        }
        catch (e) { }
        const totalTickets = tickets.length;
        const totalPages = Math.max(Math.ceil(totalTickets / pageSize), 1);
        const currentPage = Math.min(Math.max(page, 1), totalPages);
        const startIdx = (currentPage - 1) * pageSize;
        const displayTickets = tickets.slice(startIdx, startIdx + pageSize);
        const urgencyThemes = {
            NORMAL: { color: '#10B981', label: 'ปกติ' },
            URGENT: { color: '#F59E0B', label: 'ด่วน' },
            CRITICAL: { color: '#EF4444', label: 'ด่วนที่สุด' },
        };
        const ticketCards = [];
        displayTickets.forEach((ticket) => {
            const statusCfg = this.getStatusConfig(ticket.status);
            const theme = urgencyThemes[ticket.urgency] || urgencyThemes.NORMAL;
            const dateStr = new Intl.DateTimeFormat('th-TH', {
                day: 'numeric', month: 'short', year: '2-digit', timeZone: 'Asia/Bangkok',
            }).format(new Date(ticket.createdAt));
            ticketCards.push({
                type: 'box',
                layout: 'horizontal',
                backgroundColor: '#FFFFFF',
                cornerRadius: 'xl',
                borderWidth: '1px',
                borderColor: '#F1F5F9',
                margin: 'md',
                paddingAll: '0px',
                contents: [
                    {
                        type: 'box',
                        layout: 'vertical',
                        width: '6px',
                        backgroundColor: theme.color,
                        contents: [{ type: 'filler' }],
                    },
                    {
                        type: 'box',
                        layout: 'vertical',
                        flex: 1,
                        paddingAll: '16px',
                        spacing: 'xs',
                        contents: [
                            {
                                type: 'box',
                                layout: 'horizontal',
                                alignItems: 'center',
                                contents: [
                                    {
                                        type: 'text',
                                        text: ticket.ticketCode,
                                        size: 'xxs',
                                        color: '#94A3B8',
                                        weight: 'bold',
                                        flex: 1
                                    },
                                    {
                                        type: 'text',
                                        text: dateStr,
                                        size: 'xxs',
                                        color: '#94A3B8',
                                        align: 'end',
                                        flex: 0
                                    },
                                ],
                            },
                            {
                                type: 'text',
                                text: ticket.problemTitle,
                                size: 'sm',
                                color: '#1E293B',
                                weight: 'bold',
                                wrap: true,
                                maxLines: 2,
                                margin: 'xs'
                            },
                            {
                                type: 'box',
                                layout: 'horizontal',
                                alignItems: 'center',
                                margin: 'md',
                                contents: [
                                    {
                                        type: 'box',
                                        layout: 'vertical',
                                        backgroundColor: statusCfg.color + '15',
                                        cornerRadius: 'xl',
                                        paddingAll: '4px',
                                        paddingStart: '12px',
                                        paddingEnd: '12px',
                                        flex: 0,
                                        contents: [
                                            {
                                                type: 'text',
                                                text: statusCfg.text,
                                                color: statusCfg.color,
                                                size: 'xxs',
                                                weight: 'bold'
                                            }
                                        ],
                                    },
                                    { type: 'filler' },
                                    {
                                        type: 'text',
                                        text: 'ดูข้อมูล ›',
                                        size: 'xs',
                                        color: '#3B82F6',
                                        weight: 'bold',
                                        align: 'end',
                                        action: {
                                            type: 'uri',
                                            uri: `${frontendUrl}/repairs/track/${ticket.ticketCode}`,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
        });
        const pagination = [{ type: 'filler' }];
        pagination.push({
            type: 'text',
            text: `หน้า ${currentPage} จาก ${totalPages}`,
            size: 'xxs',
            color: '#94A3B8',
            flex: 0,
            gravity: 'center'
        });
        if (currentPage > 1) {
            pagination.push({
                type: 'button',
                action: {
                    type: 'postback',
                    label: 'ก่อนหน้า',
                    data: `action=check_status&page=${currentPage - 1}`,
                    displayText: `ไปหน้าที่ ${currentPage - 1}`,
                },
                style: 'link',
                height: 'sm',
                flex: 0,
            });
        }
        if (currentPage < totalPages) {
            pagination.push({
                type: 'button',
                action: {
                    type: 'postback',
                    label: 'ถัดไป',
                    data: `action=check_status&page=${currentPage + 1}`,
                    displayText: `ไปหน้าที่ ${currentPage + 1}`,
                },
                style: 'link',
                height: 'sm',
                flex: 0,
            });
        }
        return {
            type: 'bubble',
            size: 'mega',
            header: {
                type: 'box',
                layout: 'vertical',
                backgroundColor: '#FFFFFF',
                paddingAll: '20px',
                paddingBottom: '10px',
                contents: [
                    {
                        type: 'text',
                        text: 'รายการแจ้งซ่อมของคุณ',
                        color: '#0F172A',
                        size: 'lg',
                        weight: 'bold',
                    },
                    {
                        type: 'box',
                        layout: 'horizontal',
                        margin: 'sm',
                        contents: [
                            { type: 'text', text: `พบทั้งหมด ${totalTickets} รายการ`, color: '#64748B', size: 'xs', flex: 1 },
                            { type: 'text', text: 'ล่าสุด', color: '#10B981', size: 'xs', weight: 'bold', align: 'end', flex: 0 },
                        ]
                    },
                    {
                        type: 'separator',
                        margin: 'md',
                        color: '#F1F5F9'
                    }
                ],
            },
            body: {
                type: 'box',
                layout: 'vertical',
                paddingAll: '12px',
                paddingTop: '0px',
                backgroundColor: '#FFFFFF',
                contents: [...ticketCards],
            },
            footer: {
                type: 'box',
                layout: 'horizontal',
                paddingAll: '12px',
                backgroundColor: '#FFFFFF',
                spacing: 'sm',
                alignItems: 'center',
                contents: pagination,
            },
        };
    }
    getUrgencyConfig(level) {
        return ({
            CRITICAL: { color: COLORS.CRITICAL, text: 'ด่วนที่สุด' },
            URGENT: { color: COLORS.URGENT, text: 'ด่วน' },
            NORMAL: { color: COLORS.NORMAL, text: 'ปกติ' },
        }[level] || { color: COLORS.NORMAL, text: 'ปกติ' });
    }
    getStatusConfig(status) {
        return ({
            PENDING: { color: COLORS.INFO, text: 'รอดำเนินการ' },
            ASSIGNED: { color: COLORS.INFO, text: 'มอบหมายแล้ว' },
            IN_PROGRESS: { color: COLORS.WARNING, text: 'กำลังดำเนินการ' },
            COMPLETED: { color: COLORS.SUCCESS, text: 'เสร็จสิ้น' },
            CANCELLED: { color: '#EF4444', text: 'ยกเลิก' },
        }[status] || { color: COLORS.PRIMARY, text: status });
    }
};
exports.LineOANotificationService = LineOANotificationService;
exports.LineOANotificationService = LineOANotificationService = LineOANotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        line_oa_service_1.LineOAService])
], LineOANotificationService);
//# sourceMappingURL=line-oa-notification.service.js.map