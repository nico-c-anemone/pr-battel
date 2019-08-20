import { Room, Client } from "colyseus";
import { Entity } from "./Entity";
import { State } from "./State";

const DEFAULT_PLAYER_SPEED = 5;
const DEFAULT_PROJECTILE_SPEED = 12;

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
      if ((!data.w && data.a && !data.s && !data.d)|| // A
      (data.w && data.a && data.s && !data.d)) {
        entity.speed = DEFAULT_PLAYER_SPEED;
        entity.angle = 0; // 90 degrees
      } else
      if (data.w && data.a && !data.s && !data.d) { // A+W
        entity.speed = DEFAULT_PLAYER_SPEED;
        entity.angle = 0.7853982; // 45 degrees
      } else
      if ((data.w && !data.a && !data.s && !data.d)|| // W
      (data.w && data.a && !data.s && data.d)) {
        entity.speed = DEFAULT_PLAYER_SPEED;
        entity.angle = 1.570796; // 90 degrees
      } else
      if (data.w && !data.a && !data.s && data.d) { // W+D
        entity.speed = DEFAULT_PLAYER_SPEED;
        entity.angle = 2.356194; // 135 degrees
      } else
      if ((!data.w && !data.a && !data.s && data.d)|| // D
      (data.w && !data.a && data.s && data.d)) {
        entity.speed = DEFAULT_PLAYER_SPEED;
        entity.angle = 3.141593; // 180 degrees
      } else
      if (!data.w && !data.a && data.s && data.d) { // S+D
        entity.speed = DEFAULT_PLAYER_SPEED;
        entity.angle = -2.356194; // -135 degrees
      } else
      if ((!data.w && !data.a && data.s && !data.d)|| // S
      (!data.w && data.a && data.s && data.d)) {
        entity.speed = DEFAULT_PLAYER_SPEED;
        entity.angle = -1.570796; // -90 degrees
      } else
      if (!data.w && data.a && data.s && !data.d) { // A+S
        entity.speed = DEFAULT_PLAYER_SPEED;
        entity.angle = -0.7853982; // -45 degrees
      } else
      {
        entity.speed = 0;
      }

    }

    // change angle
    if (command === "mouse") {
      //const dst = Entity.distance(entity, data as Entity);
      //entity.speed = (dst < 20) ? 0 : Math.min(dst / 15, 4);
      //entity.angle = Math.atan2(entity.y - data.y, entity.x - data.x);

    }

    // fire projectile
    if (command === "down") {
      if (entity.knockedOut) {
        this.state.revivePlayer(client.sessionId);
        return;
      } else if (entity.coolDown <= 0) {
        let vapeSpead:number = 3.0;
        let vapeSpread:number = 0.25;
        let vapePuffs=3;
        const dst = Entity.distance(entity, data as Entity);
        let speed = DEFAULT_PROJECTILE_SPEED;
        let angle = Math.atan2(entity.y - data.y, entity.x - data.x);
        for (let i=0; i<vapePuffs; i++) {
          this.state.createProjectile(client.sessionId, speed+(Math.random()*vapeSpead)-(vapeSpead*0.5), angle+(Math.random()*vapeSpread)-(vapeSpread*0.5));
        }
        entity.coolDown = 18;
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
