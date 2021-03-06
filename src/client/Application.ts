import * as PIXI from "pixi.js";
import * as Viewport from "pixi-viewport";
import { Client } from "colyseus.js";
import { State } from "../server/rooms/State";
import { Entity } from "../server/rooms/Entity";

import { Con } from "../server/Constants"

const characterImage = require('./prmap.png');
const pixelImage = require('./pixel.png');
const tileImage = require('./fractile.png');
const titleImage = require('./title.png');

const ENDPOINT = (process.env.NODE_ENV==="development")
? "ws://localhost:8080"
: "wss://pr-battel.herokuapp.com";

export const lerp = (a: number, b: number, t: number) => (b - a) * t + a

// define textures
const FlorpTextureSheet = PIXI.BaseTexture.from(characterImage);
FlorpTextureSheet.scaleMode = PIXI.SCALE_MODES.NEAREST;
let frames = [];
let tex = undefined

const PixelTexture = PIXI.Texture.from(pixelImage);
const TileTexture = PIXI.Texture.from(tileImage);
const TitleTexture = PIXI.Texture.from(titleImage);

let tilingSprite:any = {};
const titleSprite:PIXI.Sprite = new PIXI.Sprite();

// key stuff
let pkeys=[];

const client = new Client(ENDPOINT);
const room = client.join<State>("arena", {});

export class Application extends PIXI.Application {
  entities: { [id: string]: Entity } = {};
  currentPlayerEntity: PIXI.Sprite;

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
      worldWidth: Con.WORLD_SIZE,
      worldHeight: Con.WORLD_SIZE,
    });

    // set the background hue to 0;
    this.backgroundHue = 0;

    // load in character graphics
    for (let i=0;i<8;i++) {
      for (let j=0;j<8;j++) {
        frames.push(new PIXI.Rectangle( j*96, i*96, 56, 95));
      }
    }

    tex = frames.map(function(frame) { return new PIXI.Texture(FlorpTextureSheet, frame); });

    // load in tile
    tilingSprite = new PIXI.TilingSprite(
      TileTexture,
      this.screen.width,
      this.screen.height,
    );
    tilingSprite.scale.x=2.0;
    tilingSprite.scale.y=2.0;
    this.stage.addChild(tilingSprite);



    // draw boundaries of the world
    const outerWall = new PIXI.Graphics();
    outerWall.beginFill(0x000000);
    outerWall.drawRoundedRect(-Con.OUTER_WALL_THICKNESS,
      -Con.OUTER_WALL_THICKNESS, Con.WORLD_SIZE+Con.OUTER_WALL_THICKNESS*2,
      Con.WORLD_SIZE+Con.OUTER_WALL_THICKNESS*2, 60);
      outerWall.alpha = (0.6);
      this.viewport.addChild(outerWall);


      // draw boundaries of the world
      const boundaries = new PIXI.Graphics();
      boundaries.beginFill(0x202225);
      boundaries.drawRoundedRect(0, 0, Con.WORLD_SIZE, Con.WORLD_SIZE, 15);
      this.viewport.addChild(boundaries);

      // add clint-side sand to display
      //let sand: PIXI.Graphics[]=[];
      for (let i=0;i<Con.SAND_GRAINS;i++) {
        const sand = new PIXI.Graphics();
        boundaries.beginFill(0x72767d);
        boundaries.drawRect(Math.random()*Con.WORLD_SIZE,
        Math.random()*Con.WORLD_SIZE, 3, 3);
        this.viewport.addChild(sand);
      }

      // add clint-side title Graphics
      titleSprite.texture = TitleTexture;
      titleSprite.visible = true;
      this.viewport.addChild(titleSprite);

      // add viewport to stage
      this.stage.addChild(this.viewport);

      room.onJoin.add(() => {
        this.initializeSchema();
      });

      this.interpolation = true;

      this.viewport.on('mousedown', (e) => {
        if (this.currentPlayerEntity) {
          const point = this.viewport.toLocal(e.data.global);
          room.send(['down', { x: point.x, y: point.y }]);
        }
      });

      this.viewport.on("mousemove", (e) => {
        if (this.currentPlayerEntity) {
          const point = this.viewport.toLocal(e.data.global);
          room.send(['mouse', { x: point.x, y: point.y }]);
        }
      });

      function handleKeys () {
        let w:boolean=pkeys[87], a:boolean=pkeys[65],
        s:boolean=pkeys[83], d:boolean=pkeys[68],
        e:boolean=pkeys[69];
        room.send(["key",{w: w, a:a,s:s,d:d, e:e }]);
      }

      // keyboard control functions
      document.addEventListener('keydown', function(e) {
        var code = e.keyCode ? e.keyCode : e.which;
        pkeys[code]=true;
        handleKeys();
      });

      document.addEventListener('keyup', function(e) {
        var code = e.keyCode ? e.keyCode : e.which;
        pkeys[code]=false;
        handleKeys();
      });

    }

    initializeSchema() {
      room.state.entities.onAdd = (entity, sessionId: string) => {
        // stop rendering until we handle this
        this.stop();

        let model = entity.model;
        //console.log("model: ", model);
        let sprite = new PIXI.Sprite();



        let killsText:any; // text for kills
        let kills :string; // actual string
        let nameText:any; // text for kills
        let name :string; // actual string
        let titleText:any; // text for kills
        let title :string; // actual string

        let killXOffset = -30;
        let killYOffset = + 45;
        let nameXOffset = -30;
        let nameYOffset = -75;


        let paintcolour = 360.0 * Math.random();

        let current : boolean = (sessionId === room.sessionId);

        if (entity.type===Con.DEFAULT_PLAYER_TYPE) {
          sprite.texture=tex[model];
        } else if (entity.type===Con.DEFAULT_PROJECTILE_TYPE) {
          sprite.texture=PixelTexture;
        }

        // center the sprite's anchor point
        sprite.anchor.set(0.5);

        // move the sprite to the center of the screen
        sprite.x = entity.x;
        sprite.y = entity.y;

        // detecting current user
        if (current) {
          this.currentPlayerEntity = sprite;
          this.viewport.follow(this.currentPlayerEntity);

          // move the background
          tilingSprite.tilePosition.x=-entity.x/tilingSprite.scale.x;
          tilingSprite.tilePosition.y=-entity.y/tilingSprite.scale.y;

          if (!entity.characterSelected) {
            // add clint-side title Graphics
            titleSprite.x = sprite.x-256;
            titleSprite.y = sprite.y-256;
            titleSprite.visible = true;
          }
          else {
            titleSprite.visible = false;
          }
        }

        if (entity.type===Con.DEFAULT_PLAYER_TYPE)
        sprite.visible=current?true:false;
        this.viewport.addChild(sprite);

        if (entity.type===Con.DEFAULT_PLAYER_TYPE)
        {

          const style = new PIXI.TextStyle({
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: 12,
            fontWeight: 'bold',
            fill: ['#ffffff'], // gradient
          });


          titleText = new PIXI.Text(title, style);
          title = "PR Battel\nWASD to Move\nClick to Attacc.";
          titleText.text = title;
          titleText.x = 20;
          titleText.y = 20;
          titleText.visible=current?true:false;
          this.stage.addChild(titleText);

          killsText = new PIXI.Text(kills, style);
          kills = "Please select your character\nusing A and D keys\npress E to join game.";
          killsText.text = kills;
          killsText.x = sprite.x+killXOffset;
          killsText.y = sprite.y+killYOffset;
          killsText.visible=current?true:false;
          this.viewport.addChild(killsText);

          nameText = new PIXI.Text(name, style);
          name = entity.name;
          name = Con.CHARACTERS[entity.model].bio;
          nameText.x = sprite.x+nameXOffset;
          nameText.y = sprite.y+nameYOffset;
          nameText.visible=current?true:false;
          this.viewport.addChild(nameText);
        }

        //face it
        if (entity.facing===1&&entity.type===Con.DEFAULT_PLAYER_TYPE) {
          sprite.scale.x = -1;
        } else if (entity.facing===0&&entity.type===Con.DEFAULT_PLAYER_TYPE) {
          sprite.scale.x = 1;
        }

        if (entity.type===Con.DEFAULT_PROJECTILE_TYPE) {
          if (entity.subType===Con.VAPE_PROJECTILE_SUBTYPE)
          {
            sprite.alpha=entity.coolDown/Con.VAPE_PROJECTILE_COOLDOWN+0.1;
          }
          else if (entity.subType===Con.PAINT_PROJECTILE_SUBTYPE)
          {
            sprite.tint = hslToNumber(paintcolour%360, 0.7, 0.5);
            paintcolour+=15.0;
          }
          else if (entity.subType===Con.REE_PROJECTILE_SUBTYPE) {
            sprite.scale.x=5.0;
            sprite.scale.y=5.0;
            sprite.alpha = (Math.random() *0.9) + 0.1;
          }
        }

        this.start();

        entity.onChange = (changes) => {
          this.stop(); // stope rendering while we moved stuff around

          for (let id in changes) {
            if (changes[id].field=="model")
            sprite.texture = tex[entity.model];
          }

          // if this is the current player
          if (current) {

            // move the background
            tilingSprite.tilePosition.x=-entity.x/tilingSprite.scale.x;
            tilingSprite.tilePosition.y=-entity.y/tilingSprite.scale.y;

            // if the character is not yet selected
            if (!entity.characterSelected) {
              sprite.visible
              name = entity.name;
              nameText.name = name;
              sprite.texture = tex[entity.model];
              titleSprite.x = sprite.x-256;
              titleSprite.y = sprite.y-256;
              titleSprite.visible = true;

              

            } else { // if the character is selected
              titleSprite.visible = false;
              if (entity.knockedOut) {
                sprite.visible=false;
              } else {
                sprite.visible=true;
              }
            }
          } else { //if it is not the current player
            if (entity.type===Con.DEFAULT_PLAYER_TYPE){
              if (!entity.characterSelected || entity.knockedOut)
              {
                sprite.visible = false;
                killsText.visible = false;
                nameText.visible = false;
              } else {
                sprite.visible = true;
                killsText.visible = true;
                nameText.visible = true;
              }
            }
          }
          sprite.x = entity.x;
          sprite.y = entity.y;
          if (entity.type===Con.DEFAULT_PLAYER_TYPE)
          {
            if (entity.characterSelected) {
              kills = "kills: " + entity.kills;
              killsText.text = kills;
              killsText.x = sprite.x+killXOffset;
              killsText.y = sprite.y+killYOffset;
              name = entity.name + "\n" + sessionId;
              nameText.text = name;
              nameText.x = sprite.x+nameXOffset;
              nameText.y = sprite.y+nameYOffset;
            } else {
              kills = "Please select your character\nusing A and D keys\npress E to join game.";
              killsText.text = kills;
              killsText.x = sprite.x+killXOffset;
              killsText.y = sprite.y+killYOffset;
              name = Con.CHARACTERS[entity.model].bio;
              nameText.text = name;
              nameText.x = sprite.x+nameXOffset;
              nameText.y = sprite.y+nameYOffset;
            }
          }

          //face it
          if (entity.facing===1&&entity.type===Con.DEFAULT_PLAYER_TYPE) {
            sprite.scale.x = -1;
          } else if (entity.facing===0&&entity.type===Con.DEFAULT_PLAYER_TYPE) {
            sprite.scale.x = 1;
          }

          if (entity.type===Con.DEFAULT_PROJECTILE_TYPE) {
            if (entity.subType===Con.VAPE_PROJECTILE_SUBTYPE)
            {
              sprite.alpha=entity.coolDown/Con.VAPE_PROJECTILE_COOLDOWN+0.1;
            }
            else if (entity.subType===Con.PAINT_PROJECTILE_SUBTYPE)
            {
              sprite.tint = hslToNumber(paintcolour%360, 0.7, 0.5);
              paintcolour+=15.0;
            }
            else if (entity.subType===Con.REE_PROJECTILE_SUBTYPE) {
              sprite.scale.x=5.0;
              sprite.scale.y=5.0;
              sprite.alpha = (Math.random() *0.9) + 0.1;
            }
          }

          if (current) {
            title = "PR Battel\nWASD to Move\nClick to Attacc.";
            titleText.text = title;
            titleText.visible=current?true:false;
          }

          this.start(); //start up the renderer again

        }

        entity.onRemove = () => {
          // remove the sprite if entity gets removed
          this.viewport.removeChild(sprite);
          sprite.destroy();
          if (entity.type===Con.DEFAULT_PLAYER_TYPE)
          {
            this.viewport.removeChild(nameText);
            nameText.destroy();
            this.viewport.removeChild(killsText);
            killsText.destroy();
          }
        }
      }

      room.state.entities.onRemove = (_, sessionId: string) => {
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
        this.entities[id].x = lerp(this.entities[id].x, room.state.entities[id].x, 0.2);
        this.entities[id].y = lerp(this.entities[id].y, room.state.entities[id].y, 0.2);
      }

      this.backgroundHue+=Con.BACKGROUND_HUE_ROTATION_RATE;
      tilingSprite.tint = hslToNumber(this.backgroundHue%360, 1.0, 0.7);

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
