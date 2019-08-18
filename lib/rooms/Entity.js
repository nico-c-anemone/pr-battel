"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("@colyseus/schema");
class Entity extends schema_1.Schema {
    constructor(x, y, radius) {
        super();
        this.dead = false;
        this.angle = 0;
        this.speed = 0;
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
    static distance(a, b) {
        return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    }
}
__decorate([
    schema_1.type("number")
], Entity.prototype, "x", void 0);
__decorate([
    schema_1.type("number")
], Entity.prototype, "y", void 0);
__decorate([
    schema_1.type("number")
], Entity.prototype, "radius", void 0);
exports.Entity = Entity;
