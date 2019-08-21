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
const Constants_1 = require("./Constants");
class State extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.width = Constants_1.Con.WORLD_SIZE;
        this.height = Constants_1.Con.WORLD_SIZE;
        this.entities = new schema_1.MapSchema();
    }
    initialize() {
        // do initialize stuff
    }
    createPlayer(sessionId) {
        let character = Math.floor(Math.random() * Constants_1.Con.MAX_PLAYER_MODELS); // random model
        this.entities[sessionId] = new Entity_1.Entity(this.width / 2, this.height / 2, Constants_1.Con.DEFAULT_PLAYER_RADIUS, Constants_1.Con.DEFAULT_PLAYER_TYPE, character);
        this.entities[sessionId].model = character;
        this.setPlayerCharacter(sessionId);
        this.entities[sessionId].characterSelected = false;
    }
    setPlayerCharacter(sessionId) {
        let entity = this.entities[sessionId];
        let character = entity.model;
        entity.name = Constants_1.Con.CHARACTERS[character].name;
        entity.primaryAttack = Constants_1.Con.CHARACTERS[character].primaryAttack;
        /* TODO:
        specialAttack
        */
    }
    revivePlayer(sessionId) {
        let entity = this.entities[sessionId];
        this.randomizePlayerLocation(sessionId);
        entity.knockedOut = false;
    }
    randomizePlayerLocation(sessionId) {
        let entity = this.entities[sessionId];
        entity.x = Math.random() * this.width;
        entity.y = Math.random() * this.height;
    }
    createProjectile(sessionId, speed, angle) {
        const radius = Constants_1.Con.DEFAULT_PROJECTILE_RADIUS;
        const parentEntity = this.entities[sessionId];
        if (parentEntity.primaryAttack === Constants_1.Con.ATTACK_VAPE) {
            // vape projectile
            const projectile = new Entity_1.Entity(parentEntity.x, parentEntity.y, radius, Constants_1.Con.DEFAULT_PROJECTILE_TYPE, Constants_1.Con.VAPE_PROJECTILE_SUBTYPE);
            projectile.parentEntity = parentEntity;
            projectile.speed = speed;
            projectile.angle = angle;
            projectile.coolDown = Constants_1.Con.VAPE_PROJECTILE_COOLDOWN;
            this.entities[nanoid_1.default(8)] = projectile;
        }
        else if (parentEntity.primaryAttack === Constants_1.Con.ATTACK_PAINT) {
            // paint projectile
            const projectile = new Entity_1.Entity(parentEntity.x, parentEntity.y, radius, Constants_1.Con.DEFAULT_PROJECTILE_TYPE, Constants_1.Con.PAINT_PROJECTILE_SUBTYPE);
            projectile.parentEntity = parentEntity;
            projectile.speed = speed;
            projectile.angle = angle;
            projectile.coolDown = Constants_1.Con.PAINT_PROJECTILE_COOLDOWN;
            this.entities[nanoid_1.default(8)] = projectile;
        }
        else if (parentEntity.primaryAttack === Constants_1.Con.ATTACK_REE) {
            // paint projectile
            const projectile = new Entity_1.Entity(parentEntity.x, parentEntity.y, radius * Constants_1.Con.REE_PROJECTILE_SCALE, Constants_1.Con.DEFAULT_PROJECTILE_TYPE, Constants_1.Con.REE_PROJECTILE_SUBTYPE);
            projectile.parentEntity = parentEntity;
            projectile.speed = speed;
            projectile.angle = angle;
            projectile.coolDown = Constants_1.Con.REE_PROJECTILE_COOLDOWN;
            this.entities[nanoid_1.default(8)] = projectile;
        }
    }
    update() {
        const deadEntities = [];
        for (const sessionId in this.entities) {
            const entity = this.entities[sessionId];
            if (entity.dead) {
                deadEntities.push(sessionId);
                continue;
            }
            if (entity.characterSelected) {
                if (entity.type === Constants_1.Con.DEFAULT_PLAYER_TYPE && !entity.knockedOut) {
                    for (const collideSessionId in this.entities) {
                        const collideTestEntity = this.entities[collideSessionId];
                        // prevent collision with itself
                        if (collideTestEntity === entity) {
                            continue;
                        }
                        // prevent collision with parent
                        if (collideTestEntity.parentEntity === entity) {
                            continue;
                        }
                        // am i getting shot??
                        if (collideTestEntity.type === Constants_1.Con.DEFAULT_PROJECTILE_TYPE &&
                            Entity_1.Entity.distance(entity, collideTestEntity) <= entity.radius // - (collideTestEntity.radius / 2)
                        ) {
                            // knock out player
                            entity.knockedOut = true;
                            collideTestEntity.parentEntity.kills++;
                            // kill projectile
                            collideTestEntity.dead = true;
                            deadEntities.push(collideTestEntity);
                            console.log(sessionId, " knocked out.");
                        }
                    }
                }
                // cooldown for various mechanics
                if (entity.coolDown > 0)
                    entity.coolDown--;
                else
                    entity.coolDown = 0;
                if (entity.type === Constants_1.Con.DEFAULT_PROJECTILE_TYPE) {
                    if (entity.coolDown <= 0) {
                        entity.dead = true;
                        deadEntities.push(entity);
                    }
                }
                if (entity.speed > 0 && !entity.knockedOut) {
                    entity.x -= (Math.cos(entity.angle)) * entity.speed;
                    entity.y -= (Math.sin(entity.angle)) * entity.speed;
                    if ((entity.type === Constants_1.Con.DEFAULT_PROJECTILE_TYPE) &&
                        (entity.subType === Constants_1.Con.PAINT_PROJECTILE_SUBTYPE)) {
                        entity.speed *= 0.9;
                    }
                    // apply boundary limits and wall effects
                    if (entity.type === Constants_1.Con.DEFAULT_PLAYER_TYPE) {
                        this.stopEntityAtWall(entity);
                    }
                    else if (entity.type === Constants_1.Con.DEFAULT_PROJECTILE_TYPE) {
                        if (entity.subType === Constants_1.Con.VAPE_PROJECTILE_SUBTYPE) {
                            this.killEntityAtWall(entity);
                        }
                        else if (entity.subType === Constants_1.Con.PAINT_PROJECTILE_SUBTYPE) {
                            this.stopEntityAtWall(entity);
                        }
                        else if (entity.subType === Constants_1.Con.REE_PROJECTILE_SUBTYPE) {
                            this.reflectEntityAtWall(entity);
                        }
                    }
                }
            }
        }
        // delete all dead entities
        deadEntities.forEach(entityId => delete this.entities[entityId]);
    }
    stopEntityAtWall(entity) {
        if (entity.x < 0) {
            entity.x = 0;
        }
        if (entity.x > Constants_1.Con.WORLD_SIZE) {
            entity.x = Constants_1.Con.WORLD_SIZE;
        }
        if (entity.y < 0) {
            entity.y = 0;
        }
        if (entity.y > Constants_1.Con.WORLD_SIZE) {
            entity.y = Constants_1.Con.WORLD_SIZE;
        }
    }
    reflectEntityAtWall(entity) {
        if (entity.x < 0) {
            entity.x = -entity.x;
            if (entity.angle >= 0)
                entity.angle = 3.14159265359 - entity.angle;
            else if (entity.angle < 0)
                entity.angle = -3.14159265359 - entity.angle;
        }
        if (entity.x > Constants_1.Con.WORLD_SIZE) {
            entity.x = Constants_1.Con.WORLD_SIZE - (entity.x - Constants_1.Con.WORLD_SIZE);
            if (entity.angle >= 0)
                entity.angle = 3.14159265359 - entity.angle;
            else if (entity.angle < 0)
                entity.angle = -3.14159265359 - entity.angle;
        }
        if (entity.y < 0) {
            entity.y = -entity.y;
            entity.angle = -entity.angle;
        }
        if (entity.y > Constants_1.Con.WORLD_SIZE) {
            entity.y = Constants_1.Con.WORLD_SIZE - (entity.y - Constants_1.Con.WORLD_SIZE);
            entity.angle = -entity.angle;
        }
        console.log(entity.angle);
    }
    killEntityAtWall(entity) {
        if (entity.x < 0 || entity.x > Constants_1.Con.WORLD_SIZE || entity.y < 0 || entity.y > Constants_1.Con.WORLD_SIZE) {
            entity.dead = true;
        }
    }
}
__decorate([
    schema_1.type({ map: Entity_1.Entity })
], State.prototype, "entities", void 0);
exports.State = State;
