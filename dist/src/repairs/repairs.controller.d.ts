import { RepairsService } from './repairs.service';
import { CreateRepairTicketDto } from './dto/create-repair-ticket.dto';
import { UpdateRepairTicketDto } from './dto/update-repair-ticket.dto';
import { RepairTicketStatus, UrgencyLevel } from '@prisma/client';
import { LineOANotificationService } from '../line-oa/line-oa-notification.service';
import { UsersService } from '../users/users.service';
export declare class RepairsController {
    private readonly repairsService;
    private readonly lineNotificationService;
    private readonly usersService;
    private readonly logger;
    constructor(repairsService: RepairsService, lineNotificationService: LineOANotificationService, usersService: UsersService);
    createFromLiff(req: any, body: Record<string, any>, files?: Express.Multer.File[]): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ticketCode: string;
        problemCategory: import(".prisma/client").$Enums.ProblemCategory;
        location: string;
        status: import(".prisma/client").$Enums.RepairTicketStatus;
        notes: string | null;
        userId: number;
        reporterName: string;
        reporterDepartment: string | null;
        reporterPhone: string | null;
        reporterLineId: string | null;
        problemTitle: string;
        problemDescription: string | null;
        urgency: import(".prisma/client").$Enums.UrgencyLevel;
        messageToReporter: string | null;
        linkingCode: string | null;
        reporterLineUserId: string | null;
        estimatedCompletionDate: Date | null;
        scheduledAt: Date;
        completedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    getTicketForLiff(code: string, lineUserId: string): Promise<{
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
            comment: string | null;
            updatedBy: number;
            repairTicketId: number;
        })[];
        attachments: {
            id: number;
            createdAt: Date;
            filename: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
            repairTicketId: number;
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
            repairTicketId: number;
            assignedAt: Date;
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
            action: string;
            repairTicketId: number;
            note: string | null;
            assignerId: number | null;
            assigneeId: number | null;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ticketCode: string;
        problemCategory: import(".prisma/client").$Enums.ProblemCategory;
        location: string;
        status: import(".prisma/client").$Enums.RepairTicketStatus;
        notes: string | null;
        userId: number;
        reporterName: string;
        reporterDepartment: string | null;
        reporterPhone: string | null;
        reporterLineId: string | null;
        problemTitle: string;
        problemDescription: string | null;
        urgency: import(".prisma/client").$Enums.UrgencyLevel;
        messageToReporter: string | null;
        linkingCode: string | null;
        reporterLineUserId: string | null;
        estimatedCompletionDate: Date | null;
        scheduledAt: Date;
        completedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    getLiffUserTickets(lineUserId: string): Promise<({
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
            comment: string | null;
            updatedBy: number;
            repairTicketId: number;
        })[];
        attachments: {
            id: number;
            createdAt: Date;
            filename: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
            repairTicketId: number;
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
            repairTicketId: number;
            assignedAt: Date;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ticketCode: string;
        problemCategory: import(".prisma/client").$Enums.ProblemCategory;
        location: string;
        status: import(".prisma/client").$Enums.RepairTicketStatus;
        notes: string | null;
        userId: number;
        reporterName: string;
        reporterDepartment: string | null;
        reporterPhone: string | null;
        reporterLineId: string | null;
        problemTitle: string;
        problemDescription: string | null;
        urgency: import(".prisma/client").$Enums.UrgencyLevel;
        messageToReporter: string | null;
        linkingCode: string | null;
        reporterLineUserId: string | null;
        estimatedCompletionDate: Date | null;
        scheduledAt: Date;
        completedAt: Date | null;
        cancelledAt: Date | null;
    })[]>;
    getTicketPublic(code: string): Promise<{
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
            comment: string | null;
            updatedBy: number;
            repairTicketId: number;
        })[];
        attachments: {
            id: number;
            createdAt: Date;
            filename: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
            repairTicketId: number;
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
            repairTicketId: number;
            assignedAt: Date;
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
            action: string;
            repairTicketId: number;
            note: string | null;
            assignerId: number | null;
            assigneeId: number | null;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ticketCode: string;
        problemCategory: import(".prisma/client").$Enums.ProblemCategory;
        location: string;
        status: import(".prisma/client").$Enums.RepairTicketStatus;
        notes: string | null;
        userId: number;
        reporterName: string;
        reporterDepartment: string | null;
        reporterPhone: string | null;
        reporterLineId: string | null;
        problemTitle: string;
        problemDescription: string | null;
        urgency: import(".prisma/client").$Enums.UrgencyLevel;
        messageToReporter: string | null;
        linkingCode: string | null;
        reporterLineUserId: string | null;
        estimatedCompletionDate: Date | null;
        scheduledAt: Date;
        completedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    findAll(req: any, status?: RepairTicketStatus, urgency?: UrgencyLevel, assignedTo?: string, limit?: string): Promise<({
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
            repairTicketId: number;
            assignedAt: Date;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ticketCode: string;
        problemCategory: import(".prisma/client").$Enums.ProblemCategory;
        location: string;
        status: import(".prisma/client").$Enums.RepairTicketStatus;
        notes: string | null;
        userId: number;
        reporterName: string;
        reporterDepartment: string | null;
        reporterPhone: string | null;
        reporterLineId: string | null;
        problemTitle: string;
        problemDescription: string | null;
        urgency: import(".prisma/client").$Enums.UrgencyLevel;
        messageToReporter: string | null;
        linkingCode: string | null;
        reporterLineUserId: string | null;
        estimatedCompletionDate: Date | null;
        scheduledAt: Date;
        completedAt: Date | null;
        cancelledAt: Date | null;
    })[]>;
    create(req: any, dto: CreateRepairTicketDto, files?: Express.Multer.File[]): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ticketCode: string;
        problemCategory: import(".prisma/client").$Enums.ProblemCategory;
        location: string;
        status: import(".prisma/client").$Enums.RepairTicketStatus;
        notes: string | null;
        userId: number;
        reporterName: string;
        reporterDepartment: string | null;
        reporterPhone: string | null;
        reporterLineId: string | null;
        problemTitle: string;
        problemDescription: string | null;
        urgency: import(".prisma/client").$Enums.UrgencyLevel;
        messageToReporter: string | null;
        linkingCode: string | null;
        reporterLineUserId: string | null;
        estimatedCompletionDate: Date | null;
        scheduledAt: Date;
        completedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    getSchedule(): Promise<{
        id: number;
        createdAt: Date;
        ticketCode: string;
        location: string;
        status: import(".prisma/client").$Enums.RepairTicketStatus;
        reporterName: string;
        problemTitle: string;
        problemDescription: string | null;
        urgency: import(".prisma/client").$Enums.UrgencyLevel;
        scheduledAt: Date;
        completedAt: Date | null;
    }[]>;
    getStatistics(): Promise<{
        total: number;
        pending: number;
        assigned: number;
        inProgress: number;
        waitingParts: number;
        completed: number;
        cancelled: number;
    }>;
    getDashboardStatistics(filter?: 'day' | 'week' | 'month', dateStr?: string, limitStr?: string): Promise<{
        all: {
            total: number;
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
            ticketCode: string;
            location: string;
            status: import(".prisma/client").$Enums.RepairTicketStatus;
            problemTitle: string;
            urgency: import(".prisma/client").$Enums.UrgencyLevel;
        }[];
        dateRange: {
            startDate: Date;
            endDate: Date;
        };
    }>;
    getDepartmentStatistics(filter?: 'day' | 'week' | 'month', dateStr?: string): Promise<{
        total: number;
        pending: number;
        inProgress: number;
        completed: number;
        cancelled: number;
        department: string;
    }[]>;
    getUserTickets(req: any): Promise<({
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
            comment: string | null;
            updatedBy: number;
            repairTicketId: number;
        })[];
        attachments: {
            id: number;
            createdAt: Date;
            filename: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
            repairTicketId: number;
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
            repairTicketId: number;
            assignedAt: Date;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ticketCode: string;
        problemCategory: import(".prisma/client").$Enums.ProblemCategory;
        location: string;
        status: import(".prisma/client").$Enums.RepairTicketStatus;
        notes: string | null;
        userId: number;
        reporterName: string;
        reporterDepartment: string | null;
        reporterPhone: string | null;
        reporterLineId: string | null;
        problemTitle: string;
        problemDescription: string | null;
        urgency: import(".prisma/client").$Enums.UrgencyLevel;
        messageToReporter: string | null;
        linkingCode: string | null;
        reporterLineUserId: string | null;
        estimatedCompletionDate: Date | null;
        scheduledAt: Date;
        completedAt: Date | null;
        cancelledAt: Date | null;
    })[]>;
    findByCode(code: string): Promise<{
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
            comment: string | null;
            updatedBy: number;
            repairTicketId: number;
        })[];
        attachments: {
            id: number;
            createdAt: Date;
            filename: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
            repairTicketId: number;
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
            repairTicketId: number;
            assignedAt: Date;
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
            action: string;
            repairTicketId: number;
            note: string | null;
            assignerId: number | null;
            assigneeId: number | null;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ticketCode: string;
        problemCategory: import(".prisma/client").$Enums.ProblemCategory;
        location: string;
        status: import(".prisma/client").$Enums.RepairTicketStatus;
        notes: string | null;
        userId: number;
        reporterName: string;
        reporterDepartment: string | null;
        reporterPhone: string | null;
        reporterLineId: string | null;
        problemTitle: string;
        problemDescription: string | null;
        urgency: import(".prisma/client").$Enums.UrgencyLevel;
        messageToReporter: string | null;
        linkingCode: string | null;
        reporterLineUserId: string | null;
        estimatedCompletionDate: Date | null;
        scheduledAt: Date;
        completedAt: Date | null;
        cancelledAt: Date | null;
    }>;
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
            comment: string | null;
            updatedBy: number;
            repairTicketId: number;
        })[];
        attachments: {
            id: number;
            createdAt: Date;
            filename: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
            repairTicketId: number;
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
            repairTicketId: number;
            assignedAt: Date;
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
            action: string;
            repairTicketId: number;
            note: string | null;
            assignerId: number | null;
            assigneeId: number | null;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ticketCode: string;
        problemCategory: import(".prisma/client").$Enums.ProblemCategory;
        location: string;
        status: import(".prisma/client").$Enums.RepairTicketStatus;
        notes: string | null;
        userId: number;
        reporterName: string;
        reporterDepartment: string | null;
        reporterPhone: string | null;
        reporterLineId: string | null;
        problemTitle: string;
        problemDescription: string | null;
        urgency: import(".prisma/client").$Enums.UrgencyLevel;
        messageToReporter: string | null;
        linkingCode: string | null;
        reporterLineUserId: string | null;
        estimatedCompletionDate: Date | null;
        scheduledAt: Date;
        completedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    update(id: number, dto: UpdateRepairTicketDto, req: any, files?: Express.Multer.File[]): Promise<{
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
            repairTicketId: number;
            assignedAt: Date;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ticketCode: string;
        problemCategory: import(".prisma/client").$Enums.ProblemCategory;
        location: string;
        status: import(".prisma/client").$Enums.RepairTicketStatus;
        notes: string | null;
        userId: number;
        reporterName: string;
        reporterDepartment: string | null;
        reporterPhone: string | null;
        reporterLineId: string | null;
        problemTitle: string;
        problemDescription: string | null;
        urgency: import(".prisma/client").$Enums.UrgencyLevel;
        messageToReporter: string | null;
        linkingCode: string | null;
        reporterLineUserId: string | null;
        estimatedCompletionDate: Date | null;
        scheduledAt: Date;
        completedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    remove(id: number, req: any): Promise<{
        message: string;
        ticketCode: string;
    }>;
}
