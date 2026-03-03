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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const jwt_guard_1 = require("../auth/jwt.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getAllUsers(page = '1', limit = '10', roles) {
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        if (pageNum < 1 || limitNum < 1) {
            throw new common_1.BadRequestException('กรุณาระบุหน้าและจำนวนที่ถูกต้อง');
        }
        return this.usersService.getAllUsers(pageNum, limitNum, roles);
    }
    async getITStaff() {
        return this.usersService.getITStaff();
    }
    async searchUsers(query) {
        if (!query || query.trim().length === 0) {
            throw new common_1.BadRequestException('กรุณาระบุคำค้นหา');
        }
        return this.usersService.searchUsers(query.trim());
    }
    async createUser(data) {
        if (!data.name || !data.email || !data.password) {
            throw new common_1.BadRequestException('ชื่อผู้ใช้ อีเมล และรหัสผ่านเป็นข้อมูลที่จำเป็น');
        }
        return this.usersService.createUser(data);
    }
    async getUserById(id) {
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
            throw new common_1.BadRequestException('รหัสผู้ใช้ไม่ถูกต้อง');
        }
        return this.usersService.getUserById(userId);
    }
    async updateUser(id, data) {
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
            throw new common_1.BadRequestException('รหัสผู้ใช้ไม่ถูกต้อง');
        }
        return this.usersService.updateUser(userId, data);
    }
    async changePassword(id, body) {
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
            throw new common_1.BadRequestException('รหัสผู้ใช้ไม่ถูกต้อง');
        }
        if (!body.newPassword || body.newPassword.trim().length === 0) {
            throw new common_1.BadRequestException('รหัสผ่านใหม่เป็นข้อมูลที่จำเป็น');
        }
        return this.usersService.changePassword(userId, body.newPassword);
    }
    async deleteUser(id) {
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
            throw new common_1.BadRequestException('รหัสผู้ใช้ไม่ถูกต้อง');
        }
        return this.usersService.deleteUser(userId);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'IT'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('roles')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('it-staff'),
    (0, roles_decorator_1.Roles)('ADMIN', 'IT'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getITStaff", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, roles_decorator_1.Roles)('ADMIN', 'IT'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "searchUsers", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'IT'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'IT'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'IT'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Post)(':id/change-password'),
    (0, roles_decorator_1.Roles)('ADMIN', 'IT'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'IT'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('api/users'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map