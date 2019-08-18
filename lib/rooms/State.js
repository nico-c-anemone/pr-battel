"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nanoid_1 = __importDefault(require("nanoid"));
const Entity_1 = require("./Entity");
const schema_1 = require("@colyseus/schema");
const WORLD_SIZE = 2000;
const DEFAULT_PLAYER_RADIUS = 10;
class State extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.width = WORLD_SIZE;
        this.height = WORLD_SIZE;
        this.entities = new schema_1.MapSchema();
    }
    initialize() {
        // create some food entities
        for (let i = 0; i < 100; i++) {
            this.createFood();
        }
    }
    createFood() {
        const radius = Math.max(4, (Math.random() * (DEFAULT_PLAYER_RADIUS - 1)));
        const food = new Entity_1.Entity(Math.random() * this.width, Math.random() * this.height, radius);
        this.entities[nanoid_1.default(8)] = food;
    }
    createPlayer(sessionId) {
        this.entities[sessionId] = new Entity_1.Entity(Math.random() * this.width, Math.random() * this.height, DEFAULT_PLAYER_RADIUS);
    }
    update() {
        const deadEntities = [];
        for (const sessionId in this.entities) {
            const entity = this.entities[sessionId];
            if (entity.dead) {
                deadEntities.push(sessionId);
                continue;
            }
            if (entity.radius >= DEFAULT_PLAYER_RADIUS) {
                for (const collideSessionId in this.entities) {
                    const collideTestEntity = this.entities[collideSessionId];
                    // prevent collision with itself
                    if (collideTestEntity === entity) {
                        continue;
                    }
                    if (entity.radius > collideTestEntity.radius &&
                        Entity_1.Entity.distance(entity, collideTestEntity) <= entity.radius - (collideTestEntity.radius / 2)) {
                        let winnerEntity = entity;
                        let loserEntity = collideTestEntity;
                        let loserEntityId = collideSessionId;
                        winnerEntity.radius += loserEntity.radius / 5;
                        loserEntity.dead = true;
                        deadEntities.push(loserEntityId);
                        // create a replacement food
                        if (collideTestEntity.radius < DEFAULT_PLAYER_RADIUS) {
                            this.createFood();
                        }
                        else {
                            console.log(loserEntityId, "has been eaten!");
                        }
                    }
                }
            }
            if (entity.speed > 0) {
                entity.x -= (Math.cos(entity.angle)) * entity.speed;
                entity.y -= (Math.sin(entity.angle)) * entity.speed;
                // apply boundary limits
                if (entity.x < 0) {
                    entity.x = 0;
                }
                if (entity.x > WORLD_SIZE) {
                    entity.x = WORLD_SIZE;
                }
                if (entity.y < 0) {
                    entity.y = 0;
                }
                if (entity.y > WORLD_SIZE) {
                    entity.y = WORLD_SIZE;
                }
            }
        }
        // delete all dead entities
        deadEntities.forEach(entityId => delete this.entities[entityId]);
    }
}
__decorate([
    schema_1.type({ map: Entity_1.Entity })
], State.prototype, "entities", void 0);
exports.State = State;
