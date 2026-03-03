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
exports.CreateRepairTicketDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateRepairTicketDto {
    reporterName;
    reporterDepartment;
    reporterPhone;
    reporterLineId;
    accessToken;
    problemCategory;
    problemTitle;
    problemDescription;
    location;
    urgency;
    assignedTo;
    notes;
    scheduledAt;
}
exports.CreateRepairTicketDto = CreateRepairTicketDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'กรุณาระบุชื่อผู้แจ้ง' }),
    (0, class_validator_1.MaxLength)(100, { message: 'ชื่อผู้แจ้งต้องไม่เกิน 100 ตัวอักษร' }),
    __metadata("design:type", String)
], CreateRepairTicketDto.prototype, "reporterName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateRepairTicketDto.prototype, "reporterDepartment", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^0\d{9}$/, { message: 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 0' }),
    __metadata("design:type", String)
], CreateRepairTicketDto.prototype, "reporterPhone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRepairTicketDto.prototype, "reporterLineId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRepairTicketDto.prototype, "accessToken", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ProblemCategory),
    __metadata("design:type", String)
], CreateRepairTicketDto.prototype, "problemCategory", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'กรุณาระบุหัวข้อปัญหา' }),
    (0, class_validator_1.MaxLength)(300, { message: 'หัวข้อปัญหาต้องไม่เกิน 300 ตัวอักษร' }),
    __metadata("design:type", String)
], CreateRepairTicketDto.prototype, "problemTitle", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000, { message: 'รายละเอียดปัญหาต้องไม่เกิน 2000 ตัวอักษร' }),
    __metadata("design:type", String)
], CreateRepairTicketDto.prototype, "problemDescription", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateRepairTicketDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.UrgencyLevel),
    __metadata("design:type", String)
], CreateRepairTicketDto.prototype, "urgency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateRepairTicketDto.prototype, "assignedTo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateRepairTicketDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateRepairTicketDto.prototype, "scheduledAt", void 0);
//# sourceMappingURL=create-repair-ticket.dto.js.map