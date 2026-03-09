import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
export declare class DepartmentsController {
    private readonly departmentsService;
    constructor(departmentsService: DepartmentsService);
    create(createDepartmentDto: CreateDepartmentDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        description: string | null;
        location: string | null;
        contactEmail: string | null;
        contactPhone: string | null;
        headName: string | null;
    }>;
    findAll(): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        description: string | null;
        location: string | null;
        contactEmail: string | null;
        contactPhone: string | null;
        headName: string | null;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        description: string | null;
        location: string | null;
        contactEmail: string | null;
        contactPhone: string | null;
        headName: string | null;
    }>;
    update(id: number, updateDepartmentDto: UpdateDepartmentDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        description: string | null;
        location: string | null;
        contactEmail: string | null;
        contactPhone: string | null;
        headName: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        description: string | null;
        location: string | null;
        contactEmail: string | null;
        contactPhone: string | null;
        headName: string | null;
    }>;
}
