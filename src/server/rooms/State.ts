import nanoid from "nanoid";
import { Entity } from "./Entity";
import { Schema, type, MapSchema } from "@colyseus/schema";

import { Con } from "./Constants";

export class State extends Schema {

  width = Con.WORLD_SIZE;
  height = Con.WORLD_SIZE;

  @type({ map: Entity })
  entities = new MapSchema<Entity>();

  initialize () {
    // do initialize stuff
  }

  createPlayer (sessionId: string) {
    let character: number = Math.floor(Math.random() * Con.MAX_PLAYER_MODELS); // random model

    this.entities[sessionId] = new Entity(
      this.width/2,
      this.height/2,
      Con.DEFAULT_PLAYER_RADIUS,
      Con.DEFAULT_PLAYER_TYPE,
      character
    );

    this.entities[sessionId].model = character;
    this.setPlayerCharacter(sessionId);

    this.entities[sessionId].characterSelected = false;
  }

  setPlayerCharacter (sessionId: string) {
    let entity = this.entities[sessionId];
    let character: number = entity.model;
    entity.name = Con.CHARACTERS[character].name;
    entity.primaryAttack = Con.CHARACTERS[character].primaryAttack;
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
    const radius = Con.DEFAULT_PROJECTILE_RADIUS;
    const parentEntity = this.entities[sessionId];
    if (parentEntity.primaryAttack===Con.ATTACK_VAPE) {
      // vape projectile
      const projectile = new Entity(parentEntity.x, parentEntity.y, radius,
        Con.DEFAULT_PROJECTILE_TYPE, Con.VAPE_PROJECTILE_SUBTYPE);
        projectile.parentEntity = parentEntity;
        projectile.speed = speed;
        projectile.angle = angle;
        projectile.coolDown = Con.VAPE_PROJECTILE_COOLDOWN;
        this.entities[nanoid(8)] = projectile;
      } else if (parentEntity.primaryAttack===Con.ATTACK_PAINT) {
        // paint projectile
        const projectile = new Entity(parentEntity.x, parentEntity.y, radius,
          Con.DEFAULT_PROJECTILE_TYPE, Con.PAINT_PROJECTILE_SUBTYPE);
          projectile.parentEntity = parentEntity;
          projectile.speed = speed;
          projectile.angle = angle;
          projectile.coolDown = Con.PAINT_PROJECTILE_COOLDOWN;
          this.entities[nanoid(8)] = projectile;
        } else if (parentEntity.primaryAttack===Con.ATTACK_REE) {
          // paint projectile
          const projectile = new Entity(parentEntity.x, parentEntity.y, radius * Con.REE_PROJECTILE_SCALE,
            Con.DEFAULT_PROJECTILE_TYPE, Con.REE_PROJECTILE_SUBTYPE);
            projectile.parentEntity = parentEntity;
            projectile.speed = speed;
            projectile.angle = angle;
            projectile.coolDown = Con.REE_PROJECTILE_COOLDOWN;
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

              if (entity.type === Con.DEFAULT_PLAYER_TYPE && !entity.knockedOut) {
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
                    collideTestEntity.type === Con.DEFAULT_PROJECTILE_TYPE &&
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


              if (entity.type === Con.DEFAULT_PROJECTILE_TYPE) {
                if (entity.coolDown<=0) {
                  entity.dead = true;
                  deadEntities.push(entity);
                }
              }

              if (entity.speed > 0 && !entity.knockedOut) {
                entity.x -= (Math.cos(entity.angle)) * entity.speed;
                entity.y -= (Math.sin(entity.angle)) * entity.speed;
                if ((entity.type === Con.DEFAULT_PROJECTILE_TYPE)&&
                (entity.subType === Con.PAINT_PROJECTILE_SUBTYPE)) {
                  entity.speed *= 0.9;
                }

                // apply boundary limits and wall effects
                if (entity.type === Con.DEFAULT_PLAYER_TYPE) {
                  this.stopEntityAtWall(entity);
                } else if (entity.type===Con.DEFAULT_PROJECTILE_TYPE) {
                  if (entity.subType===Con.VAPE_PROJECTILE_SUBTYPE)  {
                    this.killEntityAtWall(entity);
                  } else if (entity.subType===Con.PAINT_PROJECTILE_SUBTYPE) {
                    this.stopEntityAtWall(entity);
                  } else if (entity.subType===Con.REE_PROJECTILE_SUBTYPE) {
                    this.reflectEntityAtWall(entity);
                  }
                }
              }
            }
          }

          // delete all dead entities
          deadEntities.forEach(entityId => delete this.entities[entityId]);
        }

        stopEntityAtWall(entity: Entity) {
          if (entity.x < 0) { entity.x = 0; }
          if (entity.x > Con.WORLD_SIZE) { entity.x = Con.WORLD_SIZE; }
          if (entity.y < 0) { entity.y = 0; }
          if (entity.y > Con.WORLD_SIZE) { entity.y = Con.WORLD_SIZE; }
        }

        reflectEntityAtWall(entity: Entity) {
          if (entity.x < 0) {
            entity.x = -entity.x;
            if (entity.angle >=0)
            entity.angle=3.14159265359-entity.angle;
            else if (entity.angle<0)
            entity.angle=-3.14159265359-entity.angle;
          }
          if (entity.x > Con.WORLD_SIZE) {
            entity.x = Con.WORLD_SIZE - (entity.x-Con.WORLD_SIZE);
            if (entity.angle >=0)
            entity.angle=3.14159265359-entity.angle;
            else if (entity.angle<0)
            entity.angle=-3.14159265359-entity.angle;
          }
          if (entity.y < 0) {
            entity.y = -entity.y;
            entity.angle=-entity.angle;
          }
          if (entity.y > Con.WORLD_SIZE) {
            entity.y = Con.WORLD_SIZE-(entity.y-Con.WORLD_SIZE);
            entity.angle=-entity.angle;
          }
          console.log(entity.angle);
        }

        killEntityAtWall(entity: Entity) {
          if (entity.x < 0 || entity.x > Con.WORLD_SIZE || entity.y < 0 || entity.y > Con.WORLD_SIZE) {
            entity.dead = true;
          }
        }
      }
