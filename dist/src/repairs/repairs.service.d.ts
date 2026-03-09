import { PrismaService } from '../prisma/prisma.service';
import { RepairTicketStatus, UrgencyLevel } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { LineOANotificationService } from '../line-oa/line-oa-notification.service';
import { CreateRepairTicketDto } from './dto/create-repair-ticket.dto';
import { UpdateRepairTicketDto } from './dto/update-repair-ticket.dto';
export declare class RepairsService {
    private readonly prisma;
    private readonly cloudinaryService;
    private readonly lineNotificationService;
    private readonly logger;
    private readonly statusTransitions;
    constructor(prisma: PrismaService, cloudinaryService: CloudinaryService, lineNotificationService: LineOANotificationService);
    private validateStatusTransition;
    private sanitizeFilename;
    private generateRandomCode;
    private generateTicketCode;
    create(userId: number, dto: CreateRepairTicketDto, files?: Express.Multer.File[], lineUserId?: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        status: import(".prisma/client").$Enums.RepairTicketStatus;
        ticketCode: string;
        reporterName: string;
        reporterDepartment: string | null;
        reporterPhone: string | null;
        reporterLineId: string | null;
        problemTitle: string;
        problemDescription: string | null;
        location: string;
        urgency: import(".prisma/client").$Enums.UrgencyLevel;
        notes: string | null;
        messageToReporter: string | null;
        linkingCode: string | null;
        reporterLineUserId: string | null;
        estimatedCompletionDate: Date | null;
        scheduledAt: Date;
        completedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    private readonly safeUserSelect;
    findOne(id: number): Promise<{
        user: {
            id: number;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            department: string | null;
            phoneNumber: string | null;
            lineId: string | null;
            profilePicture: string | null;
        };
        attachments: {
            id: number;
            createdAt: Date;
            repairTicketId: number;
            filename: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
        }[];
        assignees: ({
            user: {
                id: number;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
                department: string | null;
                phoneNumber: string | null;
                lineId: string | null;
                profilePicture: string | null;
            };
        } & {
            id: number;
            userId: number;
            assignedAt: Date;
            repairTicketId: number;
        })[];
        logs: ({
            user: {
                id: number;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
                department: string | null;
                phoneNumber: string | null;
                lineId: string | null;
                profilePicture: string | null;
            };
        } & {
            id: number;
            createdAt: Date;
            status: import(".prisma/client").$Enums.RepairTicketStatus;
            repairTicketId: number;
            comment: string | null;
            updatedBy: number;
        })[];
        assignmentHistory: ({
            assignee: {
                id: number;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
                department: string | null;
                phoneNumber: string | null;
                lineId: string | null;
                profilePicture: string | null;
            } | null;
            assigner: {
                id: number;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
                department: string | null;
                phoneNumber: string | null;
                lineId: string | null;
                profilePicture: string | null;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            repairTicketId: number;
            action: string;
            note: string | null;
            assigneeId: number | null;
            assignerId: number | null;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        status: import(".prisma/client").$Enums.RepairTicketStatus;
        ticketCode: string;
        reporterName: string;
        reporterDepartment: string | null;
        reporterPhone: string | null;
        reporterLineId: string | null;
        problemTitle: string;
        problemDescription: string | null;
        location: string;
        urgency: import(".prisma/client").$Enums.UrgencyLevel;
        notes: string | null;
        messageToReporter: string | null;
        linkingCode: string | null;
        reporterLineUserId: string | null;
        estimatedCompletionDate: Date | null;
        scheduledAt: Date;
        completedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    findByCode(ticketCode: string): Promise<{
        user: {
            id: number;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            department: string | null;
            phoneNumber: string | null;
            lineId: string | null;
            profilePicture: string | null;
        };
        attachments: {
            id: number;
            createdAt: Date;
            repairTicketId: number;
            filename: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
        }[];
        assignees: ({
            user: {
                id: number;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
                department: string | null;
                phoneNumber: string | null;
                lineId: string | null;
                profilePicture: string | null;
            };
        } & {
            id: number;
            userId: number;
            assignedAt: Date;
            repairTicketId: number;
        })[];
        logs: ({
            user: {
                id: number;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
                department: string | null;
                phoneNumber: string | null;
                lineId: string | null;
                profilePicture: string | null;
            };
        } & {
            id: number;
            createdAt: Date;
            status: import(".prisma/client").$Enums.RepairTicketStatus;
            repairTicketId: number;
            comment: string | null;
            updatedBy: number;
        })[];
        assignmentHistory: ({
            assignee: {
                id: number;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
                department: string | null;
                phoneNumber: string | null;
                lineId: string | null;
                profilePicture: string | null;
            } | null;
            assigner: {
                id: number;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
                department: string | null;
                phoneNumber: string | null;
                lineId: string | null;
                profilePicture: string | null;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            repairTicketId: number;
            action: string;
            note: string | null;
            assigneeId: number | null;
            assignerId: number | null;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        status: import(".prisma/client").$Enums.RepairTicketStatus;
        ticketCode: string;
        reporterName: string;
        reporterDepartment: string | null;
        reporterPhone: string | null;
        reporterLineId: string | null;
        problemTitle: string;
        problemDescription: string | null;
        location: string;
        urgency: import(".prisma/client").$Enums.UrgencyLevel;
        notes: string | null;
        messageToReporter: string | null;
        linkingCode: string | null;
        reporterLineUserId: string | null;
        estimatedCompletionDate: Date | null;
        scheduledAt: Date;
        completedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    update(id: number, dto: UpdateRepairTicketDto, updatedById: number, files?: Express.Multer.File[]): Promise<{
        user: {
            id: number;
            name: string;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.Role;
            department: string | null;
            phoneNumber: string | null;
            lineId: string | null;
            profilePicture: string | null;
            profilePictureId: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        assignees: ({
            user: {
                id: number;
                name: string;
                email: string;
                password: string;
                role: import(".prisma/client").$Enums.Role;
                department: string | null;
                phoneNumber: string | null;
                lineId: string | null;
                profilePicture: string | null;
                profilePictureId: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            userId: number;
            assignedAt: Date;
            repairTicketId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        status: import(".prisma/client").$Enums.RepairTicketStatus;
        ticketCode: string;
        reporterName: string;
        reporterDepartment: string | null;
        reporterPhone: string | null;
        reporterLineId: string | null;
        problemTitle: string;
        problemDescription: string | null;
        location: string;
        urgency: import(".prisma/client").$Enums.UrgencyLevel;
        notes: string | null;
        messageToReporter: string | null;
        linkingCode: string | null;
        reporterLineUserId: string | null;
        estimatedCompletionDate: Date | null;
        scheduledAt: Date;
        completedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    remove(id: number): Promise<{
        message: string;
        ticketCode: string;
    }>;
    removeByDateRange(startDate: Date, endDate: Date): Promise<{
        message: string;
        count: number;
        period?: undefined;
    } | {
        message: string;
        count: number;
        period: {
            startDate: Date;
            endDate: Date;
        };
    }>;
    removeMany(ids: number[]): Promise<{
        message: string;
        count: number;
        ids?: undefined;
    } | {
        message: string;
        count: number;
        ids: number[];
    }>;
    getStatistics(): Promise<{
        total: number;
        pending: number;
        assigned: number;
        inProgress: number;
        waitingParts: number;
        completed: number;
        cancelled: number;
    }>;
    getDashboardStatistics(filter?: 'day' | 'week' | 'month', date?: Date, limit?: number): Promise<{
        all: {
            total: number;
            pending: any;
            inProgress: any;
            completed: any;
            cancelled: any;
        };
        filtered: {
            total: number;
            pending: any;
            inProgress: any;
            completed: any;
            cancelled: any;
        };
        recentRepairs: {
            id: number;
            createdAt: Date;
            status: import(".prisma/client").$Enums.RepairTicketStatus;
            ticketCode: string;
            problemTitle: string;
            location: string;
            urgency: import(".prisma/client").$Enums.UrgencyLevel;
        }[];
        dateRange: {
            startDate: Date;
            endDate: Date;
        };
    }>;
    getDepartmentStatistics(filter?: 'day' | 'week' | 'month', date?: Date): Promise<{
        total: number;
        pending: number;
        inProgress: number;
        completed: number;
        cancelled: number;
        department: string;
    }[]>;
    getSchedule(): Promise<{
        id: number;
        createdAt: Date;
        status: import(".prisma/client").$Enums.RepairTicketStatus;
        ticketCode: string;
        reporterName: string;
        problemTitle: string;
        problemDescription: string | null;
        location: string;
        urgency: import(".prisma/client").$Enums.UrgencyLevel;
        scheduledAt: Date;
        completedAt: Date | null;
    }[]>;
    findAll(params: {
        userId?: number;
        isAdmin?: boolean;
        status?: RepairTicketStatus;
        urgency?: UrgencyLevel;
        assignedTo?: number;
        limit?: number;
        startDate?: Date;
        endDate?: Date;
    }): Promise<({
        user: {
            id: number;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            department: string | null;
            phoneNumber: string | null;
            lineId: string | null;
            profilePicture: string | null;
        };
        assignees: ({
            user: {
                id: number;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
                department: string | null;
                phoneNumber: string | null;
                lineId: string | null;
                profilePicture: string | null;
            };
        } & {
            id: number;
            userId: number;
            assignedAt: Date;
            repairTicketId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        status: import(".prisma/client").$Enums.RepairTicketStatus;
        ticketCode: string;
        reporterName: string;
        reporterDepartment: string | null;
        reporterPhone: string | null;
        reporterLineId: string | null;
        problemTitle: string;
        problemDescription: string | null;
        location: string;
        urgency: import(".prisma/client").$Enums.UrgencyLevel;
        notes: string | null;
        messageToReporter: string | null;
        linkingCode: string | null;
        reporterLineUserId: string | null;
        estimatedCompletionDate: Date | null;
        scheduledAt: Date;
        completedAt: Date | null;
        cancelledAt: Date | null;
    })[]>;
    findUserByLineId(lineUserId: string): Promise<{
        id: number;
        name: string;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        department: string | null;
        phoneNumber: string | null;
        lineId: string | null;
        profilePicture: string | null;
        profilePictureId: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | undefined>;
    getUserTickets(userId: number): Promise<({
        user: {
            id: number;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            department: string | null;
            phoneNumber: string | null;
            lineId: string | null;
            profilePicture: string | null;
        };
        attachments: {
            id: number;
            createdAt: Date;
            repairTicketId: number;
            filename: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
        }[];
        assignees: ({
            user: {
                id: number;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
                department: string | null;
                phoneNumber: string | null;
                lineId: string | null;
                profilePicture: string | null;
            };
        } & {
            id: number;
            userId: number;
            assignedAt: Date;
            repairTicketId: number;
        })[];
        logs: ({
            user: {
                id: number;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
                department: string | null;
                phoneNumber: string | null;
                lineId: string | null;
                profilePicture: string | null;
            };
        } & {
            id: number;
            createdAt: Date;
            status: import(".prisma/client").$Enums.RepairTicketStatus;
            repairTicketId: number;
            comment: string | null;
            updatedBy: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        status: import(".prisma/client").$Enums.RepairTicketStatus;
        ticketCode: string;
        reporterName: string;
        reporterDepartment: string | null;
        reporterPhone: string | null;
        reporterLineId: string | null;
        problemTitle: string;
        problemDescription: string | null;
        location: string;
        urgency: import(".prisma/client").$Enums.UrgencyLevel;
        notes: string | null;
        messageToReporter: string | null;
        linkingCode: string | null;
        reporterLineUserId: string | null;
        estimatedCompletionDate: Date | null;
        scheduledAt: Date;
        completedAt: Date | null;
        cancelledAt: Date | null;
    })[]>;
}
