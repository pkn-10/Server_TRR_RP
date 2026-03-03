"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const auth_module_1 = require("./auth/auth.module");
const tickets_module_1 = require("./tickets/tickets.module");
const notification_module_1 = require("./notification/notification.module");
const users_module_1 = require("./users/users.module");
const loans_module_1 = require("./loans/loans.module");
const line_oa_module_1 = require("./line-oa/line-oa.module");
const repairs_module_1 = require("./repairs/repairs.module");
const stock_module_1 = require("./stock/stock.module");
const cloudinary_module_1 = require("./cloudinary/cloudinary.module");
const data_management_module_1 = require("./data-management/data-management.module");
const departments_module_1 = require("./departments/departments.module");
const jwt_guard_1 = require("./auth/jwt.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 20,
                }]),
            auth_module_1.AuthModule,
            tickets_module_1.TicketsModule,
            notification_module_1.NotificationModule,
            users_module_1.UsersModule,
            loans_module_1.LoansModule,
            line_oa_module_1.LineOAModule,
            repairs_module_1.RepairsModule,
            stock_module_1.StockModule,
            cloudinary_module_1.CloudinaryModule,
            data_management_module_1.DataManagementModule,
            departments_module_1.DepartmentsModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map