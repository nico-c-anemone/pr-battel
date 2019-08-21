export declare namespace Con {
    const WORLD_SIZE = 1050;
    const DEFAULT_PLAYER_RADIUS = 50;
    const DEFAULT_PROJECTILE_RADIUS = 8;
    const DEFAULT_PLAYER_SPEED = 5;
    const DEFAULT_PROJECTILE_SPEED = 12;
    const DEFAULT_PLAYER_TYPE = 0;
    const DEFAULT_PROJECTILE_TYPE = 1;
    const VAPE_PROJECTILE_SUBTYPE = 1;
    const VAPE_PROJECTILE_COOLDOWN = 25;
    const PAINT_PROJECTILE_SUBTYPE = 2;
    const PAINT_PROJECTILE_COOLDOWN = 150;
    const REE_PROJECTILE_SUBTYPE = 3;
    const REE_PROJECTILE_COOLDOWN = 100;
    const REE_PROJECTILE_SCALE = 5;
    const ATTACK_NONE = 0;
    const ATTACK_PAINT = 1;
    const ATTACK_VAPE = 2;
    const ATTACK_REE = 3;
    const MAX_PLAYER_MODELS = 3;
    const CHARACTERS: {
        name: string;
        primaryAttack: number;
        specialAttack: number;
        bio: string;
    }[];
}
