"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colyseus_1 = require("colyseus");
const Entity_1 = require("./Entity");
const State_1 = require("./State");
class ArenaRoom extends colyseus_1.Room {
    onInit() {
        this.setState(new State_1.State());
        this.state.initialize();
        this.setSimulationInterval(() => this.state.update());
    }
    onJoin(client, options) {
        console.log(client.sessionId, "JOINED");
        this.state.createPlayer(client.sessionId);
    }
    onMessage(client, message) {
        const entity = this.state.entities[client.sessionId];
        // skip dead players
        if (!entity) {
            console.log("DEAD PLAYER ACTING...");
            return;
        }
        const [command, data] = message;
        // change angle
        if (command === "mouse") {
            const dst = Entity_1.Entity.distance(entity, data);
            entity.speed = (dst < 20) ? 0 : Math.min(dst / 15, 4);
            entity.angle = Math.atan2(entity.y - data.y, entity.x - data.x);
        }
    }
    onLeave(client) {
        console.log(client.sessionId, "LEFT!");
        const entity = this.state.entities[client.sessionId];
        // entity may be already dead.
        if (entity) {
            entity.dead = true;
        }
    }
}
exports.ArenaRoom = ArenaRoom;
