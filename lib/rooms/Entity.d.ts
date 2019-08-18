import { Schema } from "@colyseus/schema";
export declare class Entity extends Schema {
    x: number;
    y: number;
    radius: number;
    dead: boolean;
    angle: number;
    speed: number;
    constructor(x: number, y: number, radius: number);
    static distance(a: Entity, b: Entity): number;
}
