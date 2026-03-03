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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const core_1 = require("@nestjs/core");
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    reflector;
    logger = new common_1.Logger('JwtAuthGuard');
    constructor(reflector) {
        super();
        this.reflector = reflector;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const url = request.url;
        this.logger.debug(`[${method}] ${url}`);
        this.logger.debug('Authorization header:', request.headers.authorization ? 'Present' : 'Missing');
        if (request.method === 'OPTIONS') {
            this.logger.debug('Skipping OPTIONS request');
            return true;
        }
        const isPublic = this.reflector.get('isPublic', context.getHandler());
        if (isPublic) {
            this.logger.debug(`✅ Endpoint ${method} ${url} is public, skipping JWT validation`);
            return true;
        }
        const isClassPublic = this.reflector.get('isPublic', context.getClass());
        if (isClassPublic) {
            this.logger.debug(`✅ Class ${method} ${url} is public, skipping JWT validation`);
            return true;
        }
        this.logger.debug('Validating JWT token...');
        const result = super.canActivate(context);
        if (result instanceof Promise) {
            return result.catch((err) => {
                this.logger.error('JWT validation failed:', err.message);
                throw new common_1.UnauthorizedException('Invalid or expired token');
            });
        }
        return result;
    }
    handleRequest(err, user, info, context) {
        const request = context.switchToHttp().getRequest();
        if (err || !user) {
            const logger = new common_1.Logger('JwtAuthGuard.handleRequest');
            logger.error('Authentication failed', {
                error: err?.message,
                info: info?.message,
                url: request.url,
            });
            throw err || new common_1.UnauthorizedException('Invalid or expired token');
        }
        return user;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], JwtAuthGuard);
//# sourceMappingURL=jwt.guard.js.map