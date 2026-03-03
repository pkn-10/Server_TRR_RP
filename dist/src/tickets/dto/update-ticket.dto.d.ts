import { Priority, TicketStatus } from '@prisma/client';
export declare class UpdateTicketDto {
    title?: string;
    description?: string;
    equipmentName?: string;
    equipmentId?: string;
    notes?: string;
    requiredDate?: string;
    priority?: Priority;
    status?: TicketStatus;
    assignee?: {
        id: string;
        name: string;
    } | null;
}
