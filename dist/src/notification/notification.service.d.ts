import { PrismaService } from '../prisma/prisma.service';
export interface CreateNotificationDto {
    userId: number;
    type: string;
    title: string;
    message: string;
    ticketId?: number;
    actionUrl?: string;
}
export declare class NotificationService {
    private prisma;
    constructor(prisma: PrismaService);
    createNotification(data: CreateNotificationDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.NotificationStatus;
        userId: number;
        ticketId: number | null;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        actionUrl: string | null;
    }>;
    getUserNotifications(userId: number, limit?: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.NotificationStatus;
        userId: number;
        ticketId: number | null;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        actionUrl: string | null;
    }[]>;
    getUnreadCount(userId: number): Promise<number>;
    markAsRead(notificationId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.NotificationStatus;
        userId: number;
        ticketId: number | null;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        actionUrl: string | null;
    }>;
    markAllAsRead(userId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    deleteNotification(notificationId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.NotificationStatus;
        userId: number;
        ticketId: number | null;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        actionUrl: string | null;
    }>;
    deleteAllUserNotifications(userId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    notifyAdminTicketCreated(ticketId: number, ticketCode: string, userName: string): Promise<void>;
    notifyTicketAssigned(ticketId: number, ticketCode: string, userId: number, assignedBy: string): Promise<void>;
    notifyTicketStatusChanged(ticketId: number, ticketCode: string, userId: number, newStatus: string): Promise<void>;
}
