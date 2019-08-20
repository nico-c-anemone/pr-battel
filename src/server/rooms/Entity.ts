import { Schema, type } from "@colyseus/schema";

export class Entity extends Schema {
    @type("number") x: number;
    @type("number") y: number;
    @type("number") radius: number;
    @type("number") model: number;
    @type("number") type: number;
    @type("number") subType: number;
    @type("boolean") knockedOut: boolean;
    @type("number") kills: number;
    @type("number") coolDown: number;
    @type("string") name: string;
    @type("boolean") characterSelected: boolean;


    dead: boolean = false;

    angle: number = 0;
    speed = 0;
    parentEntity: Entity = this;

    constructor(x: number, y: number, radius: number, type: number, subType: number) {
        super();

        this.x = x;
        this.y = y;
        this.radius = radius;
        this.type = type;
        this.subType = subType;
        this.model = 0;
        this.knockedOut = false;
        this.kills = 0;
        this.coolDown = 0;
        this.name='';
        this.characterSelected=true;
    }

    static distance(a: Entity, b: Entity) {
        return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    }
}
