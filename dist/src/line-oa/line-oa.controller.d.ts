import type { Request } from 'express';
import { LineOAService } from './line-oa.service';
import { LineOALinkingService } from './line-oa-linking.service';
import { LineOAWebhookService } from './line-oa-webhook.service';
export declare class LineOAController {
    private readonly lineOAService;
    private readonly linkingService;
    private readonly webhookService;
    constructor(lineOAService: LineOAService, linkingService: LineOALinkingService, webhookService: LineOAWebhookService);
    handleWebhook(body: any, signature: string, req: Request): Promise<{
        message: string;
    }>;
    getLinkingStatus(userId: string): Promise<{
        isLinked: boolean;
        data: {
            lineUserId: string | null;
            displayName: string | null;
            pictureUrl: string | null;
            status: "VERIFIED";
            linkedAt: Date;
        } | null;
    }>;
    initiateLinking(body: {
        userId: number;
    }): Promise<{
        message: string;
        isLinked: boolean;
        linkingUrl?: undefined;
        verificationToken?: undefined;
        expiresIn?: undefined;
    } | {
        linkingUrl: string;
        verificationToken: string;
        expiresIn: number;
        message: string;
        isLinked?: undefined;
    }>;
    verifyLink(body: {
        userId: number;
        lineUserId: string;
        verificationToken: string;
        force?: boolean;
    }): Promise<{
        message: string;
        data: {
            userId: number;
            lineUserId: string | null;
            status: import(".prisma/client").$Enums.LineLinkStatus;
            linkedAt: Date;
        };
    }>;
    unlinkAccount(userId: string): Promise<{
        message: string;
    }>;
    getNotifications(userId?: string, limit?: string): Promise<{
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
    healthCheck(): Promise<{
        status: string;
        message: string;
    }>;
}
