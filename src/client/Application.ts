import * as PIXI from "pixi.js";
import * as Viewport from "pixi-viewport";
import { Client } from "colyseus.js";
import { State } from "../server/rooms/State";
import { Entity } from "../server/rooms/Entity";

const characterImage = require('./florp.png')
console.log(characterImage) // /character.f3137b4d.png

const ENDPOINT = (process.env.NODE_ENV==="development")
    ? "ws://localhost:8080"
    : "wss://pr-battel.herokuapp.com";

const WORLD_SIZE = 2000;

export const lerp = (a: number, b: number, t: number) => (b - a) * t + a

const FlorpTexture = PIXI.Texture.from(characterImage);

export class Application extends PIXI.Application {
    entities: { [id: string]: Entity } = {};
    currentPlayerEntity: PIXI.Sprite;

    client = new Client(ENDPOINT);
    room = this.client.join<State>("arena", {});

    viewport: Viewport;

    _interpolation: boolean;

    isSchemaSerializer: boolean = true;
    _axisListener: any;

    constructor () {
        super({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x0c0c0c
        });

        this.viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: WORLD_SIZE,
            worldHeight: WORLD_SIZE,
        });



        // draw boundaries of the world
        const boundaries = new PIXI.Graphics();
        boundaries.beginFill(0x000000);
        boundaries.drawRoundedRect(0, 0, WORLD_SIZE, WORLD_SIZE, 30);
        this.viewport.addChild(boundaries);

        // add viewport to stage
        this.stage.addChild(this.viewport);

        this.room.onJoin.add(() => {
            this.isSchemaSerializer = this.room.serializerId === "schema";

            if (this.isSchemaSerializer) {
                /**
                 * Using `@colyseus/schema` as serialization method
                 */
                this.initializeSchema();

            } else {
                /**
                 * Using `fossil-delta` as serialization method
                 */
                this.initializeFossilDelta();
            }
        });

        this.interpolation = false;

        this.viewport.on('mousedown', (e) => {
          if (this.currentPlayerEntity) {
              const point = this.viewport.toLocal(e.data.global);
              console.log ("mouse down! ",point.x, point.y);
              this.room.send(['down', { x: point.x, y: point.y }]);
          }
      });

        this.viewport.on("mousemove", (e) => {
            if (this.currentPlayerEntity) {
                const point = this.viewport.toLocal(e.data.global);
                this.room.send(['mouse', { x: point.x, y: point.y }]);
            }
        });

    }

    initializeSchema() {
        this.room.state.entities.onAdd = (entity, sessionId: string) => {
            let bunny = new PIXI.Sprite(FlorpTexture);

            // center the sprite's anchor point
            bunny.anchor.set(0.5);

            // move the sprite to the center of the screen
            bunny.x = entity.x;
            bunny.y = entity.y;

            this.viewport.addChild(bunny);

            // detecting current user
            if (sessionId === this.room.sessionId) {
                this.currentPlayerEntity = bunny;
                this.viewport.follow(this.currentPlayerEntity);
            }

            entity.onChange = (changes) => {
                // console.log("entity change: ", entity.x, entity.y);

                bunny.x = entity.x;
                bunny.y = entity.y;

            }
        }

        this.room.state.entities.onRemove = (_, sessionId: string) => {
            // this.viewport.removeChild(this.entities[sessionId]);
            // this.entities[sessionId].destroy();
            delete this.entities[sessionId];
        }
    }

    initializeFossilDelta() {
        // add / removal of entities
        this.room.listen("entities/:id", (change) => {
            if (change.operation === "add") {
                let bunny = new PIXI.Sprite(FlorpTexture);

                // center the sprite's anchor point
                bunny.anchor.set(0.5);

                // move the sprite to the center of the screen
                bunny.x = change.value.x;
                bunny.y = change.value.y;

                this.viewport.addChild(bunny);

                // detecting current user
                if (change.path.id === this.room.sessionId) {
                    this.currentPlayerEntity = bunny;
                    this.viewport.follow(this.currentPlayerEntity);
                }

            } else if (change.operation === "remove") {
                //this.viewport.removeChild(this.entities[change.path.id]);
                //this.entities[change.path.id].destroy();
                delete this.entities[change.path.id];
            }
        });

        this.room.listen("entities/:id/radius", (change) => {
            //
        });
    }

    set interpolation (bool: boolean) {
        this._interpolation = bool;

        if (this._interpolation) {
            this.loop();

            if (!this.isSchemaSerializer) {
                this.room.removeListener(this._axisListener);
            }

        } else if (!this.isSchemaSerializer) {
            // update entities position directly when they arrive
            this._axisListener = this.room.listen("entities/:id/:axis", (change) => {
                this.entities[change.path.id][change.path.axis] = change.value;
            }, true);
        }
    }

    loop () {
        for (let id in this.entities) {
            this.entities[id].x = lerp(this.entities[id].x, this.room.state.entities[id].x, 0.2);
            this.entities[id].y = lerp(this.entities[id].y, this.room.state.entities[id].y, 0.2);
        }

        // continue looping if interpolation is still enabled.
        if (this._interpolation) {
            requestAnimationFrame(this.loop.bind(this));
        }
    }
}
