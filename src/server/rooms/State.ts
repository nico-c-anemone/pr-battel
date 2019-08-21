import nanoid from "nanoid";
import { Entity } from "./Entity";
import { Schema, type, MapSchema } from "@colyseus/schema";

const WORLD_SIZE = 1000;

const DEFAULT_PLAYER_RADIUS = 50;
const DEFAULT_PROJECTILE_RADIUS = 8;

const DEFAULT_PLAYER_TYPE = 0;
const DEFAULT_PROJECTILE_TYPE = 1;

const VAPE_PROJECTILE_SUBTYPE = 1;
const VAPE_PROJECTILE_COOLDOWN = 25;

const PAINT_PROJECTILE_SUBTYPE = 2;
const PAINT_PROJECTILE_COOLDOWN = 200;

const ATTACK_NONE = 0;
const ATTACK_PAINT = 1;
const ATTACK_VAPE = 2;

const MAX_PLAYER_MODELS = 2;

const CHARACTERS = [
  {name:"babysnakes",primaryAttack:ATTACK_PAINT,specialAttack: ATTACK_NONE},
  {name:"vic",primaryAttack:ATTACK_VAPE,specialAttack: ATTACK_NONE}];

  export class State extends Schema {

    width = WORLD_SIZE;
    height = WORLD_SIZE;

    @type({ map: Entity })
    entities = new MapSchema<Entity>();

    initialize () {
      // do initialize stuff
    }

    createPlayer (sessionId: string) {
      let character: number = Math.floor(Math.random() * MAX_PLAYER_MODELS); // random model

      this.entities[sessionId] = new Entity(
        this.width/2,
        this.height/2,
        DEFAULT_PLAYER_RADIUS,
        DEFAULT_PLAYER_TYPE,
        character
      );

      this.entities[sessionId].model = character;
      this.setPlayerCharacter(sessionId);

      this.entities[sessionId].characterSelected = false;
    }

    setPlayerCharacter (sessionId: string) {
      let entity = this.entities[sessionId];
      let character: number = entity.model;
      entity.name = CHARACTERS[character].name;
      entity.primaryAttack = CHARACTERS[character].primaryAttack;
      /* TODO:
      specialAttack
      */
    }

    revivePlayer (sessionId: string) {
      let entity = this.entities[sessionId];
      this.randomizePlayerLocation (sessionId);
      entity.knockedOut = false;
    }

    randomizePlayerLocation (sessionId: string) {
      let entity = this.entities[sessionId];
      entity.x = Math.random() * this.width;
      entity.y = Math.random() * this.height;
    }

    createProjectile (sessionId: string, speed:number, angle: number) {
      const radius = DEFAULT_PROJECTILE_RADIUS;
      const parentEntity = this.entities[sessionId];
      if (parentEntity.primaryAttack===ATTACK_VAPE) {
        // vape projectile
        const projectile = new Entity(parentEntity.x, parentEntity.y, radius, DEFAULT_PROJECTILE_TYPE, VAPE_PROJECTILE_SUBTYPE);
        projectile.parentEntity = parentEntity;
        projectile.speed = speed;
        projectile.angle = angle;
        projectile.coolDown = VAPE_PROJECTILE_COOLDOWN;
        this.entities[nanoid(8)] = projectile;
      } else if (parentEntity.primaryAttack===ATTACK_PAINT) {
        // paint projectile
        const projectile = new Entity(parentEntity.x, parentEntity.y, radius, DEFAULT_PROJECTILE_TYPE, PAINT_PROJECTILE_SUBTYPE);
        projectile.parentEntity = parentEntity;
        projectile.speed = speed;
        projectile.angle = angle;
        projectile.coolDown = PAINT_PROJECTILE_COOLDOWN;
        this.entities[nanoid(8)] = projectile;
      }
    }



    update() {
      const deadEntities: string[] = [];
      for (const sessionId in this.entities) {
        const entity = this.entities[sessionId];

        if (entity.dead) {
          deadEntities.push(sessionId);
          continue;
        }

        if (entity.characterSelected) {

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

                collideTestEntity.parentEntity.kills++;

                // kill projectile
                collideTestEntity.dead = true;
                deadEntities.push(collideTestEntity);

                console.log (sessionId, " knocked out.");
              }
            }
          }

          // cooldown for various mechanics
          if (entity.coolDown>0)
          entity.coolDown--;
          else
          entity.coolDown=0;


          if (entity.type === DEFAULT_PROJECTILE_TYPE) {
            if (entity.coolDown<=0) {
              entity.dead = true;
              deadEntities.push(entity);
            }
          }

          if (entity.speed > 0 && !entity.knockedOut) {
            entity.x -= (Math.cos(entity.angle)) * entity.speed;
            entity.y -= (Math.sin(entity.angle)) * entity.speed;
            if ((entity.type === DEFAULT_PROJECTILE_TYPE)&&
            (entity.subType === PAINT_PROJECTILE_SUBTYPE)) {
              entity.speed *= 0.9;
            }

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
      }

      // delete all dead entities
      deadEntities.forEach(entityId => delete this.entities[entityId]);
    }
  }
