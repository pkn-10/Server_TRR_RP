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
exports.DataManagementController = void 0;
const common_1 = require("@nestjs/common");
const data_management_service_1 = require("./data-management.service");
const clear_data_dto_1 = require("./dto/clear-data.dto");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let DataManagementController = class DataManagementController {
    dataManagementService;
    constructor(dataManagementService) {
        this.dataManagementService = dataManagementService;
    }
    async getDataTypes() {
        return this.dataManagementService.getDataTypes();
    }
    async exportData(dto, res) {
        const result = await this.dataManagementService.exportToExcel(dto.types);
        res.setHeader('Content-Type', result.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
        res.setHeader('Content-Length', result.buffer.length);
        return res.status(common_1.HttpStatus.OK).send(result.buffer);
    }
    async clearData(dto, res) {
        if (dto.exportFirst) {
            const result = await this.dataManagementService.exportToExcel(dto.types);
            await this.dataManagementService.clearData(dto.types);
            const filename = `backup-${result.fileName}`;
            res.setHeader('Content-Type', result.mimeType);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', result.buffer.length);
            return res.status(common_1.HttpStatus.OK).send(result.buffer);
        }
        const result = await this.dataManagementService.clearData(dto.types);
        return res.status(common_1.HttpStatus.OK).json(result);
    }
};
exports.DataManagementController = DataManagementController;
__decorate([
    (0, common_1.Get)('types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DataManagementController.prototype, "getDataTypes", null);
__decorate([
    (0, common_1.Post)('export'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [clear_data_dto_1.ExportDataDto, Object]),
    __metadata("design:returntype", Promise)
], DataManagementController.prototype, "exportData", null);
__decorate([
    (0, common_1.Post)('clear'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [clear_data_dto_1.ClearDataDto, Object]),
    __metadata("design:returntype", Promise)
], DataManagementController.prototype, "clearData", null);
exports.DataManagementController = DataManagementController = __decorate([
    (0, common_1.Controller)('api/data-management'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __metadata("design:paramtypes", [data_management_service_1.DataManagementService])
], DataManagementController);
//# sourceMappingURL=data-management.controller.js.map