import { Room, Client } from "colyseus";
import { Entity } from "./Entity";
import { State } from "./State";

import { Con } from "../Constants";

export class ArenaRoom extends Room<State> {

  onInit() {
    this.setState(new State());
    this.state.initialize();
    this.setSimulationInterval(() => this.state.update());
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "JOINED");
    this.state.createPlayer(client.sessionId);
  }

  onMessage(client: Client, message: any) {
    const entity = this.state.entities[client.sessionId];

    const [command, data] = message;

    // skip dead players
    if (!entity) {
      // do nothing console.log("DEAD PLAYER ACTING...");
      return;
    }

    if (command === "key") {
      if (entity.characterSelected) {
        if ((!data.w && data.a && !data.s && !data.d)|| // A
        (data.w && data.a && data.s && !data.d)) {
          entity.speed = Con.DEFAULT_PLAYER_SPEED;
          entity.angle = 0; // 90 degrees
        } else
        if (data.w && data.a && !data.s && !data.d) { // A+W
          entity.speed = Con.DEFAULT_PLAYER_SPEED;
          entity.angle = 0.7853982; // 45 degrees
        } else
        if ((data.w && !data.a && !data.s && !data.d)|| // W
        (data.w && data.a && !data.s && data.d)) {
          entity.speed = Con.DEFAULT_PLAYER_SPEED;
          entity.angle = 1.570796; // 90 degrees
        } else
        if (data.w && !data.a && !data.s && data.d) { // W+D
          entity.speed = Con.DEFAULT_PLAYER_SPEED;
          entity.angle = 2.356194; // 135 degrees
        } else
        if ((!data.w && !data.a && !data.s && data.d)|| // D
        (data.w && !data.a && data.s && data.d)) {
          entity.speed = Con.DEFAULT_PLAYER_SPEED;
          entity.angle = 3.141593; // 180 degrees
        } else
        if (!data.w && !data.a && data.s && data.d) { // S+D
          entity.speed = Con.DEFAULT_PLAYER_SPEED;
          entity.angle = -2.356194; // -135 degrees
        } else
        if ((!data.w && !data.a && data.s && !data.d)|| // S
        (!data.w && data.a && data.s && data.d)) {
          entity.speed = Con.DEFAULT_PLAYER_SPEED;
          entity.angle = -1.570796; // -90 degrees
        } else
        if (!data.w && data.a && data.s && !data.d) { // A+S
          entity.speed = Con.DEFAULT_PLAYER_SPEED;
          entity.angle = -0.7853982; // -45 degrees
        } else
        {
          entity.speed = 0;
        }
      } else {
        // character select
        if ((!data.w && data.a && !data.s && !data.d)|| // A
        (data.w && data.a && data.s && !data.d)) {
          entity.model++;
        } else
        if ((!data.w && !data.a && !data.s && data.d)|| // D
        (data.w && !data.a && data.s && data.d)) {
          entity.model--;
        }
        if (entity.model >= Con.MAX_PLAYER_MODELS)
        entity.model = 0;
        if (entity.model < 0)
        entity.model = Con.MAX_PLAYER_MODELS - 1;
        this.state.setPlayerCharacter(client.sessionId);

        if (data.e) {
          entity.characterSelected=true;
          this.state.randomizePlayerLocation(client.sessionId);
        }
      }
    }

    // change angle
    if (command === "mouse") {
      //const dst = Entity.distance(entity, data as Entity);
      //entity.speed = (dst < 20) ? 0 : Math.min(dst / 15, 4);
      //entity.angle = Math.atan2(entity.y - data.y, entity.x - data.x);

      // have player face the mouse curson
      entity.facing = entity.x<=data.x?0:1;
    }

    // fire projectile
    if (command === "down") {
      if (entity.characterSelected) {
        if (entity.knockedOut) {
          this.state.revivePlayer(client.sessionId);
          return;
        } else {
          if (entity.coolDown <= 0) {
            if (entity.primaryAttack==Con.ATTACK_VAPE) {
              let vapeSpead:number = 3.0;
              let vapeSpread:number = 0.25;
              let vapePuffs=4;
              const dst = Entity.distance(entity, data as Entity);
              let speed = Con.DEFAULT_PROJECTILE_SPEED*1.05;
              let angle = Math.atan2(entity.y - data.y, entity.x - data.x);
              for (let i=0; i<vapePuffs; i++) {
                this.state.createProjectile(client.sessionId,
                  speed+(Math.random()*vapeSpead)-(vapeSpead*0.5),
                  angle+(Math.random()*vapeSpread)-(vapeSpread*0.5));
              }
              entity.coolDown = 14;
            } else if (entity.primaryAttack==Con.ATTACK_PAINT) {
              let paintSpead:number = 5.5;
              let paintSpread:number = 0.75;
              let paintSplats=7;
              const dst = Entity.distance(entity, data as Entity);
              let speed = Con.DEFAULT_PROJECTILE_SPEED * 1.3;
              let angle = Math.atan2(entity.y - data.y, entity.x - data.x);
              for (let i=0; i<paintSplats; i++) {
                this.state.createProjectile(client.sessionId,
                  speed+(Math.random()*paintSpead)-(paintSpead*0.5),
                  angle+(Math.random()*paintSpread)-(paintSpread*0.5));
              }
              entity.coolDown = 25;
            }
              else if (entity.primaryAttack==Con.ATTACK_REE) {
                let reeSpead:number = 1.2;
                let reeSpread:number = 0.10;
                let reeWaves=1;
                const dst = Entity.distance(entity, data as Entity);
                let speed = Con.DEFAULT_PROJECTILE_SPEED * 0.5;
                let angle = Math.atan2(entity.y - data.y, entity.x - data.x);
                for (let i=0; i<reeWaves; i++) {
                  this.state.createProjectile(client.sessionId,
                    speed+(Math.random()*reeSpead)-(reeSpead*0.5),
                    angle+(Math.random()*reeSpread)-(reeSpread*0.5));
                }
              entity.coolDown = 90;
            }
          }
        }
      }
    }
  }

  onLeave(client: Client) {
    console.log(client.sessionId, "LEFT!");
    const entity = this.state.entities[client.sessionId];

    // entity may be already dead.
    if (entity) { entity.dead = true; }
  }

}
