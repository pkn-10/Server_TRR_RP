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
var RepairsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepairsController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const platform_express_1 = require("@nestjs/platform-express");
const repairs_service_1 = require("./repairs.service");
const create_repair_ticket_dto_1 = require("./dto/create-repair-ticket.dto");
const update_repair_ticket_dto_1 = require("./dto/update-repair-ticket.dto");
const client_1 = require("@prisma/client");
const line_oa_notification_service_1 = require("../line-oa/line-oa-notification.service");
const users_service_1 = require("../users/users.service");
const jwt_guard_1 = require("../auth/jwt.guard");
let RepairsController = RepairsController_1 = class RepairsController {
    repairsService;
    lineNotificationService;
    usersService;
    logger = new common_1.Logger(RepairsController_1.name);
    constructor(repairsService, lineNotificationService, usersService) {
        this.repairsService = repairsService;
        this.lineNotificationService = lineNotificationService;
        this.usersService = usersService;
    }
    async createFromLiff(req, body, files) {
        try {
            const sanitize = (str) => str ? str.replace(/<[^>]*>/g, '').trim() : '';
            const dto = new create_repair_ticket_dto_1.CreateRepairTicketDto();
            dto.reporterName = sanitize(body.reporterName) || 'ไม่ได้ระบุ';
            dto.reporterDepartment = sanitize(body.reporterDepartment);
            dto.reporterPhone = sanitize(body.reporterPhone);
            dto.location = sanitize(body.location) || 'ไม่ได้ระบุ';
            const rawTitle = sanitize(body.problemTitle) || sanitize(body.problemDescription) || 'ไม่มีหัวข้อ';
            const rawDescription = sanitize(body.problemDescription) || sanitize(body.problemTitle) || '';
            if (rawTitle === rawDescription && rawTitle.length > 100) {
                dto.problemTitle = rawTitle.substring(0, 100) + '...';
            }
            else {
                dto.problemTitle = rawTitle;
            }
            const accessToken = body.accessToken;
            let validatedLineUserId;
            if (accessToken) {
                try {
                    this.logger.log(`Verifying Access token for user profile...`);
                    const response = await fetch('https://api.line.me/v2/profile', {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${accessToken}` },
                    });
                    const lineProfile = await response.json();
                    if (!response.ok || lineProfile.error) {
                        this.logger.error(`LINE profile fetch failed: ${JSON.stringify(lineProfile)} (Status: ${response.status})`);
                        throw new common_1.ForbiddenException(`Invalid LINE Access Token: ${lineProfile.message || 'Unknown error'}`);
                    }
                    validatedLineUserId = lineProfile.userId;
                }
                catch (error) {
                    this.logger.error(`Token verification exception: ${error.message}`, error.stack);
                    throw new common_1.ForbiddenException(`Failed to verify LINE Access Token: ${error.message}`);
                }
            }
            dto.reporterLineId = validatedLineUserId || 'Guest';
            const phoneRegex = /^0\d{9}$/;
            if (dto.reporterPhone && !phoneRegex.test(dto.reporterPhone)) {
                this.logger.warn(`Invalid phone format rejected: ${dto.reporterPhone}`);
                dto.reporterPhone = '';
            }
            dto.urgency = Object.values(client_1.UrgencyLevel).includes(body.urgency)
                ? body.urgency
                : client_1.UrgencyLevel.NORMAL;
            dto.problemDescription = rawDescription;
            const user = await this.usersService.getOrCreateUserFromLine(dto.reporterLineId, body.displayName, body.pictureUrl);
            return await this.repairsService.create(user.id, dto, files, validatedLineUserId);
        }
        catch (error) {
            this.logger.error(`LIFF Create Error: ${error.message}`, error.stack);
            const msg = error.response?.message || error.message || 'สร้างรายการแจ้งซ่อมไม่สำเร็จ';
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: msg,
                error: 'Internal Server Error',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getTicketForLiff(code, lineUserId) {
        if (!lineUserId) {
            throw new common_1.HttpException('LINE User ID is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const user = await this.repairsService.findUserByLineId(lineUserId);
        if (!user) {
            throw new common_1.HttpException('User not linked to LINE', common_1.HttpStatus.FORBIDDEN);
        }
        const ticket = await this.repairsService.findByCode(code);
        const isOwner = ticket.userId === user.id;
        const isAdmin = ['ADMIN', 'IT'].includes(user.role);
        if (!isOwner && !isAdmin) {
            throw new common_1.HttpException('Permission denied', common_1.HttpStatus.FORBIDDEN);
        }
        return ticket;
    }
    async getLiffUserTickets(lineUserId) {
        if (!lineUserId) {
            throw new common_1.HttpException('LINE User ID is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const user = await this.repairsService.findUserByLineId(lineUserId);
        if (!user)
            return [];
        return this.repairsService.getUserTickets(user.id);
    }
    async getTicketPublic(code) {
        try {
            const ticket = await this.repairsService.findByCode(code);
            return ticket;
        }
        catch (error) {
            throw new common_1.HttpException('Ticket not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async findAll(req, status, urgency, assignedTo, limit, startDate, endDate) {
        const user = req.user;
        return this.repairsService.findAll({
            userId: user.id,
            isAdmin: user.role === client_1.Role.ADMIN || user.role === client_1.Role.IT,
            status,
            urgency,
            assignedTo: assignedTo ? Number(assignedTo) : undefined,
            limit: limit ? Number(limit) : undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });
    }
    async create(req, dto, files) {
        return this.repairsService.create(req.user.id, dto, files);
    }
    async getSchedule() {
        return this.repairsService.getSchedule();
    }
    async getStatistics() {
        return this.repairsService.getStatistics();
    }
    async getDashboardStatistics(filter = 'day', dateStr, limitStr) {
        const date = dateStr ? new Date(dateStr) : new Date();
        const limit = limitStr ? parseInt(limitStr, 10) : undefined;
        return this.repairsService.getDashboardStatistics(filter, date, limit);
    }
    async getDepartmentStatistics(filter, dateStr) {
        const date = dateStr ? new Date(dateStr) : undefined;
        return this.repairsService.getDepartmentStatistics(filter, date);
    }
    async getUserTickets(req) {
        return this.repairsService.getUserTickets(req.user.id);
    }
    async findByCode(code) {
        return this.repairsService.findByCode(code);
    }
    async findOne(id) {
        return this.repairsService.findOne(id);
    }
    async update(id, dto, req, files) {
        try {
            const updated = await this.repairsService.update(id, dto, req.user.id, files);
            return updated;
        }
        catch (error) {
            this.logger.error(`Update repair #${id} failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async remove(id, req) {
        if (req.user.role !== client_1.Role.ADMIN && req.user.role !== client_1.Role.IT) {
            throw new common_1.ForbiddenException('Permission denied: Only ADMIN or IT can delete repair tickets');
        }
        return this.repairsService.remove(id);
    }
    async bulkDeleteByDate(startDate, endDate, req) {
        if (!startDate || !endDate) {
            throw new common_1.BadRequestException('Both startDate and endDate are required for bulk deletion');
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new common_1.BadRequestException('Invalid date format');
        }
        return this.repairsService.removeByDateRange(start, end);
    }
    async bulkDeleteByIDs(ids, req) {
        if (req.user.role !== client_1.Role.ADMIN && req.user.role !== client_1.Role.IT) {
            throw new common_1.ForbiddenException('Permission denied: Only ADMIN or IT can delete repair tickets');
        }
        if (!Array.isArray(ids) || ids.length === 0) {
            throw new common_1.BadRequestException('An array of IDs is required for bulk deletion');
        }
        return this.repairsService.removeMany(ids.map(id => Number(id)));
    }
};
exports.RepairsController = RepairsController;
__decorate([
    (0, common_1.SetMetadata)('isPublic', true),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    (0, common_1.Post)('liff/create'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 3)),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Array]),
    __metadata("design:returntype", Promise)
], RepairsController.prototype, "createFromLiff", null);
__decorate([
    (0, common_1.SetMetadata)('isPublic', true),
    (0, common_1.Get)('liff/ticket/:code'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Query)('lineUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RepairsController.prototype, "getTicketForLiff", null);
__decorate([
    (0, common_1.SetMetadata)('isPublic', true),
    (0, common_1.Get)('liff/my-tickets'),
    __param(0, (0, common_1.Query)('lineUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RepairsController.prototype, "getLiffUserTickets", null);
__decorate([
    (0, common_1.SetMetadata)('isPublic', true),
    (0, common_1.Get)('liff/ticket-public/:code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RepairsController.prototype, "getTicketPublic", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('urgency')),
    __param(3, (0, common_1.Query)('assignedTo')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('startDate')),
    __param(6, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], RepairsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 3)),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_repair_ticket_dto_1.CreateRepairTicketDto, Array]),
    __metadata("design:returntype", Promise)
], RepairsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('schedule'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RepairsController.prototype, "getSchedule", null);
__decorate([
    (0, common_1.Get)('statistics/overview'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RepairsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('statistics/dashboard'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('filter')),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], RepairsController.prototype, "getDashboardStatistics", null);
__decorate([
    (0, common_1.Get)('statistics/by-department'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('filter')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RepairsController.prototype, "getDepartmentStatistics", null);
__decorate([
    (0, common_1.Get)('user/my-tickets'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RepairsController.prototype, "getUserTickets", null);
__decorate([
    (0, common_1.Get)('code/:code'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RepairsController.prototype, "findByCode", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RepairsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 5)),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_repair_ticket_dto_1.UpdateRepairTicketDto, Object, Array]),
    __metadata("design:returntype", Promise)
], RepairsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], RepairsController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)('bulk-delete/by-date'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.SetMetadata)('roles', [client_1.Role.ADMIN]),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], RepairsController.prototype, "bulkDeleteByDate", null);
__decorate([
    (0, common_1.Delete)('bulk-delete/by-ids'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)('ids')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], RepairsController.prototype, "bulkDeleteByIDs", null);
exports.RepairsController = RepairsController = RepairsController_1 = __decorate([
    (0, common_1.Controller)('api/repairs'),
    __metadata("design:paramtypes", [repairs_service_1.RepairsService,
        line_oa_notification_service_1.LineOANotificationService,
        users_service_1.UsersService])
], RepairsController);
//# sourceMappingURL=repairs.controller.js.map