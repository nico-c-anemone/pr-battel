import { Entity } from "./Entity";
import { Schema, MapSchema } from "@colyseus/schema";
export declare class State extends Schema {
    width: number;
    height: number;
    entities: MapSchema<Entity>;
    initialize(): void;
    createPlayer(sessionId: string): void;
    setPlayerCharacter(sessionId: string): void;
    revivePlayer(sessionId: string): void;
    randomizePlayerLocation(sessionId: string): void;
    createProjectile(sessionId: string, speed: number, angle: number): void;
    update(): void;
    stopEntityAtWall(entity: Entity): void;
    reflectEntityAtWall(entity: Entity): void;
    killEntityAtWall(entity: Entity): void;
}
