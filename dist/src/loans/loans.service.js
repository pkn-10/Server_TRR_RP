"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LoansService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LoansService = LoansService_1 = class LoansService {
    prisma;
    logger = new common_1.Logger(LoansService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return await this.prisma.loan.create({
            data: {
                itemName: data.itemName || '',
                description: data.description || '',
                quantity: data.quantity,
                borrowDate: new Date(),
                expectedReturnDate: data.expectedReturnDate ? new Date(data.expectedReturnDate) : null,
                status: 'BORROWED',
                userId: data.userId,
                borrowerName: data.borrowerName || '',
                borrowerDepartment: data.borrowerDepartment || '',
                borrowerPhone: data.borrowerPhone || '',
                borrowerLineId: data.borrowerLineId || '',
            },
            include: {
                borrowedBy: {
                    select: { id: true, name: true, email: true, department: true, phoneNumber: true, lineId: true },
                },
            },
        });
    }
    async findAll(userId) {
        const where = userId ? { userId } : {};
        return await this.prisma.loan.findMany({
            where,
            include: {
                borrowedBy: {
                    select: { id: true, name: true, email: true, department: true, phoneNumber: true, lineId: true },
                },
            },
            orderBy: { borrowDate: 'desc' },
        });
    }
    async findOne(id) {
        return await this.prisma.loan.findUnique({
            where: { id },
            include: {
                borrowedBy: {
                    select: { id: true, name: true, email: true, department: true, phoneNumber: true, lineId: true },
                },
            },
        });
    }
    async update(id, data) {
        const updateData = {};
        if (data.status !== undefined)
            updateData.status = data.status;
        if (data.returnDate !== undefined)
            updateData.returnDate = data.returnDate ? new Date(data.returnDate) : null;
        if (data.itemName !== undefined)
            updateData.itemName = data.itemName;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.quantity !== undefined)
            updateData.quantity = data.quantity;
        if (data.expectedReturnDate !== undefined)
            updateData.expectedReturnDate = new Date(data.expectedReturnDate);
        if (data.borrowerName !== undefined)
            updateData.borrowerName = data.borrowerName;
        if (data.borrowerDepartment !== undefined)
            updateData.borrowerDepartment = data.borrowerDepartment;
        if (data.borrowerPhone !== undefined)
            updateData.borrowerPhone = data.borrowerPhone;
        if (data.borrowerLineId !== undefined)
            updateData.borrowerLineId = data.borrowerLineId;
        try {
            const result = await this.prisma.loan.update({
                where: { id },
                data: updateData,
                include: {
                    borrowedBy: {
                        select: { id: true, name: true, email: true, department: true, phoneNumber: true, lineId: true },
                    },
                },
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Error updating loan ${id}`, error instanceof Error ? error.stack : undefined);
            throw error;
        }
    }
    async checkOverdue() {
        const now = new Date();
        await this.prisma.loan.updateMany({
            where: {
                status: 'BORROWED',
                expectedReturnDate: {
                    lt: now,
                },
            },
            data: { status: 'OVERDUE' },
        });
        return await this.prisma.loan.findMany({
            where: {
                status: 'OVERDUE',
                expectedReturnDate: {
                    lt: now,
                },
            },
        });
    }
    async delete(id) {
        try {
            const result = await this.prisma.loan.delete({
                where: { id },
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Error deleting loan ${id}`, error instanceof Error ? error.stack : undefined);
            throw error;
        }
    }
};
exports.LoansService = LoansService;
exports.LoansService = LoansService = LoansService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LoansService);
//# sourceMappingURL=loans.service.js.map