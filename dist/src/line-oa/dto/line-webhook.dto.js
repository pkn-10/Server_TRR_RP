"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineEvent = exports.LineWebhookDto = void 0;
class LineWebhookDto {
    events;
}
exports.LineWebhookDto = LineWebhookDto;
class LineEvent {
    type;
    timestamp;
    source;
    replyToken;
    message;
    postback;
}
exports.LineEvent = LineEvent;
//# sourceMappingURL=line-webhook.dto.js.map