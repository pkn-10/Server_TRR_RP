import { Priority, ProblemCategory, ProblemSubcategory } from '@prisma/client';
export declare class CreateTicketDto {
    title: string;
    description: string;
    problemCategory?: ProblemCategory;
    problemSubcategory?: ProblemSubcategory;
    equipmentName: string;
    location?: string;
    category?: string;
    priority?: Priority;
    equipmentId?: string;
    notes?: string;
    requiredDate?: string;
    status?: string;
    assignee?: {
        id: string;
        name: string;
    } | null;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    guestDepartment?: string;
}
export declare class FileUploadDto {
    files?: any[];
}
