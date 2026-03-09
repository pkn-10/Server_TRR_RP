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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StockService = class StockService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.stockItem.findMany({
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: { select: { transactions: true } },
            },
        });
    }
    async findOne(id) {
        const item = await this.prisma.stockItem.findUnique({
            where: { id },
            include: {
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!item) {
            throw new common_1.NotFoundException(`ไม่พบรหัส #${id}`);
        }
        return item;
    }
    async create(data) {
        return this.prisma.stockItem.create({ data });
    }
    async update(id, data) {
        const item = await this.prisma.stockItem.findUnique({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException(`ไม่พบรหัส #${id}`);
        }
        return this.prisma.stockItem.update({
            where: { id },
            data,
        });
    }
    async withdraw(id, quantity, reference, note, userId) {
        return this.prisma.$transaction(async (tx) => {
            const item = await tx.stockItem.findUnique({ where: { id } });
            if (!item) {
                throw new common_1.NotFoundException(`ไม่พบรหัส #${id}`);
            }
            if (item.quantity < quantity) {
                throw new common_1.BadRequestException(`สต๊อกไม่เพียงพอ (คงเหลือ ${item.quantity}, ต้องการเบิก ${quantity})`);
            }
            const newQty = item.quantity - quantity;
            await tx.stockItem.update({
                where: { id },
                data: { quantity: newQty },
            });
            return tx.stockTransaction.create({
                data: {
                    stockItemId: id,
                    type: 'OUT',
                    quantity,
                    previousQty: item.quantity,
                    newQty,
                    reference,
                    note,
                    userId,
                },
            });
        });
    }
    async addStock(id, quantity, reference, note, userId) {
        return this.prisma.$transaction(async (tx) => {
            const item = await tx.stockItem.findUnique({ where: { id } });
            if (!item) {
                throw new common_1.NotFoundException(`ไม่พบรหัส #${id}`);
            }
            const newQty = item.quantity + quantity;
            await tx.stockItem.update({
                where: { id },
                data: { quantity: newQty },
            });
            return tx.stockTransaction.create({
                data: {
                    stockItemId: id,
                    type: 'IN',
                    quantity,
                    previousQty: item.quantity,
                    newQty,
                    reference,
                    note,
                    userId,
                },
            });
        });
    }
    async findTransactions(stockItemId) {
        return this.prisma.stockTransaction.findMany({
            where: stockItemId ? { stockItemId } : {},
            orderBy: { createdAt: 'desc' },
            include: { stockItem: true },
        });
    }
    async remove(id) {
        const item = await this.prisma.stockItem.findUnique({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException(`ไม่พบรหัส #${id}`);
        }
        return this.prisma.stockItem.delete({
            where: { id },
        });
    }
    async deleteCategory(name) {
        return this.prisma.stockItem.updateMany({
            where: { category: name },
            data: { category: null },
        });
    }
    async bulkImport(items) {
        let created = 0;
        let updated = 0;
        const errors = [];
        for (const item of items) {
            try {
                if (!item.code || !item.name || !item.category) {
                    errors.push({ code: item.code || '(ว่าง)', name: item.name || '(ว่าง)', category: item.category || '(ว่าง)', error: 'ไม่มี code หรือ name หรือ category' });
                    continue;
                }
                const existing = await this.prisma.stockItem.findUnique({
                    where: {
                        code_name_category: {
                            code: item.code,
                            name: item.name,
                            category: item.category,
                        },
                    },
                });
                if (existing) {
                    await this.prisma.stockItem.update({
                        where: { id: existing.id },
                        data: {
                            quantity: item.quantity,
                        },
                    });
                    updated++;
                }
                else {
                    await this.prisma.stockItem.create({
                        data: {
                            code: item.code,
                            name: item.name,
                            category: item.category,
                            quantity: item.quantity,
                        },
                    });
                    created++;
                }
            }
            catch (error) {
                const errMsg = error instanceof Error ? error.message : String(error);
                console.error(`Error importing item ${item.code}:`, error);
                errors.push({ code: item.code || '(ว่าง)', name: item.name || '(ว่าง)', category: item.category || '(ว่าง)', error: errMsg });
            }
        }
        return { created, updated, total: items.length, errors };
    }
};
exports.StockService = StockService;
exports.StockService = StockService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StockService);
//# sourceMappingURL=stock.service.js.map