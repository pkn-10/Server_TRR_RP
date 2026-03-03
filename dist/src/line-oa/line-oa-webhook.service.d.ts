import { PrismaService } from '../prisma/prisma.service';
import { LineOALinkingService } from './line-oa-linking.service';
import { LineOANotificationService } from './line-oa-notification.service';
import { LineOAService } from './line-oa.service';
export declare class LineOAWebhookService {
    private readonly prisma;
    private readonly linkingService;
    private readonly lineOAService;
    private readonly notificationService;
    private readonly logger;
    private readonly channelSecret;
    private readonly channelAccessToken;
    private readonly liffId;
    private readonly client;
    constructor(prisma: PrismaService, linkingService: LineOALinkingService, lineOAService: LineOAService, notificationService: LineOANotificationService);
    handleWebhook(body: any, signature: string, rawBody?: Buffer): Promise<{
        message: string;
    }>;
    private verifySignature;
    private executeWithRetry;
    private sendMessage;
    private handleEvent;
    private handleFollow;
    private handleUnfollow;
    private handleMessage;
    private handleRepairKeyword;
    private handleLinkingCode;
    private handlePostback;
    private setRichMenu;
    private handleCreateRepairPostback;
    private handleCheckStatusPostback;
    private handleFAQPostback;
    private handleContactPostback;
}
