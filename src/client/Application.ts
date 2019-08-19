import * as PIXI from "pixi.js";
import * as Viewport from "pixi-viewport";
import { Client } from "colyseus.js";
import { State } from "../server/rooms/State";
import { Entity } from "../server/rooms/Entity";

const characterImage = require('./florpmap.png');
const pixelImage = require('./pixel.png');

const ENDPOINT = (process.env.NODE_ENV==="development")
? "ws://localhost:8080"
: "wss://pr-battel.herokuapp.com";

const WORLD_SIZE = 1000;

const DEFAULT_PLAYER_TYPE = 0;
const DEFAULT_PROJECTILE_TYPE = 1;

export const lerp = (a: number, b: number, t: number) => (b - a) * t + a

// define textures
const FlorpTextureSheet = PIXI.BaseTexture.from(characterImage);
let frames = [];
let tex = undefined

const PixelTexture = PIXI.Texture.from(pixelImage);

export class Application extends PIXI.Application {
  entities: { [id: string]: Entity } = {};
  currentPlayerEntity: PIXI.Sprite;

  client = new Client(ENDPOINT);
  room = this.client.join<State>("arena", {});

  viewport: Viewport;

  _interpolation: boolean;

  isSchemaSerializer: boolean = true;
  _axisListener: any;

  backgroundHue: number;

  constructor () {
    super({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x220c0c
    });

    this.viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: WORLD_SIZE,
      worldHeight: WORLD_SIZE,
    });

    // set the background hue to 0;
    this.backgroundHue = 0;

    // load in character graphics
    for (let i=0;i<8;i++) {
      for (let j=0;j<8;j++) {
        frames.push(new PIXI.Rectangle( i*96, j*96, 56, 95));
      }
    }

    tex = frames.map(function(frame) { return new PIXI.Texture(FlorpTextureSheet, frame); });

    // load in projectile Graphics


    // draw boundaries of the world
    const boundaries = new PIXI.Graphics();
    boundaries.beginFill(0x000000);
    boundaries.drawRoundedRect(0, 0, WORLD_SIZE, WORLD_SIZE, 30);
    this.viewport.addChild(boundaries);

    // add viewport to stage
    this.stage.addChild(this.viewport);

    this.room.onJoin.add(() => {
      this.initializeSchema();
    });

    this.interpolation = true;

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
      let model = entity.model;
      console.log("schema model: ", model);
      let sprite = undefined;

      if (entity.type===DEFAULT_PLAYER_TYPE) {
        sprite = new PIXI.Sprite(tex[model]);
      } else if (entity.type===DEFAULT_PROJECTILE_TYPE) {
        sprite = new PIXI.Sprite(PixelTexture);
      }

      // center the sprite's anchor point
      sprite.anchor.set(0.5);

      // move the sprite to the center of the screen
      sprite.x = entity.x;
      sprite.y = entity.y;

      // detecting current user
      if (sessionId === this.room.sessionId) {
        this.currentPlayerEntity = sprite;
        this.viewport.follow(this.currentPlayerEntity);
      }

      this.viewport.addChild(sprite);

      entity.onChange = (changes) => {
        // move sprite with entity
        this.stop();
        sprite.x = entity.x;
        sprite.y = entity.y;
        this.start();
      }

      entity.onRemove = () => {
        // remove the sprite if entity gets removed
        this.viewport.removeChild(sprite);
        sprite.destroy();
      }
    }

    this.room.state.entities.onRemove = (_, sessionId: string) => {
      delete this.entities[sessionId];
    }
  }

  set interpolation (bool: boolean) {
    this._interpolation = bool;

    if (this._interpolation) {
      this.loop();
    }
  }

  loop () {
    for (let id in this.entities) {
      this.entities[id].x = lerp(this.entities[id].x, this.room.state.entities[id].x, 0.2);
      this.entities[id].y = lerp(this.entities[id].y, this.room.state.entities[id].y, 0.2);
    }

    this.backgroundHue+=0.1;

    this.renderer.backgroundColor = hslToNumber(this.backgroundHue%360, 0.5, 0.5);

    // continue looping if interpolation is still enabled.
    if (this._interpolation) {
      requestAnimationFrame(this.loop.bind(this));
    }
  }
}

// these colour functions were adapted from https://www.w3schools.com/lib/w3color.js

function hslToRgb(hue, sat, light) {
  var t1, t2, r, g, b;
  hue = hue / 60;
  if ( light <= 0.5 ) {
    t2 = light * (sat + 1);
  } else {
    t2 = light + sat - (light * sat);
  }
  t1 = light * 2 - t2;
  r = hueToRgb(t1, t2, hue + 2) * 255;
  g = hueToRgb(t1, t2, hue) * 255;
  b = hueToRgb(t1, t2, hue - 2) * 255;
  return {r : r, g : g, b : b};
}

function hueToRgb(t1, t2, hue) {
  if (hue < 0) hue += 6;
  if (hue >= 6) hue -= 6;
  if (hue < 1) return (t2 - t1) * hue + t1;
  else if(hue < 3) return t2;
  else if(hue < 4) return (t2 - t1) * (4 - hue) + t1;
  else return t1;
}

function rgbToNumber(r, g, b) {
  let numberOut=(Math.floor(r)*0x010000)+(Math.floor(g)*0x000100)+(Math.floor(b)*0x000001);
  return numberOut;
}

function hslToNumber(hue, sat, light) {
  let obj = hslToRgb(hue, sat, light);
  let numberOut=rgbToNumber(obj.r,obj.g,obj.b);
  return numberOut;
}
