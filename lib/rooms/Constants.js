"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Con;
(function (Con) {
    Con.WORLD_SIZE = 1050;
    Con.DEFAULT_PLAYER_RADIUS = 50;
    Con.DEFAULT_PROJECTILE_RADIUS = 8;
    Con.DEFAULT_PLAYER_SPEED = 5;
    Con.DEFAULT_PROJECTILE_SPEED = 12;
    Con.DEFAULT_PLAYER_TYPE = 0;
    Con.DEFAULT_PROJECTILE_TYPE = 1;
    Con.VAPE_PROJECTILE_SUBTYPE = 1;
    Con.VAPE_PROJECTILE_COOLDOWN = 25;
    Con.PAINT_PROJECTILE_SUBTYPE = 2;
    Con.PAINT_PROJECTILE_COOLDOWN = 150;
    Con.REE_PROJECTILE_SUBTYPE = 3;
    Con.REE_PROJECTILE_COOLDOWN = 100;
    Con.REE_PROJECTILE_SCALE = 5.0;
    Con.ATTACK_NONE = 0;
    Con.ATTACK_PAINT = 1;
    Con.ATTACK_VAPE = 2;
    Con.ATTACK_REE = 3;
    Con.MAX_PLAYER_MODELS = 3;
    Con.CHARACTERS = [
        { name: "babysnakes", primaryAttack: Con.ATTACK_PAINT, specialAttack: Con.ATTACK_NONE, bio: "babysnakes\nprimary attacc: paint yarf" },
        { name: "vic", primaryAttack: Con.ATTACK_VAPE, specialAttack: Con.ATTACK_NONE, bio: "vic\nprimary attacc: vape cough" },
        { name: "rienne", primaryAttack: Con.ATTACK_REE, specialAttack: Con.ATTACK_NONE, bio: "rienne\nprimary attacc: sonic reee" }
    ];
})(Con = exports.Con || (exports.Con = {}));
