export namespace Con {
  export const WORLD_SIZE = 1100;

  export const OUTER_WALL_THICKNESS = 75;

  export const BACKGROUND_HUE_ROTATION_RATE = 0.45;

  export const DEFAULT_PLAYER_RADIUS = 50;
  export const DEFAULT_PROJECTILE_RADIUS = 8;

  export const DEFAULT_PLAYER_SPEED = 5;
  export const DEFAULT_PROJECTILE_SPEED = 12;

  export const DEFAULT_PLAYER_TYPE = 0;
  export const DEFAULT_PROJECTILE_TYPE = 1;

  export const VAPE_PROJECTILE_SUBTYPE = 1;
  export const VAPE_PROJECTILE_COOLDOWN = 25;

  export const PAINT_PROJECTILE_SUBTYPE = 2;
  export const PAINT_PROJECTILE_COOLDOWN = 150;

  export const REE_PROJECTILE_SUBTYPE = 3;
  export const REE_PROJECTILE_COOLDOWN = 100;
  export const REE_PROJECTILE_SCALE = 5.0;

  export const ATTACK_NONE = 0;
  export const ATTACK_PAINT = 1;
  export const ATTACK_VAPE = 2;
  export const ATTACK_REE = 3;

  export const MAX_PLAYER_MODELS = 3;

  export const CHARACTERS = [
    {name:"babysnakes",primaryAttack:ATTACK_PAINT,specialAttack: ATTACK_NONE,bio: "babysnakes\nprimary attacc: paint yarf"},
    {name:"vic",primaryAttack:ATTACK_VAPE,specialAttack: ATTACK_NONE,bio: "vic\nprimary attacc: vape cough"},
    {name:"rienne",primaryAttack:ATTACK_REE,specialAttack: ATTACK_NONE,bio: "rienne\nprimary attacc: sonic reee"}];
}
