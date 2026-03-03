import { CreateRepairTicketDto } from './create-repair-ticket.dto';
import { RepairTicketStatus } from '@prisma/client';
declare const UpdateRepairTicketDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateRepairTicketDto>>;
export declare class UpdateRepairTicketDto extends UpdateRepairTicketDto_base {
    status?: RepairTicketStatus;
    notes?: string;
    messageToReporter?: string;
    scheduledAt?: Date;
    estimatedCompletionDate?: string;
    assigneeIds?: number[];
    rushAssigneeIds?: number[];
    completedAt?: Date;
    completionReport?: string;
}
export {};
