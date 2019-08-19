import nanoid from "nanoid";
import { Entity } from "./Entity";
import { Schema, type, MapSchema } from "@colyseus/schema";

const WORLD_SIZE = 1000;

const DEFAULT_PLAYER_RADIUS = 10;
const DEFAULT_PROJECTILE_RADIUS = 5;

const DEFAULT_PLAYER_TYPE = 0;
const DEFAULT_PROJECTILE_TYPE = 1;

const MAX_PLAYER_MODELS = 64;

export class State extends Schema {

  width = WORLD_SIZE;
  height = WORLD_SIZE;

  @type({ map: Entity })
  entities = new MapSchema<Entity>();

  initialize () {
    // do initialize stuff
  }

  createPlayer (sessionId: string) {
    this.entities[sessionId] = new Entity(
      Math.random() * this.width,
      Math.random() * this.height,
      DEFAULT_PLAYER_RADIUS,
      DEFAULT_PLAYER_TYPE
    );
    this.entities[sessionId].model = Math.floor(Math.random() * MAX_PLAYER_MODELS);
  }

  createProjectile (sessionId: string) {
    this.entities[sessionId] = new Entity(
      Math.random() * this.width,
      Math.random() * this.height,
      DEFAULT_PLAYER_RADIUS,
      DEFAULT_PROJECTILE_TYPE
    );
  }

  update() {
    const deadEntities: string[] = [];
    for (const sessionId in this.entities) {
      const entity = this.entities[sessionId];

      if (entity.dead) {
        deadEntities.push(sessionId);
        continue;
      }

      if (entity.type === DEFAULT_PLAYER_TYPE) {
        for (const collideSessionId in this.entities) {
          const collideTestEntity = this.entities[collideSessionId]

          // prevent collision with itself
          if (collideTestEntity === entity) {
            continue;
          }

          if (
            entity.radius > collideTestEntity.radius &&
            Entity.distance(entity, collideTestEntity) <= entity.radius - (collideTestEntity.radius / 2)
          ) {
            let winnerEntity: Entity = entity;
            let loserEntity: Entity = collideTestEntity;
            let loserEntityId: string = collideSessionId;

            winnerEntity.radius += loserEntity.radius / 5;
            loserEntity.dead = true;
            deadEntities.push(loserEntityId);

            // create a replacement food
            if (collideTestEntity.radius < DEFAULT_PLAYER_RADIUS) {
              // this.createFood();

            } else {
              console.log(loserEntityId, "has been eaten!");
            }
          }
        }
      }

      if (entity.speed > 0) {
        entity.x -= (Math.cos(entity.angle)) * entity.speed;
        entity.y -= (Math.sin(entity.angle)) * entity.speed;

        // apply boundary limits
        if (entity.x < 0) { entity.x = 0; }
        if (entity.x > WORLD_SIZE) { entity.x = WORLD_SIZE; }
        if (entity.y < 0) { entity.y = 0; }
        if (entity.y > WORLD_SIZE) { entity.y = WORLD_SIZE; }
      }
    }

    // delete all dead entities
    deadEntities.forEach(entityId => delete this.entities[entityId]);
  }
}
