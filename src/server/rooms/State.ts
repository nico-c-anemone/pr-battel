import nanoid from "nanoid";
import { Entity } from "./Entity";
import { Schema, type, MapSchema } from "@colyseus/schema";

const WORLD_SIZE = 1000;

const DEFAULT_PLAYER_RADIUS = 50;
const DEFAULT_PROJECTILE_RADIUS = 8;

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

  createProjectile (sessionId: string, speed:number, angle: number) {
    const radius = DEFAULT_PROJECTILE_RADIUS;
    const parentEntity = this.entities[sessionId];
    const projectile = new Entity(parentEntity.x, parentEntity.y, radius, DEFAULT_PROJECTILE_TYPE);
    projectile.parentEntity = parentEntity;
    projectile.speed = speed;
    projectile.angle = angle;
    this.entities[nanoid(8)] = projectile;
  }



  update() {
    const deadEntities: string[] = [];
    for (const sessionId in this.entities) {
      const entity = this.entities[sessionId];

      if (entity.dead) {
        deadEntities.push(sessionId);
        continue;
      }

      if (entity.type === DEFAULT_PLAYER_TYPE && !entity.knockedOut) {
        for (const collideSessionId in this.entities) {
          const collideTestEntity = this.entities[collideSessionId]

          // prevent collision with itself
          if (collideTestEntity === entity) {
            continue;
          }

          // prevent collision with parent
          if (collideTestEntity.parentEntity === entity) {
            continue;
          }

          // am i getting shot??
          if (
            collideTestEntity.type === DEFAULT_PROJECTILE_TYPE &&
            Entity.distance(entity, collideTestEntity) <= entity.radius // - (collideTestEntity.radius / 2)
          ) {

            // knock out player
            entity.knockedOut = true;

            // kill projectile
            collideTestEntity.dead = true;
            deadEntities.push(collideTestEntity);

            console.log (sessionId, " knocked out.");
          }
        }
      }

      if (entity.speed > 0 && !entity.knockedOut) {
        entity.x -= (Math.cos(entity.angle)) * entity.speed;
        entity.y -= (Math.sin(entity.angle)) * entity.speed;

        // apply boundary limits
        if (entity.type === DEFAULT_PLAYER_TYPE) {
          if (entity.x < 0) { entity.x = 0; }
          if (entity.x > WORLD_SIZE) { entity.x = WORLD_SIZE; }
          if (entity.y < 0) { entity.y = 0; }
          if (entity.y > WORLD_SIZE) { entity.y = WORLD_SIZE; }
        } else if (entity.type===DEFAULT_PROJECTILE_TYPE) {
          if (entity.x < 0 || entity.x > WORLD_SIZE || entity.y < 0 || entity.y > WORLD_SIZE) {
            entity.dead = true;
            deadEntities.push(entity);
          }
        }
      }
    }

    // delete all dead entities
    deadEntities.forEach(entityId => delete this.entities[entityId]);
  }
}
