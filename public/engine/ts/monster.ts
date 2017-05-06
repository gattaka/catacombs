namespace Catacombs {

    export class MonsterDef {
        public static monsterDefs = new Array<MonsterDef>();
        public static register(name: string, tier: number, attack: number, defense: number, count: number) {
            MonsterDef.monsterDefs[tier - 1] = new MonsterDef(name, tier, attack, defense, count);
        }

        public cardTexture: PIXI.Texture;
        public tokenTexture: PIXI.Texture;
        private constructor(public name: string, public tier: number, public attack: number, public defense: number, public count: number) {
            this.cardTexture = PIXI.Texture.fromImage('images/' + name + '.png');
            this.tokenTexture = PIXI.Texture.fromImage('images/' + name + '_token.png');
        }
    }

    export class Monster {
        private static counter = new Array<number>();

        public static createRandom(maxTier: number): Monster {
            let m = Math.floor(Math.random() * maxTier);
            for (let i = 0; i < maxTier; i++) {
                if (Monster.counter[m] == undefined || Monster.counter[m] > 0)
                    return Monster.create(MonsterDef.monsterDefs[m]);
                m = (m + 1) % maxTier;
            }
            return null;
        }

        public static create(def: MonsterDef): Monster {
            if (Monster.counter[def.tier - 1] !== undefined) {
                if (Monster.counter[def.tier - 1] == 0)
                    return null;
            } else {
                Monster.counter[def.tier - 1] = def.count;
            }
            Monster.counter[def.tier - 1]--;
            return new Monster(def,
                new PIXI.Sprite(def.cardTexture),
                new PIXI.Sprite(def.tokenTexture));
        }

        private constructor(public definition: MonsterDef, public card: PIXI.Sprite, public token: PIXI.Sprite) {
        }
    }

    // netvoři
    MonsterDef.register("zombie", 1, 1, 0, 5);
    MonsterDef.register("skeleton", 2, 1, 1, 3);
    MonsterDef.register("swamper", 3, 2, 2, 2);
    MonsterDef.register("troll", 4, 3, 3, 1);
    MonsterDef.register("minotaur", 5, 4, 4, 1);

}