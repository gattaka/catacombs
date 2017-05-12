namespace Catacombs {

    export class MonsterDef {
        public static totalAvailableInstances = 0;
        public static monsterDefs = new Array<MonsterDef>();
        public static register(name: string, tier: number, attack: number, defense: number, availableInstances: number) {
            MonsterDef.monsterDefs[tier - 1] = new MonsterDef(name, tier, attack, defense, availableInstances);
        }

        private constructor(public name: string, public tier: number, public attack: number, public defense: number, public availableInstances: number) {
            MonsterDef.totalAvailableInstances += availableInstances;
        }
    }

    export class Monster {
        public static createRandom(maxTier: number): Monster {
            let m = Math.floor(Math.random() * maxTier);
            for (let i = 0; i < maxTier; i++) {
                let def = MonsterDef.monsterDefs[m];
                if (def.availableInstances > 0)
                    return Monster.create(MonsterDef.monsterDefs[m]);
                m = (m + 1) % maxTier;
            }
            return null;
        }

        public static create(def: MonsterDef): Monster {
            if (def.availableInstances == 0) {
                return null;
            } else {
                def.availableInstances--;
                MonsterDef.totalAvailableInstances--;
            }
            return new Monster(def);
        }

        public mapx: number;
        public mapy: number;

        private constructor(public def: MonsterDef) {
        }
    }

    // netvoři
    MonsterDef.register("zombie", 1, 1, 0, 5);
    MonsterDef.register("skeleton", 2, 1, 1, 3);
    MonsterDef.register("swamper", 3, 2, 2, 2);
    MonsterDef.register("troll", 4, 3, 3, 1);
    MonsterDef.register("minotaur", 5, 4, 4, 1);

}