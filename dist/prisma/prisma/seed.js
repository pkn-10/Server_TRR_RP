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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const password = await bcrypt.hash('123456', 10);
    const users = [
        {
            name: 'System Admin',
            email: 'admin@company.com',
            role: client_1.Role.ADMIN,
        },
        {
            name: 'IT Support',
            email: 'it@company.com',
            role: client_1.Role.IT,
        },
        {
            name: 'Normal User',
            email: 'user@company.com',
            role: client_1.Role.USER,
        },
    ];
    for (const u of users) {
        const exists = await prisma.user.findUnique({
            where: { email: u.email },
        });
        if (!exists) {
            await prisma.user.create({
                data: {
                    name: u.name,
                    email: u.email,
                    password,
                    role: u.role,
                },
            });
            console.log(`✅ Created ${u.role}: ${u.email}`);
        }
        else {
            console.log(`⚠️ Exists: ${u.email}`);
        }
    }
    const adminUser = await prisma.user.findUnique({
        where: { email: 'admin@company.com' },
    });
    const itUser = await prisma.user.findUnique({
        where: { email: 'it@company.com' },
    });
    if (adminUser && itUser) {
        const ticketExists = await prisma.ticket.findFirst({
            where: { userId: adminUser.id },
        });
        if (!ticketExists) {
            await prisma.ticket.create({
                data: {
                    ticketCode: `TKT-2025-${Date.now().toString().slice(-6)}`,
                    title: 'เครื่องพิมพ์ไม่ทำงาน',
                    description: 'เครื่องพิมพ์ HP LaserJet ในห้องธุรการไม่สามารถพิมพ์เอกสารได้',
                    equipmentName: 'HP LaserJet Pro M404n',
                    equipmentId: 'FS-CNT-6407001',
                    location: 'ห้องธุรการ ชั้น 3',
                    category: 'REPAIR',
                    problemCategory: client_1.ProblemCategory.PERIPHERAL,
                    problemSubcategory: client_1.ProblemSubcategory.OTHER,
                    priority: client_1.Priority.HIGH,
                    status: client_1.TicketStatus.OPEN,
                    notes: 'ตรวจเชคหมึก ปลั๊ก และการเชื่อมต่อ',
                    requiredDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    userId: adminUser.id,
                    assignedTo: itUser.id,
                },
            });
            console.log('✅ Created test repair ticket');
        }
        else {
            console.log('⚠️ Test ticket already exists');
        }
    }
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map