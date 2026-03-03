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
exports.TicketsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const tickets_service_1 = require("./tickets.service");
const create_ticket_dto_1 = require("./dto/create-ticket.dto");
const update_ticket_dto_1 = require("./dto/update-ticket.dto");
const public_decorator_1 = require("../auth/public.decorator");
const jwt_guard_1 = require("../auth/jwt.guard");
let TicketsController = class TicketsController {
    ticketsService;
    constructor(ticketsService) {
        this.ticketsService = ticketsService;
    }
    create(req, createTicketDto, files) {
        const userId = req.user?.id || null;
        return this.ticketsService.create(userId, createTicketDto, files);
    }
    findAll(req) {
        const userRole = req.user?.role;
        const isAdmin = userRole === 'ADMIN' || userRole === 'IT';
        console.log(`GET /api/tickets - User: ${req.user?.id}, Role: ${userRole}, IsAdmin/IT: ${isAdmin}`);
        return this.ticketsService.findAll(isAdmin ? undefined : req.user.id);
    }
    async findOne(id, req) {
        try {
            const ticket = await this.ticketsService.findOne(id);
            if (!ticket) {
                throw new common_1.NotFoundException(`Ticket with ID ${id} not found`);
            }
            const isAdmin = ['ADMIN', 'IT'].includes(req.user?.role);
            const isOwner = ticket.userId === req.user?.id;
            const isAssignee = ticket.assignedTo === req.user?.id;
            if (!isAdmin && !isOwner && !isAssignee) {
                throw new common_1.ForbiddenException('Permission denied');
            }
            return ticket;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(`Failed to fetch ticket: ${error.message}`);
        }
    }
    async findByCode(code, req) {
        try {
            const ticket = await this.ticketsService.findByCode(code);
            if (!ticket) {
                throw new common_1.NotFoundException(`Ticket with code ${code} not found`);
            }
            const isAdmin = ['ADMIN', 'IT'].includes(req.user?.role);
            const isOwner = ticket.userId === req.user?.id;
            const isAssignee = ticket.assignedTo === req.user?.id;
            if (!isAdmin && !isOwner && !isAssignee) {
                throw new common_1.ForbiddenException('Permission denied');
            }
            return ticket;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(`Failed to fetch ticket: ${error.message}`);
        }
    }
    async findByEmail(email, req) {
        if (!['ADMIN', 'IT'].includes(req.user?.role)) {
            throw new common_1.ForbiddenException('Only ADMIN or IT can search by email');
        }
        try {
            const tickets = await this.ticketsService.findByEmail(email);
            return tickets;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Failed to search tickets: ${error.message}`);
        }
    }
    async update(id, updateTicketDto, req) {
        const ticket = await this.ticketsService.findOne(id);
        if (!ticket)
            throw new common_1.NotFoundException(`Ticket ${id} not found`);
        const isAdmin = ['ADMIN', 'IT'].includes(req.user?.role);
        const isOwner = ticket.userId === req.user?.id;
        const isAssignee = ticket.assignedTo === req.user?.id;
        if (!isAdmin && !isOwner && !isAssignee) {
            throw new common_1.ForbiddenException('Permission denied');
        }
        return this.ticketsService.update(id, updateTicketDto);
    }
    async remove(id, req) {
        if (req.user?.role !== 'ADMIN' && req.user?.role !== 'IT') {
            throw new common_1.ForbiddenException('Only ADMIN or IT can delete tickets');
        }
        return this.ticketsService.remove(id);
    }
};
exports.TicketsController = TicketsController;
__decorate([
    (0, common_1.Post)(),
    (0, public_decorator_1.Public)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 5)),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_ticket_dto_1.CreateTicketDto, Array]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('code/:code'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "findByCode", null);
__decorate([
    (0, common_1.Get)('search/by-email/:email'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('email')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "findByEmail", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_ticket_dto_1.UpdateTicketDto, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "remove", null);
exports.TicketsController = TicketsController = __decorate([
    (0, common_1.Controller)('api/tickets'),
    __metadata("design:paramtypes", [tickets_service_1.TicketsService])
], TicketsController);
//# sourceMappingURL=tickets.controller.js.map