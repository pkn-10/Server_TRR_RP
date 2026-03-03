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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var LineOALinkingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineOALinkingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_1 = __importDefault(require("crypto"));
let LineOALinkingService = LineOALinkingService_1 = class LineOALinkingService {
    prisma;
    logger = new common_1.Logger(LineOALinkingService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async initiateLinking(userId) {
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const expiryTime = new Date(Date.now() + 15 * 60 * 1000);
        const existingLink = await this.prisma.lineOALink.findUnique({
            where: { userId },
        });
        if (existingLink && existingLink.status === 'VERIFIED') {
            return {
                message: 'Account already linked',
                isLinked: true,
            };
        }
        if (existingLink) {
            await this.prisma.lineOALink.update({
                where: { userId },
                data: {
                    verificationToken,
                    verificationExpiry: expiryTime,
                    status: 'PENDING',
                },
            });
        }
        else {
            await this.prisma.lineOALink.create({
                data: {
                    userId,
                    lineUserId: '',
                    verificationToken,
                    verificationExpiry: expiryTime,
                    status: 'PENDING',
                },
            });
        }
        const linkingUrl = this.generateLinkingUrl(verificationToken);
        return {
            linkingUrl,
            verificationToken,
            expiresIn: 900,
            message: 'Please scan the QR code or click the link to link your LINE account',
        };
    }
    async verifyLink(userId, lineUserId, verificationToken, force = false) {
        const linkingRecord = await this.prisma.lineOALink.findFirst({
            where: {
                userId,
                verificationToken,
            },
        });
        if (!linkingRecord) {
            throw new common_1.BadRequestException('Invalid verification token');
        }
        if (linkingRecord.verificationExpiry &&
            linkingRecord.verificationExpiry < new Date()) {
            throw new common_1.BadRequestException('Verification token expired');
        }
        const existingLink = await this.prisma.lineOALink.findFirst({
            where: { lineUserId },
        });
        if (existingLink && existingLink.userId !== userId) {
            if (!force) {
                throw new common_1.BadRequestException('This LINE account is already linked');
            }
            this.logger.log(`Force linking: Removing link from user ${existingLink.userId}`);
            await this.prisma.lineOALink.delete({
                where: { userId: existingLink.userId },
            });
        }
        const updatedLink = await this.prisma.lineOALink.update({
            where: { userId },
            data: {
                lineUserId,
                status: 'VERIFIED',
                verificationToken: null,
                verificationExpiry: null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        this.logger.log(`User ${userId} linked with LINE account ${lineUserId}`);
        return {
            message: 'Account linked successfully',
            data: {
                userId: updatedLink.userId,
                lineUserId: updatedLink.lineUserId,
                status: updatedLink.status,
                linkedAt: updatedLink.updatedAt,
            },
        };
    }
    async getLinkingStatus(userId) {
        const linkingRecord = await this.prisma.lineOALink.findUnique({
            where: { userId },
        });
        if (!linkingRecord) {
            return {
                isLinked: false,
                data: null,
            };
        }
        return {
            isLinked: linkingRecord.status === 'VERIFIED',
            data: linkingRecord.status === 'VERIFIED'
                ? {
                    lineUserId: linkingRecord.lineUserId,
                    displayName: linkingRecord.displayName,
                    pictureUrl: linkingRecord.pictureUrl,
                    status: linkingRecord.status,
                    linkedAt: linkingRecord.updatedAt,
                }
                : null,
        };
    }
    async unlinkAccount(userId) {
        const linkingRecord = await this.prisma.lineOALink.findUnique({
            where: { userId },
        });
        if (!linkingRecord) {
            throw new common_1.BadRequestException('No LINE account linked');
        }
        await this.prisma.lineOALink.delete({
            where: { userId },
        });
        this.logger.log(`User ${userId} unlinked their LINE account`);
        return {
            message: 'Account unlinked successfully',
        };
    }
    generateLinkingUrl(verificationToken) {
        let baseUrl = process.env.FRONTEND_URL || process.env.LINE_LOGIN_REDIRECT_URI || 'http://localhost:3000';
        baseUrl = baseUrl.replace(/\/$/, '');
        if (baseUrl.endsWith('/auth/line/callback')) {
            return `${baseUrl}?token=${verificationToken}`;
        }
        return `${baseUrl}/auth/line/callback?token=${verificationToken}`;
    }
    async updateProfileFromLine(userId, lineUserId, displayName, pictureUrl) {
        const updated = await this.prisma.lineOALink.update({
            where: { userId },
            data: {
                displayName,
                pictureUrl,
            },
        });
        return updated;
    }
    async linkReporterLine(linkingCode, lineUserId) {
        try {
            const ticket = await this.prisma.repairTicket.findFirst({
                where: { linkingCode },
            });
            if (!ticket) {
                return { success: false, error: 'ไม่พบรหัสนี้ในระบบ กรุณาตรวจสอบอีกครั้ง' };
            }
            if (ticket.reporterLineUserId) {
                return { success: false, error: 'รหัสนี้ถูกผูกกับ LINE แล้ว' };
            }
            const ticketAgeMs = Date.now() - ticket.createdAt.getTime();
            const expirationMs = 24 * 60 * 60 * 1000;
            if (ticketAgeMs > expirationMs) {
                return { success: false, error: 'รหัสนี้หมดอายุแล้ว (เกิน 24 ชั่วโมง)' };
            }
            await this.prisma.repairTicket.update({
                where: { id: ticket.id },
                data: { reporterLineUserId: lineUserId },
            });
            this.logger.log(`Linked reporter LINE ${lineUserId} to ticket ${ticket.ticketCode}`);
            return { success: true, ticketCode: ticket.ticketCode };
        }
        catch (error) {
            this.logger.error('Error linking reporter LINE:', error);
            return { success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' };
        }
    }
};
exports.LineOALinkingService = LineOALinkingService;
exports.LineOALinkingService = LineOALinkingService = LineOALinkingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LineOALinkingService);
//# sourceMappingURL=line-oa-linking.service.js.map