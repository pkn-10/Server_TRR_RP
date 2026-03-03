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
var LineOAService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineOAService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const line = __importStar(require("@line/bot-sdk"));
let LineOAService = LineOAService_1 = class LineOAService {
    prisma;
    logger = new common_1.Logger(LineOAService_1.name);
    lineClient;
    constructor(prisma) {
        this.prisma = prisma;
        this.lineClient = new line.Client({
            channelSecret: process.env.LINE_CHANNEL_SECRET || '',
            channelAccessToken: process.env.LINE_ACCESS_TOKEN || '',
        });
        this.logger.log('LINE OA service initialized with credentials');
    }
    async sendMessage(lineUserId, message) {
        try {
            await this.lineClient.pushMessage(lineUserId, message);
            this.logger.log(`Message sent to ${lineUserId}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to send message to ${lineUserId}:`, error);
            throw error;
        }
    }
    async sendMulticast(lineUserIds, message) {
        try {
            if (lineUserIds.length === 0) {
                this.logger.warn('No recipients for multicast');
                return { success: false, reason: 'No recipients' };
            }
            await this.lineClient.multicast(lineUserIds, message);
            this.logger.log(`Multicast sent to ${lineUserIds.length} users`);
            return { success: true, count: lineUserIds.length };
        }
        catch (error) {
            this.logger.error(`Failed to send multicast:`, error);
            throw error;
        }
    }
    async getNotifications(userId, limit = 20) {
        const lineLink = await this.prisma.lineOALink.findUnique({
            where: { userId },
        });
        if (!lineLink || !lineLink.lineUserId) {
            return {
                isLinked: false,
                data: [],
            };
        }
        const notifications = await this.prisma.lineNotification.findMany({
            where: { lineUserId: lineLink.lineUserId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        return {
            isLinked: true,
            data: notifications,
            total: notifications.length,
        };
    }
    async testConnection() {
        try {
            this.logger.log('Testing LINE connection');
            const botInfo = await this.lineClient.getBotInfo();
            this.logger.log(`Connected to LINE Bot: ${botInfo.displayName}`);
            return true;
        }
        catch (error) {
            this.logger.error('Failed to connect to LINE:', error);
            return false;
        }
    }
    async getProfile(lineUserId) {
        try {
            const profile = await this.lineClient.getProfile(lineUserId);
            return {
                displayName: profile.displayName,
                pictureUrl: profile.pictureUrl,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get profile for ${lineUserId}:`, error);
            return null;
        }
    }
};
exports.LineOAService = LineOAService;
exports.LineOAService = LineOAService = LineOAService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LineOAService);
//# sourceMappingURL=line-oa.service.js.map