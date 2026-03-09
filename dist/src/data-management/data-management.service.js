"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DataManagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const ExcelJS = __importStar(require("exceljs"));
const AdmZip = require("adm-zip");
let DataManagementService = DataManagementService_1 = class DataManagementService {
    prisma;
    cloudinary;
    logger = new common_1.Logger(DataManagementService_1.name);
    constructor(prisma, cloudinary) {
        this.prisma = prisma;
        this.cloudinary = cloudinary;
    }
    dataTypeDefinitions = {
        repairs: {
            key: 'repairs',
            label: 'การแจ้งซ่อม',
        },
        loans: {
            key: 'loans',
            label: 'การยืม',
        },
        notifications: {
            key: 'notifications',
            label: 'การแจ้งเตือน',
        },
        stock: {
            key: 'stock',
            label: 'สต็อก',
        },
        departments: {
            key: 'departments',
            label: 'แผนก',
        },
    };
    async getDataTypes() {
        const counts = await this.getDataCounts();
        return Object.entries(this.dataTypeDefinitions).map(([key, def]) => ({
            ...def,
            count: counts[key] || 0,
        }));
    }
    async getDataCounts() {
        const [repairs, loans, notifications, lineNotifications, stock, departments] = await Promise.all([
            this.prisma.repairTicket.count(),
            this.prisma.loan.count(),
            this.prisma.notification.count(),
            this.prisma.lineNotification.count(),
            this.prisma.stockItem.count(),
            this.prisma.department.count(),
        ]);
        return {
            repairs,
            loans,
            notifications: notifications + lineNotifications,
            stock,
            departments,
        };
    }
    async exportToExcel(types) {
        if (types.length === 1) {
            const type = types[0];
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'TRR';
            workbook.created = new Date();
            await this.addSheetForType(workbook, type);
            const buffer = await workbook.xlsx.writeBuffer();
            const def = this.dataTypeDefinitions[type];
            return {
                buffer: Buffer.from(buffer),
                fileName: `${def.key}-${new Date().toISOString().split('T')[0]}.xlsx`,
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            };
        }
        const zip = new AdmZip();
        for (const type of types) {
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'TRR';
            workbook.created = new Date();
            await this.addSheetForType(workbook, type);
            const buffer = await workbook.xlsx.writeBuffer();
            const def = this.dataTypeDefinitions[type];
            zip.addFile(`${def.label}.xlsx`, Buffer.from(buffer));
        }
        const zipBuffer = zip.toBuffer();
        return {
            buffer: zipBuffer,
            fileName: `data-export-${new Date().toISOString().split('T')[0]}.zip`,
            mimeType: 'application/zip'
        };
    }
    async addSheetForType(workbook, type) {
        switch (type) {
            case 'repairs':
                await this.addRepairsSheet(workbook);
                break;
            case 'loans':
                await this.addLoansSheet(workbook);
                break;
            case 'notifications':
                await this.addNotificationsSheet(workbook);
                break;
            case 'stock':
                await this.addStockSheet(workbook);
                break;
            case 'departments':
                await this.addDepartmentsSheet(workbook);
                break;
        }
    }
    async addRepairsSheet(workbook) {
        const sheet = workbook.addWorksheet('การแจ้งซ่อม');
        const repairs = await this.prisma.repairTicket.findMany({
            include: {
                user: { select: { name: true, email: true } },
                assignees: { include: { user: { select: { name: true } } } },
            },
        });
        sheet.columns = [
            { header: 'รหัส', key: 'ticketCode', width: 15 },
            { header: 'ชื่อปัญหา', key: 'problemTitle', width: 30 },
            { header: 'สถานที่', key: 'location', width: 20 },
            { header: 'ผู้แจ้ง', key: 'reporterName', width: 20 },
            { header: 'โทรศัพท์', key: 'reporterPhone', width: 15 },
            { header: 'สถานะ', key: 'status', width: 15 },
            { header: 'ความเร่งด่วน', key: 'urgency', width: 12 },
            { header: 'ผู้รับผิดชอบ', key: 'assignees', width: 30 },
            { header: 'วันที่สร้าง', key: 'createdAt', width: 20 },
        ];
        this.styleHeaderRow(sheet);
        repairs.forEach(repair => {
            sheet.addRow({
                ticketCode: repair.ticketCode,
                problemTitle: repair.problemTitle,
                location: repair.location,
                reporterName: repair.reporterName,
                reporterPhone: repair.reporterPhone || '-',
                status: repair.status,
                urgency: repair.urgency,
                assignees: repair.assignees.map(a => a.user.name).join(', ') || '-',
                createdAt: repair.createdAt.toISOString(),
            });
        });
    }
    async addLoansSheet(workbook) {
        const sheet = workbook.addWorksheet('การยืม');
        const loans = await this.prisma.loan.findMany({
            include: { borrowedBy: { select: { name: true } } },
        });
        sheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'รายการ', key: 'itemName', width: 30 },
            { header: 'จำนวน', key: 'quantity', width: 10 },
            { header: 'ผู้ยืม', key: 'borrower', width: 20 },
            { header: 'แผนก', key: 'department', width: 20 },
            { header: 'โทรศัพท์', key: 'phone', width: 15 },
            { header: 'วันที่ยืม', key: 'borrowDate', width: 15 },
            { header: 'กำหนดคืน', key: 'expectedReturn', width: 15 },
            { header: 'วันที่คืน', key: 'returnDate', width: 15 },
            { header: 'สถานะ', key: 'status', width: 12 },
        ];
        this.styleHeaderRow(sheet);
        loans.forEach(loan => {
            sheet.addRow({
                id: loan.id,
                itemName: loan.itemName || '-',
                quantity: loan.quantity,
                borrower: loan.borrowerName || loan.borrowedBy.name,
                department: loan.borrowerDepartment || '-',
                phone: loan.borrowerPhone || '-',
                borrowDate: loan.borrowDate.toISOString().split('T')[0],
                expectedReturn: loan.expectedReturnDate?.toISOString().split('T')[0] || '-',
                returnDate: loan.returnDate?.toISOString().split('T')[0] || '-',
                status: loan.status,
            });
        });
    }
    async addNotificationsSheet(workbook) {
        const sheet = workbook.addWorksheet('การแจ้งเตือน');
        const notifications = await this.prisma.notification.findMany({
            include: { user: { select: { name: true } } },
        });
        sheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'ผู้รับ', key: 'user', width: 20 },
            { header: 'ประเภท', key: 'type', width: 20 },
            { header: 'หัวข้อ', key: 'title', width: 30 },
            { header: 'ข้อความ', key: 'message', width: 50 },
            { header: 'สถานะ', key: 'status', width: 12 },
            { header: 'วันที่สร้าง', key: 'createdAt', width: 20 },
        ];
        this.styleHeaderRow(sheet);
        notifications.forEach(n => {
            sheet.addRow({
                id: n.id,
                user: n.user.name,
                type: n.type,
                title: n.title,
                message: n.message,
                status: n.status,
                createdAt: n.createdAt.toISOString(),
            });
        });
    }
    async addStockSheet(workbook) {
        const sheet = workbook.addWorksheet('สต็อก');
        const items = await this.prisma.stockItem.findMany();
        sheet.columns = [
            { header: 'รหัส', key: 'code', width: 15 },
            { header: 'ชื่อ', key: 'name', width: 30 },
            { header: 'จำนวน', key: 'quantity', width: 10 },
            { header: 'หมวดหมู่', key: 'category', width: 20 },
            { header: 'วันที่สร้าง', key: 'createdAt', width: 20 },
        ];
        this.styleHeaderRow(sheet);
        items.forEach(item => {
            sheet.addRow({
                code: item.code,
                name: item.name,
                quantity: item.quantity,
                category: item.category || '-',
                createdAt: item.createdAt.toISOString(),
            });
        });
    }
    async addDepartmentsSheet(workbook) {
        const sheet = workbook.addWorksheet('แผนก');
        const departments = await this.prisma.department.findMany();
        sheet.columns = [
            { header: 'รหัส', key: 'code', width: 15 },
            { header: 'ชื่อ', key: 'name', width: 30 },
            { header: 'คำอธิบาย', key: 'description', width: 40 },
            { header: 'สถานที่', key: 'location', width: 20 },
            { header: 'อีเมล', key: 'contactEmail', width: 25 },
            { header: 'โทรศัพท์', key: 'contactPhone', width: 15 },
            { header: 'หัวหน้า', key: 'headName', width: 20 },
        ];
        this.styleHeaderRow(sheet);
        departments.forEach(dept => {
            sheet.addRow({
                code: dept.code,
                name: dept.name,
                description: dept.description || '-',
                location: dept.location || '-',
                contactEmail: dept.contactEmail || '-',
                contactPhone: dept.contactPhone || '-',
                headName: dept.headName || '-',
            });
        });
    }
    styleHeaderRow(sheet) {
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4F46E5' },
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;
    }
    async clearData(types) {
        const deleted = {};
        const publicIdsToDelete = [];
        for (const type of types) {
            if (type === 'repairs') {
                const repairAttachments = await this.prisma.repairAttachment.findMany({ select: { fileUrl: true } });
                for (const att of repairAttachments) {
                    const publicId = this.cloudinary.extractPublicIdFromUrl(att.fileUrl);
                    if (publicId)
                        publicIdsToDelete.push(publicId);
                }
            }
        }
        await this.prisma.$transaction(async (tx) => {
            for (const type of types) {
                switch (type) {
                    case 'repairs':
                        const assignmentHistory = await tx.repairAssignmentHistory.deleteMany();
                        const repairLogs = await tx.repairTicketLog.deleteMany();
                        const repairAssignees = await tx.repairTicketAssignee.deleteMany();
                        const repairAttachmentsDeleted = await tx.repairAttachment.deleteMany();
                        const repairs = await tx.repairTicket.deleteMany();
                        deleted['repairs'] = repairs.count;
                        deleted['repairLogs'] = repairLogs.count;
                        deleted['repairAssignees'] = repairAssignees.count;
                        deleted['repairAttachments'] = repairAttachmentsDeleted.count;
                        deleted['assignmentHistory'] = assignmentHistory.count;
                        break;
                    case 'loans':
                        const loans = await tx.loan.deleteMany();
                        deleted['loans'] = loans.count;
                        break;
                    case 'notifications':
                        const notifications = await tx.notification.deleteMany();
                        const lineNotifications = await tx.lineNotification.deleteMany();
                        deleted['notifications'] = notifications.count;
                        deleted['lineNotifications'] = lineNotifications.count;
                        break;
                    case 'stock':
                        const stockTransactions = await tx.stockTransaction.deleteMany();
                        const stock = await tx.stockItem.deleteMany();
                        deleted['stockTransactions'] = stockTransactions.count;
                        deleted['stock'] = stock.count;
                        break;
                    case 'departments':
                        const departments = await tx.department.deleteMany();
                        deleted['departments'] = departments.count;
                        break;
                }
            }
        });
        if (publicIdsToDelete.length > 0) {
            this.logger.log(`Deleting ${publicIdsToDelete.length} files from Cloudinary...`);
            const results = await Promise.allSettled(publicIdsToDelete.map(id => this.cloudinary.deleteFile(id)));
            const failed = results.filter(r => r.status === 'rejected');
            if (failed.length > 0) {
                this.logger.error(`Failed to delete ${failed.length} files from Cloudinary`);
            }
        }
        this.logger.warn(`Data cleared by admin: ${JSON.stringify(deleted)}`);
        return { success: true, deleted };
    }
};
exports.DataManagementService = DataManagementService;
exports.DataManagementService = DataManagementService = DataManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], DataManagementService);
//# sourceMappingURL=data-management.service.js.map