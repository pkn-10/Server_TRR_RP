import { NotificationService } from './notification.service';
export declare class NotificationController {
    private notificationService;
    constructor(notificationService: NotificationService);
    getMyNotifications(req: any, limit?: string): Promise<{
        data: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            status: import(".prisma/client").$Enums.NotificationStatus;
            type: import(".prisma/client").$Enums.NotificationType;
            title: string;
            message: string;
            ticketId: number | null;
            actionUrl: string | null;
        }[];
        unreadCount: number;
        total: number;
    }>;
    getUnreadCount(req: any): Promise<{
        unreadCount: number;
    }>;
    markAsRead(id: number): Promise<{
        message: string;
        data: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            status: import(".prisma/client").$Enums.NotificationStatus;
            type: import(".prisma/client").$Enums.NotificationType;
            title: string;
            message: string;
            ticketId: number | null;
            actionUrl: string | null;
        };
    }>;
    markAllAsRead(req: any): Promise<{
        message: string;
    }>;
    deleteNotification(id: number): Promise<{
        message: string;
    }>;
    deleteAllNotifications(req: any): Promise<{
        message: string;
    }>;
}
