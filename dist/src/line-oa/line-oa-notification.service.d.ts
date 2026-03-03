import { PrismaService } from '../prisma/prisma.service';
import { LineOAService } from './line-oa.service';
export interface LineNotificationPayload {
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    richMessage?: any;
}
export interface RepairTicketNotificationPayload {
    ticketCode: string;
    ticketId?: number;
    reporterName: string;
    department: string;
    problemTitle: string;
    problemDescription?: string;
    location: string;
    urgency: 'CRITICAL' | 'URGENT' | 'NORMAL';
    createdAt: string;
    reporterPhone?: string;
    imageUrl?: string;
}
export interface RepairStatusUpdatePayload {
    ticketCode: string;
    problemTitle?: string;
    problemDescription?: string;
    status: string;
    remark?: string;
    technicianNames?: string[];
    nextStep?: string;
    updatedAt?: Date;
}
export declare class LineOANotificationService {
    private readonly prisma;
    private readonly lineOAService;
    private readonly logger;
    constructor(prisma: PrismaService, lineOAService: LineOAService);
    sendNotification(userId: number, payload: LineNotificationPayload): Promise<{
        success: boolean;
        reason: string;
    } | {
        success: boolean;
        reason?: undefined;
    }>;
    notifyRepairTicketToITTeam(payload: RepairTicketNotificationPayload): Promise<{
        success: boolean;
        reason: string;
        count?: undefined;
    } | {
        success: boolean;
        count: number;
        reason?: undefined;
    } | {
        success: boolean;
        reason?: undefined;
        count?: undefined;
    }>;
    notifyTechnicianTaskAssignment(technicianId: number, payload: {
        ticketCode: string;
        ticketId?: number;
        problemTitle: string;
        problemDescription?: string;
        adminNote?: string;
        reporterName: string;
        reporterPhone?: string;
        department?: string;
        location?: string;
        urgency: 'CRITICAL' | 'URGENT' | 'NORMAL';
        action: 'ASSIGNED' | 'TRANSFERRED' | 'CLAIMED';
        imageUrl?: string;
    }): Promise<{
        success: boolean;
        reason: string;
    } | {
        success: boolean;
        reason?: undefined;
    }>;
    notifyTechnicianJobCompletion(technicianId: number, payload: {
        ticketCode: string;
        ticketId?: number;
        problemTitle: string;
        reporterName: string;
        department?: string;
        location?: string;
        completedAt: Date;
        completionNote?: string;
        reporterLineUserId?: string;
        problemImageUrl?: string;
    }): Promise<{
        success: boolean;
        reason: string;
    } | {
        success: boolean;
        reason?: undefined;
    }>;
    notifyTechnicianJobCancellation(technicianId: number, payload: {
        ticketCode: string;
        ticketId?: number;
        problemTitle: string;
        reporterName: string;
        department?: string;
        location?: string;
        cancelledAt: Date;
        cancelNote?: string;
        problemImageUrl?: string;
    }): Promise<{
        success: boolean;
        reason: string;
    } | {
        success: boolean;
        reason?: undefined;
    }>;
    notifyTechnicianRush(technicianId: number, payload: {
        ticketCode: string;
        ticketId?: number;
        problemTitle: string;
        rushMessage?: string;
        adminName?: string;
        reporterName: string;
        reporterPhone?: string;
        department?: string;
        location?: string;
        urgency: 'CRITICAL' | 'URGENT' | 'NORMAL';
        imageUrl?: string;
    }): Promise<{
        success: boolean;
        reason: string;
    } | {
        success: boolean;
        reason?: undefined;
    }>;
    private createTechnicianRushFlex;
    notifyRepairTicketStatusUpdate(userId: number, payload: RepairStatusUpdatePayload): Promise<{
        success: boolean;
    }>;
    notifyReporterDirectly(lineUserId: string, payload: {
        ticketCode: string;
        status: string;
        urgency: 'CRITICAL' | 'URGENT' | 'NORMAL';
        problemTitle: string;
        description?: string;
        imageUrl?: string;
        createdAt: Date;
        remark?: string;
    }): Promise<{
        success: boolean;
    }>;
    private createReporterFlexMessage;
    private getVerifiedLineLink;
    private saveNotificationLog;
    private logFailure;
    private createDefaultTextMessage;
    private createRepairTicketFlex;
    private createTechnicianAssignmentFlex;
    private createTechnicianCompletionFlex;
    private createTechnicianCancellationFlex;
    private createStatusUpdateFlex;
    private createInfoRow;
    createCheckStatusCarousel(tickets: any[], page?: number, pageSize?: number): any;
    private getUrgencyConfig;
    private getStatusConfig;
}
