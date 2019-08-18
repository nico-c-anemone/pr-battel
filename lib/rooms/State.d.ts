import { Entity } from "./Entity";
import { Schema, MapSchema } from "@colyseus/schema";
export declare class State extends Schema {
    width: number;
    height: number;
    entities: MapSchema<Entity>;
    initialize(): void;
    createFood(): void;
    createPlayer(sessionId: string): void;
    update(): void;
}
