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
exports.LineOAController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const line_oa_service_1 = require("./line-oa.service");
const line_oa_linking_service_1 = require("./line-oa-linking.service");
const line_oa_webhook_service_1 = require("./line-oa-webhook.service");
const public_decorator_1 = require("../auth/public.decorator");
let LineOAController = class LineOAController {
    lineOAService;
    linkingService;
    webhookService;
    constructor(lineOAService, linkingService, webhookService) {
        this.lineOAService = lineOAService;
        this.linkingService = linkingService;
        this.webhookService = webhookService;
    }
    async handleWebhook(body, signature, req) {
        const rawBody = req.rawBody;
        return await this.webhookService.handleWebhook(body, signature || '', rawBody);
    }
    async getLinkingStatus(userId) {
        return await this.linkingService.getLinkingStatus(parseInt(userId));
    }
    async initiateLinking(body) {
        return await this.linkingService.initiateLinking(body.userId);
    }
    async verifyLink(body) {
        return await this.linkingService.verifyLink(body.userId, body.lineUserId, body.verificationToken, body.force || false);
    }
    async unlinkAccount(userId) {
        return await this.linkingService.unlinkAccount(parseInt(userId));
    }
    async getNotifications(userId = '1', limit = '20') {
        return await this.lineOAService.getNotifications(parseInt(userId) || 1, parseInt(limit) || 20);
    }
    async healthCheck() {
        return {
            status: 'ok',
            message: 'LINE OA integration is running',
        };
    }
};
exports.LineOAController = LineOAController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, throttler_1.SkipThrottle)(),
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-line-signature')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], LineOAController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('linking/status'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LineOAController.prototype, "getLinkingStatus", null);
__decorate([
    (0, common_1.Post)('linking/initiate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LineOAController.prototype, "initiateLinking", null);
__decorate([
    (0, common_1.Post)('linking/verify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LineOAController.prototype, "verifyLink", null);
__decorate([
    (0, common_1.Delete)('linking/unlink'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LineOAController.prototype, "unlinkAccount", null);
__decorate([
    (0, common_1.Get)('notifications'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LineOAController.prototype, "getNotifications", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LineOAController.prototype, "healthCheck", null);
exports.LineOAController = LineOAController = __decorate([
    (0, common_1.Controller)('/api/line-oa'),
    __metadata("design:paramtypes", [line_oa_service_1.LineOAService,
        line_oa_linking_service_1.LineOALinkingService,
        line_oa_webhook_service_1.LineOAWebhookService])
], LineOAController);
//# sourceMappingURL=line-oa.controller.js.map