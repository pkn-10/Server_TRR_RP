import { PrismaService } from '../prisma/prisma.service';
export declare class LineOALinkingService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    initiateLinking(userId: number): Promise<{
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
    verifyLink(userId: number, lineUserId: string, verificationToken: string, force?: boolean): Promise<{
        message: string;
        data: {
            userId: number;
            lineUserId: string | null;
            status: import(".prisma/client").$Enums.LineLinkStatus;
            linkedAt: Date;
        };
    }>;
    getLinkingStatus(userId: number): Promise<{
        isLinked: boolean;
        data: {
            lineUserId: string | null;
            displayName: string | null;
            pictureUrl: string | null;
            status: "VERIFIED";
            linkedAt: Date;
        } | null;
    }>;
    unlinkAccount(userId: number): Promise<{
        message: string;
    }>;
    private generateLinkingUrl;
    updateProfileFromLine(userId: number, lineUserId: string, displayName: string, pictureUrl: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.LineLinkStatus;
        userId: number;
        displayName: string | null;
        pictureUrl: string | null;
        lineUserId: string | null;
        verificationToken: string | null;
        verificationExpiry: Date | null;
    }>;
    linkReporterLine(linkingCode: string, lineUserId: string): Promise<{
        success: boolean;
        ticketCode?: string;
        error?: string;
    }>;
}
