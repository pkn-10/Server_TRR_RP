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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationService = class NotificationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createNotification(data) {
        return await this.prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                title: data.title,
                message: data.message,
                ticketId: data.ticketId,
                actionUrl: data.actionUrl,
            },
        });
    }
    async getUserNotifications(userId, limit = 20) {
        return await this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async getUnreadCount(userId) {
        return await this.prisma.notification.count({
            where: {
                userId,
                status: 'UNREAD',
            },
        });
    }
    async markAsRead(notificationId) {
        return await this.prisma.notification.update({
            where: { id: notificationId },
            data: { status: 'READ' },
        });
    }
    async markAllAsRead(userId) {
        return await this.prisma.notification.updateMany({
            where: {
                userId,
                status: 'UNREAD',
            },
            data: { status: 'READ' },
        });
    }
    async deleteNotification(notificationId) {
        return await this.prisma.notification.delete({
            where: { id: notificationId },
        });
    }
    async deleteAllUserNotifications(userId) {
        return await this.prisma.notification.deleteMany({
            where: { userId },
        });
    }
    async notifyAdminTicketCreated(ticketId, ticketCode, userName) {
        const admins = await this.prisma.user.findMany({
            where: { role: 'ADMIN' },
        });
        for (const admin of admins) {
            await this.prisma.notification.create({
                data: {
                    userId: admin.id,
                    type: 'TICKET_CREATED',
                    title: 'งานใหม่ได้รับการสร้าง',
                    message: `${userName} ได้สร้างงานใหม่ ${ticketCode}`,
                    ticketId,
                    actionUrl: `/admin/repairs?ticket=${ticketCode}`,
                    status: 'UNREAD',
                },
            });
        }
    }
    async notifyTicketAssigned(ticketId, ticketCode, userId, assignedBy) {
        await this.prisma.notification.create({
            data: {
                userId,
                type: 'TICKET_ASSIGNED',
                title: 'มีงานถูกมอบหมายให้คุณ',
                message: `${assignedBy} ได้มอบหมายงานให้คุณ`,
                ticketId,
                actionUrl: `/admin/repairs/${ticketCode}`,
                status: 'UNREAD',
            },
        });
    }
    async notifyTicketStatusChanged(ticketId, ticketCode, userId, newStatus) {
        await this.prisma.notification.create({
            data: {
                userId,
                type: 'STATUS_CHANGED',
                title: 'สถานะงานเปลี่ยนแปลง',
                message: `สถานะของงานของคุณเปลี่ยนเป็น ${newStatus}`,
                ticketId,
                actionUrl: `/admin/repairs/${ticketCode}`,
                status: 'UNREAD',
            },
        });
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map