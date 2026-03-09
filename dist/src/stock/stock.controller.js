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
exports.StockController = void 0;
const common_1 = require("@nestjs/common");
const stock_service_1 = require("./stock.service");
const client_1 = require("@prisma/client");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const create_stock_dto_1 = require("./dto/create-stock.dto");
const update_stock_dto_1 = require("./dto/update-stock.dto");
const withdraw_stock_dto_1 = require("./dto/withdraw-stock.dto");
const add_stock_dto_1 = require("./dto/add-stock.dto");
const bulk_import_stock_dto_1 = require("./dto/bulk-import-stock.dto");
let StockController = class StockController {
    stockService;
    constructor(stockService) {
        this.stockService = stockService;
    }
    async findAll() {
        return this.stockService.findAll();
    }
    async getTransactions(stockItemId) {
        const parsedId = stockItemId ? parseInt(stockItemId, 10) : undefined;
        return this.stockService.findTransactions(parsedId);
    }
    async findOne(id) {
        return this.stockService.findOne(id);
    }
    async create(createStockDto) {
        return this.stockService.create({
            code: createStockDto.code,
            name: createStockDto.name,
            quantity: createStockDto.quantity,
            category: createStockDto.category,
        });
    }
    async update(id, updateStockDto) {
        return this.stockService.update(id, {
            code: updateStockDto.code,
            name: updateStockDto.name,
            quantity: updateStockDto.quantity !== undefined ? updateStockDto.quantity : undefined,
            category: updateStockDto.category,
        });
    }
    async withdraw(id, withdrawDto) {
        return this.stockService.withdraw(id, withdrawDto.quantity, withdrawDto.reference, withdrawDto.note, withdrawDto.userId);
    }
    async addStock(id, addStockDto) {
        return this.stockService.addStock(id, addStockDto.quantity, addStockDto.reference, addStockDto.note, addStockDto.userId);
    }
    async remove(id) {
        return this.stockService.remove(id);
    }
    async deleteCategory(name) {
        return this.stockService.deleteCategory(name);
    }
    async bulkImport(bulkImportDto) {
        return this.stockService.bulkImport(bulkImportDto.items);
    }
};
exports.StockController = StockController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StockController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Query)('stockItemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StockController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StockController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.IT),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_stock_dto_1.CreateStockDto]),
    __metadata("design:returntype", Promise)
], StockController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.IT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_stock_dto_1.UpdateStockDto]),
    __metadata("design:returntype", Promise)
], StockController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/withdraw'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.IT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, withdraw_stock_dto_1.WithdrawStockDto]),
    __metadata("design:returntype", Promise)
], StockController.prototype, "withdraw", null);
__decorate([
    (0, common_1.Post)(':id/add-stock'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.IT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, add_stock_dto_1.AddStockDto]),
    __metadata("design:returntype", Promise)
], StockController.prototype, "addStock", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.IT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StockController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)('categories/:name'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.IT),
    __param(0, (0, common_1.Param)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StockController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Post)('bulk-import'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.IT),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_import_stock_dto_1.BulkImportStockDto]),
    __metadata("design:returntype", Promise)
], StockController.prototype, "bulkImport", null);
exports.StockController = StockController = __decorate([
    (0, common_1.Controller)('api/stock'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [stock_service_1.StockService])
], StockController);
//# sourceMappingURL=stock.controller.js.map