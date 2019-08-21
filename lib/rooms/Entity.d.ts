import { Schema } from "@colyseus/schema";
export declare class Entity extends Schema {
    x: number;
    y: number;
    radius: number;
    model: number;
    type: number;
    subType: number;
    knockedOut: boolean;
    kills: number;
    coolDown: number;
    name: string;
    primaryAttack: number;
    characterSelected: boolean;
    facing: number;
    dead: boolean;
    angle: number;
    speed: number;
    parentEntity: Entity;
    constructor(x: number, y: number, radius: number, type: number, subType: number);
    static distance(a: Entity, b: Entity): number;
}
