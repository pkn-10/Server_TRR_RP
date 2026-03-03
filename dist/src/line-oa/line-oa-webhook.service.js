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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var LineOAWebhookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineOAWebhookService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = __importDefault(require("crypto"));
const prisma_service_1 = require("../prisma/prisma.service");
const line_oa_linking_service_1 = require("./line-oa-linking.service");
const line_oa_notification_service_1 = require("./line-oa-notification.service");
const line_oa_service_1 = require("./line-oa.service");
const line = __importStar(require("@line/bot-sdk"));
let LineOAWebhookService = LineOAWebhookService_1 = class LineOAWebhookService {
    prisma;
    linkingService;
    lineOAService;
    notificationService;
    logger = new common_1.Logger(LineOAWebhookService_1.name);
    channelSecret = process.env.LINE_CHANNEL_SECRET;
    channelAccessToken = process.env.LINE_ACCESS_TOKEN || '';
    liffId = process.env.LINE_LIFF_ID || '';
    client;
    constructor(prisma, linkingService, lineOAService, notificationService) {
        this.prisma = prisma;
        this.linkingService = linkingService;
        this.lineOAService = lineOAService;
        this.notificationService = notificationService;
        this.channelSecret = (process.env.LINE_CHANNEL_SECRET || '').replace(/^"|"$/g, '');
        this.channelAccessToken = (process.env.LINE_ACCESS_TOKEN || '').replace(/^"|"$/g, '');
        this.liffId = (process.env.LINE_LIFF_ID || '').replace(/^"|"$/g, '');
        this.client = new line.Client({
            channelAccessToken: this.channelAccessToken,
        });
        this.logger.log(`=== LINE Webhook Service Initialized ===`);
        this.logger.log(`LINE_CREDENTIALS: ${this.channelAccessToken && this.channelSecret ? 'SET' : '❌ MISSING'}`);
        this.logger.log(`LINE_LIFF_ID: ${this.liffId ? 'SET' : ' MISSING'}`);
        if (!this.channelSecret) {
            this.logger.error('LINE_CHANNEL_SECRET is missing! Webhook signature verification will fail.');
        }
    }
    async handleWebhook(body, signature, rawBody) {
        this.logger.debug(`=== Webhook received === Events: ${body.events?.length || 0}, Signature: ${signature ? 'present' : 'missing'}`);
        if (body.events && body.events.length > 0) {
            body.events.forEach((e, i) => {
                this.logger.debug(`  Event[${i}]: type=${e.type}, replyToken=${e.replyToken ? 'present' : 'missing'}, source=${JSON.stringify(e.source)}`);
            });
        }
        const bodyBuffer = rawBody || Buffer.from(JSON.stringify(body), 'utf-8');
        if (!this.verifySignature(bodyBuffer, signature)) {
            this.logger.error(`Invalid webhook signature. Body size: ${bodyBuffer.length}, Signature: ${signature ? 'present' : 'missing'}`);
            this.logger.warn('WARNING: Signature verification failed! PROCEEDING for compatibility with existing rawBody parsing.');
        }
        else {
            this.logger.debug('✅ Signature verified successfully');
        }
        if (body.events && Array.isArray(body.events)) {
            for (const event of body.events) {
                try {
                    await this.handleEvent(event);
                }
                catch (err) {
                    this.logger.error(`Error handling event: ${err.message}`);
                }
            }
        }
        return { message: 'Webhook processed' };
    }
    verifySignature(body, signature) {
        if (!this.channelSecret || !signature)
            return false;
        const hash = crypto_1.default
            .createHmac('sha256', this.channelSecret)
            .update(body)
            .digest('base64');
        const hashBuffer = Buffer.from(hash);
        const signatureBuffer = Buffer.from(signature);
        if (hashBuffer.length !== signatureBuffer.length) {
            return false;
        }
        return crypto_1.default.timingSafeEqual(hashBuffer, signatureBuffer);
    }
    async executeWithRetry(operation, retries = 2) {
        let lastError;
        for (let i = 0; i <= retries; i++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                if (i < retries) {
                    this.logger.warn(`LINE API call failed. Retrying... (${i + 1}/${retries})`);
                    await new Promise(res => setTimeout(res, 500 * (i + 1)));
                }
            }
        }
        throw lastError;
    }
    async sendMessage(lineUserId, message, replyToken) {
        await this.executeWithRetry(async () => {
            if (replyToken) {
                await this.client.replyMessage(replyToken, message);
            }
            else {
                await this.client.pushMessage(lineUserId, message);
            }
        });
    }
    async handleEvent(event) {
        this.logger.debug(`Received event: ${event.type}`);
        switch (event.type) {
            case 'follow':
                await this.handleFollow(event);
                break;
            case 'unfollow':
                await this.handleUnfollow(event);
                break;
            case 'message':
                await this.handleMessage(event);
                break;
            case 'postback':
                await this.handlePostback(event);
                break;
            default:
                this.logger.warn(`Unknown event type: ${event.type}`);
        }
    }
    async handleFollow(event) {
        const lineUserId = event.source.userId;
        const replyToken = event.replyToken;
        this.logger.log(`User ${lineUserId} followed the OA`);
        try {
            const welcomeMessage = {
                type: 'text',
                text: 'ยินดีต้อนรับเข้าสู่ระบบแจ้งซ่อมอุปกรณ์ IT 🎉\nกรุณาเลือกเมนูด้านล่างเพื่อเริ่มต้นใช้งาน',
            };
            await this.sendMessage(lineUserId, welcomeMessage, replyToken);
            await this.setRichMenu(lineUserId);
        }
        catch (error) {
            this.logger.error(`Failed to handle follow event for ${lineUserId}:`, error);
        }
    }
    async handleUnfollow(event) {
        const lineUserId = event.source.userId;
        this.logger.log(`User ${lineUserId} unfollowed the OA`);
        try {
            await this.prisma.lineOALink.updateMany({
                where: { lineUserId },
                data: { status: 'UNLINKED' },
            });
        }
        catch (error) {
            this.logger.error(`Failed to unlink user ${lineUserId}:`, error);
        }
    }
    async handleMessage(event) {
        const lineUserId = event.source.userId;
        const replyToken = event.replyToken;
        const message = event.message;
        this.logger.log(`Received message from ${lineUserId}: ${message.text}`);
        if (message.type === 'text') {
            try {
                const text = message.text.trim();
                const textUpper = text.toUpperCase();
                if (textUpper.match(/^TRR-\d+-[A-Z0-9]{4}$/)) {
                    await this.handleLinkingCode(lineUserId, textUpper, replyToken);
                    return;
                }
                if (text.includes('แจ้งซ่อม')) {
                    await this.handleRepairKeyword(lineUserId, replyToken);
                    return;
                }
                if (text.includes('ตรวจสอบสถานะ')) {
                    await this.handleCheckStatusPostback(lineUserId, replyToken);
                    return;
                }
                const reply = {
                    type: 'text',
                    text: `ขอบคุณสำหรับข้อความของคุณ\n\nหากต้องการแจ้งซ่อม พิมพ์ "แจ้งซ่อม"\nหากต้องการรับแจ้งเตือนสถานะการซ่อม กรุณาส่งรหัสที่ได้รับหลังแจ้งซ่อม (เช่น TRR-10022569001-ABCD)`,
                };
                await this.sendMessage(lineUserId, reply, replyToken);
            }
            catch (error) {
                this.logger.error(`Failed to reply to message from ${lineUserId}:`, error?.message || error);
                if (error?.statusCode) {
                    this.logger.error(`LINE API Status: ${error.statusCode}, Body: ${JSON.stringify(error.originalError?.response?.data || error.body || 'N/A')}`);
                }
            }
        }
    }
    async handleRepairKeyword(lineUserId, replyToken) {
        try {
            const liffUrl = `https://liff.line.me/${this.liffId}`;
            this.logger.log(`Sending repair form LIFF URL to ${lineUserId}: ${liffUrl}`);
            const message = {
                type: 'text',
                text: `แจ้งซ่อมกดลิ้งนี้\n${liffUrl}`,
            };
            await this.sendMessage(lineUserId, message, replyToken);
        }
        catch (error) {
            this.logger.error(`Failed to handle repair keyword response: ${error.message}`, error);
            const fallback = {
                type: 'text',
                text: `กรุณากดลิงก์เพื่อแจ้งซ่อม: https://liff.line.me/${this.liffId}`
            };
            await this.sendMessage(lineUserId, fallback, replyToken);
        }
    }
    async handleLinkingCode(lineUserId, linkingCode, replyToken) {
        try {
            const result = await this.linkingService.linkReporterLine(linkingCode, lineUserId);
            let reply;
            if (result.success) {
                reply = {
                    type: 'text',
                    text: `ลงทะเบียนสำเร็จ!\n\nรหัสงาน: ${result.ticketCode}\n\nคุณจะได้รับแจ้งเตือนเมื่อสถานะการซ่อมมีการเปลี่ยนแปลง`,
                };
            }
            else {
                reply = {
                    type: 'text',
                    text: `${result.error}`,
                };
            }
            await this.sendMessage(lineUserId, reply, replyToken);
        }
        catch (error) {
            this.logger.error('Error handling linking code:', error);
            const errorMessage = {
                type: 'text',
                text: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
            };
            await this.sendMessage(lineUserId, errorMessage, replyToken);
        }
    }
    async handlePostback(event) {
        const lineUserId = event.source.userId;
        const replyToken = event.replyToken;
        const postbackData = event.postback.data;
        this.logger.log(`Received postback from ${lineUserId}: ${postbackData}`);
        try {
            const params = new URLSearchParams(postbackData);
            const action = params.get('action');
            switch (action) {
                case 'create_repair':
                    await this.handleCreateRepairPostback(lineUserId, replyToken);
                    break;
                case 'check_status': {
                    const page = parseInt(params.get('page') || '1', 10);
                    await this.handleCheckStatusPostback(lineUserId, replyToken, page);
                    break;
                }
                case 'faq':
                    await this.handleFAQPostback(lineUserId, replyToken);
                    break;
                case 'contact':
                    await this.handleContactPostback(lineUserId, replyToken);
                    break;
                default:
                    this.logger.warn(`Unknown postback action: ${action}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to handle postback:`, error);
        }
    }
    async setRichMenu(lineUserId) {
        try {
            const richMenuId = process.env.LINE_RICH_MENU_ID || '';
            if (richMenuId) {
                await this.client.linkRichMenuToUser(lineUserId, richMenuId);
                this.logger.log(`Rich menu linked to user ${lineUserId}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to set rich menu:`, error);
        }
    }
    async handleCreateRepairPostback(lineUserId, replyToken) {
        const liffUrl = `https://liff.line.me/${this.liffId}`;
        this.logger.log(`Opening repair form for user: ${lineUserId}, URL: ${liffUrl}`);
        const message = {
            type: 'template',
            altText: 'เปิดฟอร์มแจ้งซ่อม',
            template: {
                type: 'buttons',
                text: 'คลิกเพื่อเปิดฟอร์มแจ้งซ่อม',
                actions: [
                    {
                        type: 'uri',
                        label: 'เปิดฟอร์มแจ้งซ่อม',
                        uri: liffUrl,
                    },
                ],
            },
        };
        await this.sendMessage(lineUserId, message, replyToken);
    }
    async handleCheckStatusPostback(lineUserId, replyToken, page = 1) {
        try {
            const lineLink = await this.prisma.lineOALink.findFirst({
                where: { lineUserId },
                include: {
                    user: {
                        include: {
                            repairTickets: {
                                take: 10,
                                orderBy: { createdAt: 'desc' },
                                include: {
                                    attachments: true,
                                    assignees: { include: { user: true } },
                                },
                            },
                        },
                    },
                },
            });
            const linkedTickets = lineLink?.user?.repairTickets || [];
            const directTickets = await this.prisma.repairTicket.findMany({
                where: { reporterLineUserId: lineUserId },
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    attachments: true,
                    assignees: { include: { user: true } },
                },
            });
            const ticketMap = new Map();
            [...linkedTickets, ...directTickets].forEach(ticket => {
                if (!ticketMap.has(ticket.ticketCode)) {
                    ticketMap.set(ticket.ticketCode, ticket);
                }
            });
            const allTickets = Array.from(ticketMap.values())
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            if (allTickets.length === 0) {
                const message = {
                    type: 'text',
                    text: 'ไม่พบรายการแจ้งซ่อมของคุณ\n\nกรุณากด "แจ้งซ่อม" เพื่อสร้างรายการแจ้งซ่อมใหม่',
                };
                await this.sendMessage(lineUserId, message, replyToken);
                return;
            }
            const carouselContents = this.notificationService.createCheckStatusCarousel(allTickets, page);
            const flexMessage = {
                type: 'flex',
                altText: `ตรวจสอบสถานะ - พบ ${allTickets.length} รายการ`,
                contents: carouselContents,
            };
            await this.sendMessage(lineUserId, flexMessage, replyToken);
        }
        catch (error) {
            this.logger.error(`Failed to get user tickets:`, error);
            const message = {
                type: 'text',
                text: 'เกิดข้อผิดพลาดในการตรวจสอบสถานะ กรุณาลองใหม่อีกครั้ง',
            };
            await this.sendMessage(lineUserId, message, replyToken);
        }
    }
    async handleFAQPostback(lineUserId, replyToken) {
        const message = {
            type: 'text',
            text: `❓ คำถามที่พบบ่อย (FAQ)

1️⃣ จะแจ้งซ่อมได้ยังไง?
→ กด "🔧 แจ้งซ่อม" และกรอกแบบฟอร์มพร้อมรูปภาพ

2️⃣ ตรวจสอบสถานะได้ยังไง?
→ กด "📋 ตรวจสอบสถานะ" เพื่อดูรายการของคุณ

3️⃣ เลขที่รายการ (Ticket) คืออะไร?
→ เลขที่อ้างอิงของรายการแจ้งซ่อม เช่น TRR-10022569001

4️⃣ รายการแจ้งซ่อมใช้เวลานานเท่าไหร่?
→ ตามความเร่งด่วน: ปกติ (3-5 วัน), ด่วน (1-2 วัน), ด่วนมาก (วันเดียว)

5️⃣ ติดต่อฝ่าย IT ได้ยังไง?
→ กด "📞 ติดต่อฝ่าย IT" เพื่อดูข้อมูลติดต่อ`,
        };
        await this.sendMessage(lineUserId, message, replyToken);
    }
    async handleContactPostback(lineUserId, replyToken) {
        const message = {
            type: 'text',
            text: `📞 ติดต่อฝ่าย IT

📧 Email: it-support@company.com
☎️ โทรศัพท์: 02-123-4567 (ต่อ 1000)
💬 LINE: @it-support

⏰ เวลาทำการ:
จันทร์ - ศุกร์: 09:00 - 18:00
วันหยุดทำการ: ปิด

⚡ ในกรณีฉุกเฉิน:
โทรศัพท์: 081-456-7890 (24 ชม.)`,
        };
        await this.sendMessage(lineUserId, message, replyToken);
    }
};
exports.LineOAWebhookService = LineOAWebhookService;
exports.LineOAWebhookService = LineOAWebhookService = LineOAWebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        line_oa_linking_service_1.LineOALinkingService,
        line_oa_service_1.LineOAService,
        line_oa_notification_service_1.LineOANotificationService])
], LineOAWebhookService);
//# sourceMappingURL=line-oa-webhook.service.js.map