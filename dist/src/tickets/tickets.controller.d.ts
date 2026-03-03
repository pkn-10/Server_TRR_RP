import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
export declare class TicketsController {
    private ticketsService;
    constructor(ticketsService: TicketsService);
    create(req: any, createTicketDto: CreateTicketDto, files?: any[]): Promise<{
        user: {
            id: number;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        } | null;
        attachments: {
            id: number;
            createdAt: Date;
            ticketId: number;
            filename: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
        }[];
        assignee: {
            id: number;
            name: string;
            email: string;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ticketCode: string;
        title: string;
        description: string;
        problemCategory: import(".prisma/client").$Enums.ProblemCategory;
        problemSubcategory: import(".prisma/client").$Enums.ProblemSubcategory;
        equipmentName: string;
        equipmentId: string | null;
        location: string;
        category: string;
        priority: import(".prisma/client").$Enums.Priority;
        status: import(".prisma/client").$Enums.TicketStatus;
        notes: string | null;
        requiredDate: string | null;
        guestName: string | null;
        guestEmail: string | null;
        guestPhone: string | null;
        guestDepartment: string | null;
        userId: number | null;
        assignedTo: number | null;
    }>;
    findAll(req: any): Promise<{
        data: ({
            user: {
                id: number;
                name: string;
                email: string;
            } | null;
            logs: {
                id: number;
                createdAt: Date;
                status: import(".prisma/client").$Enums.TicketStatus;
                ticketId: number;
                comment: string | null;
                updatedBy: number;
            }[];
            attachments: {
                id: number;
                createdAt: Date;
                ticketId: number;
                filename: string;
                fileUrl: string;
                fileSize: number;
                mimeType: string;
            }[];
            assignee: {
                id: number;
                name: string;
                email: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            ticketCode: string;
            title: string;
            description: string;
            problemCategory: import(".prisma/client").$Enums.ProblemCategory;
            problemSubcategory: import(".prisma/client").$Enums.ProblemSubcategory;
            equipmentName: string;
            equipmentId: string | null;
            location: string;
            category: string;
            priority: import(".prisma/client").$Enums.Priority;
            status: import(".prisma/client").$Enums.TicketStatus;
            notes: string | null;
            requiredDate: string | null;
            guestName: string | null;
            guestEmail: string | null;
            guestPhone: string | null;
            guestDepartment: string | null;
            userId: number | null;
            assignedTo: number | null;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: number, req: any): Promise<{
        user: {
            id: number;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        } | null;
        assignee: {
            id: number;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ticketCode: string;
        title: string;
        description: string;
        problemCategory: import(".prisma/client").$Enums.ProblemCategory;
        problemSubcategory: import(".prisma/client").$Enums.ProblemSubcategory;
        equipmentName: string;
        equipmentId: string | null;
        location: string;
        category: string;
        priority: import(".prisma/client").$Enums.Priority;
        status: import(".prisma/client").$Enums.TicketStatus;
        notes: string | null;
        requiredDate: string | null;
        guestName: string | null;
        guestEmail: string | null;
        guestPhone: string | null;
        guestDepartment: string | null;
        userId: number | null;
        assignedTo: number | null;
    }>;
    findByCode(code: string, req: any): Promise<{
        user: {
            id: number;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        } | null;
        logs: {
            id: number;
            createdAt: Date;
            status: import(".prisma/client").$Enums.TicketStatus;
            ticketId: number;
            comment: string | null;
            updatedBy: number;
        }[];
        attachments: {
            id: number;
            createdAt: Date;
            ticketId: number;
            filename: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
        }[];
        assignee: {
            id: number;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ticketCode: string;
        title: string;
        description: string;
        problemCategory: import(".prisma/client").$Enums.ProblemCategory;
        problemSubcategory: import(".prisma/client").$Enums.ProblemSubcategory;
        equipmentName: string;
        equipmentId: string | null;
        location: string;
        category: string;
        priority: import(".prisma/client").$Enums.Priority;
        status: import(".prisma/client").$Enums.TicketStatus;
        notes: string | null;
        requiredDate: string | null;
        guestName: string | null;
        guestEmail: string | null;
        guestPhone: string | null;
        guestDepartment: string | null;
        userId: number | null;
        assignedTo: number | null;
    }>;
    findByEmail(email: string, req: any): Promise<({
        user: {
            id: number;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        } | null;
        logs: {
            id: number;
            createdAt: Date;
            status: import(".prisma/client").$Enums.TicketStatus;
            ticketId: number;
            comment: string | null;
            updatedBy: number;
        }[];
        attachments: {
            id: number;
            createdAt: Date;
            ticketId: number;
            filename: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
        }[];
        assignee: {
            id: number;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ticketCode: string;
        title: string;
        description: string;
        problemCategory: import(".prisma/client").$Enums.ProblemCategory;
        problemSubcategory: import(".prisma/client").$Enums.ProblemSubcategory;
        equipmentName: string;
        equipmentId: string | null;
        location: string;
        category: string;
        priority: import(".prisma/client").$Enums.Priority;
        status: import(".prisma/client").$Enums.TicketStatus;
        notes: string | null;
        requiredDate: string | null;
        guestName: string | null;
        guestEmail: string | null;
        guestPhone: string | null;
        guestDepartment: string | null;
        userId: number | null;
        assignedTo: number | null;
    })[]>;
    update(id: number, updateTicketDto: UpdateTicketDto, req: any): Promise<{
        user: {
            id: number;
            name: string;
            email: string;
        } | null;
        attachments: {
            id: number;
            createdAt: Date;
            ticketId: number;
            filename: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
        }[];
        assignee: {
            id: number;
            name: string;
            email: string;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ticketCode: string;
        title: string;
        description: string;
        problemCategory: import(".prisma/client").$Enums.ProblemCategory;
        problemSubcategory: import(".prisma/client").$Enums.ProblemSubcategory;
        equipmentName: string;
        equipmentId: string | null;
        location: string;
        category: string;
        priority: import(".prisma/client").$Enums.Priority;
        status: import(".prisma/client").$Enums.TicketStatus;
        notes: string | null;
        requiredDate: string | null;
        guestName: string | null;
        guestEmail: string | null;
        guestPhone: string | null;
        guestDepartment: string | null;
        userId: number | null;
        assignedTo: number | null;
    }>;
    remove(id: number, req: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ticketCode: string;
        title: string;
        description: string;
        problemCategory: import(".prisma/client").$Enums.ProblemCategory;
        problemSubcategory: import(".prisma/client").$Enums.ProblemSubcategory;
        equipmentName: string;
        equipmentId: string | null;
        location: string;
        category: string;
        priority: import(".prisma/client").$Enums.Priority;
        status: import(".prisma/client").$Enums.TicketStatus;
        notes: string | null;
        requiredDate: string | null;
        guestName: string | null;
        guestEmail: string | null;
        guestPhone: string | null;
        guestDepartment: string | null;
        userId: number | null;
        assignedTo: number | null;
    }>;
}
