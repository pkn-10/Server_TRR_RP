import { PrismaService } from '../prisma/prisma.service';
import * as line from '@line/bot-sdk';
export declare class LineOAService {
    private readonly prisma;
    private readonly logger;
    private readonly lineClient;
    constructor(prisma: PrismaService);
    sendMessage(lineUserId: string, message: line.Message): Promise<{
        success: boolean;
    }>;
    sendMulticast(lineUserIds: string[], message: line.Message): Promise<{
        success: boolean;
        reason: string;
        count?: undefined;
    } | {
        success: boolean;
        count: number;
        reason?: undefined;
    }>;
    getNotifications(userId: number, limit?: number): Promise<{
        isLinked: boolean;
        data: never[];
        total?: undefined;
    } | {
        isLinked: boolean;
        data: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            status: import(".prisma/client").$Enums.LineNotificationStatus;
            lineUserId: string;
            type: string;
            message: string;
            retryCount: number;
            errorMessage: string | null;
        }[];
        total: number;
    }>;
    testConnection(): Promise<boolean>;
    getProfile(lineUserId: string): Promise<{
        displayName: string;
        pictureUrl: string | undefined;
    } | null>;
}
