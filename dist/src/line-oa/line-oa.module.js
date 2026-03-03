"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineOAModule = void 0;
const common_1 = require("@nestjs/common");
const line_oa_controller_1 = require("./line-oa.controller");
const line_oa_service_1 = require("./line-oa.service");
const line_oa_webhook_service_1 = require("./line-oa-webhook.service");
const line_oa_linking_service_1 = require("./line-oa-linking.service");
const line_oa_notification_service_1 = require("./line-oa-notification.service");
const prisma_service_1 = require("../prisma/prisma.service");
let LineOAModule = class LineOAModule {
};
exports.LineOAModule = LineOAModule;
exports.LineOAModule = LineOAModule = __decorate([
    (0, common_1.Module)({
        controllers: [line_oa_controller_1.LineOAController],
        providers: [
            line_oa_service_1.LineOAService,
            line_oa_webhook_service_1.LineOAWebhookService,
            line_oa_linking_service_1.LineOALinkingService,
            line_oa_notification_service_1.LineOANotificationService,
            prisma_service_1.PrismaService,
        ],
        exports: [line_oa_service_1.LineOAService, line_oa_webhook_service_1.LineOAWebhookService, line_oa_linking_service_1.LineOALinkingService, line_oa_notification_service_1.LineOANotificationService],
    })
], LineOAModule);
//# sourceMappingURL=line-oa.module.js.map