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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoansController = void 0;
const common_1 = require("@nestjs/common");
const loans_service_1 = require("./loans.service");
let LoansController = class LoansController {
    loansService;
    constructor(loansService) {
        this.loansService = loansService;
    }
    async create(body, req) {
        try {
            const userId = req.user?.sub || req.user?.id;
            if (!userId) {
                throw new common_1.BadRequestException('User ID not found');
            }
            return await this.loansService.create({
                itemName: body.itemName,
                description: body.description,
                quantity: body.quantity,
                expectedReturnDate: body.expectedReturnDate,
                userId,
                borrowerName: body.borrowerName,
                borrowerDepartment: body.borrowerDepartment,
                borrowerPhone: body.borrowerPhone,
                borrowerLineId: body.borrowerLineId,
            });
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async findAllForAdmin(req) {
        try {
            const userId = req.user?.sub || req.user?.id;
            const userRole = req.user?.role;
            if (!userId) {
                throw new common_1.BadRequestException('User ID not found');
            }
            if (userRole !== 'ADMIN' && userRole !== 'IT') {
                throw new common_1.BadRequestException('Only admins can view all loans');
            }
            return await this.loansService.findAll(null);
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async checkOverdue() {
        try {
            return await this.loansService.checkOverdue();
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async findAll(req) {
        try {
            console.log('GET /api/loans - User:', req.user);
            const userId = req.user?.sub || req.user?.id;
            const userRole = req.user?.role;
            if (!userId) {
                throw new common_1.BadRequestException('User ID not found');
            }
            const isStaff = userRole === 'ADMIN' || userRole === 'IT';
            const searchId = isStaff ? null : userId;
            console.log(`GET /api/loans - Role: ${userRole}, Fetching for: ${isStaff ? 'ALL' : userId}`);
            return await this.loansService.findAll(searchId);
        }
        catch (error) {
            console.error('GET /api/loans - Error:', error);
            throw new common_1.BadRequestException(error.message);
        }
    }
    async findOne(id) {
        try {
            return await this.loansService.findOne(parseInt(id));
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async update(id, body) {
        try {
            console.log(`PUT /api/loans/${id} - Received body:`, body);
            const result = await this.loansService.update(parseInt(id), {
                status: body.status,
                returnDate: body.returnDate,
                itemName: body.itemName,
                description: body.description,
                quantity: body.quantity,
                expectedReturnDate: body.expectedReturnDate,
                borrowerName: body.borrowerName,
                borrowerDepartment: body.borrowerDepartment,
                borrowerPhone: body.borrowerPhone,
                borrowerLineId: body.borrowerLineId,
            });
            console.log(`PUT /api/loans/${id} - Update successful:`, result);
            return result;
        }
        catch (error) {
            console.error(`PUT /api/loans/${id} - Error:`, error);
            throw new common_1.BadRequestException(error.message);
        }
    }
    async delete(id) {
        try {
            return await this.loansService.delete(parseInt(id));
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
};
exports.LoansController = LoansController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "findAllForAdmin", null);
__decorate([
    (0, common_1.Get)('check/overdue'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "checkOverdue", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoansController.prototype, "delete", null);
exports.LoansController = LoansController = __decorate([
    (0, common_1.Controller)('api/loans'),
    __metadata("design:paramtypes", [loans_service_1.LoansService])
], LoansController);
//# sourceMappingURL=loans.controller.js.map