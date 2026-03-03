import { ProblemCategory, UrgencyLevel } from '@prisma/client';
export declare class CreateRepairTicketDto {
    reporterName: string;
    reporterDepartment?: string;
    reporterPhone?: string;
    reporterLineId?: string;
    accessToken?: string;
    problemCategory: ProblemCategory;
    problemTitle: string;
    problemDescription?: string;
    location: string;
    urgency?: UrgencyLevel;
    assignedTo?: number;
    notes?: string;
    scheduledAt?: Date;
}
