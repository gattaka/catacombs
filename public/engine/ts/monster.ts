namespace Catacombs {

    export class MonsterDef {
        public static totalAvailableInstances = 0;
        public static monsterDefs = new Array<MonsterDef>();
        public static register(type: MosterType, file: string, tier: number, defense: number, attack: number, availableInstances: number) {
            MonsterDef.monsterDefs[tier - 1] = new MonsterDef(type, file, tier, defense, attack, availableInstances);
        }

        private constructor(public type: MosterType, public file: string, public tier: number, public defense: number, public attack: number, public availableInstances: number) {
            MonsterDef.totalAvailableInstances += availableInstances;
        }
    }

    export class Monster extends Creature {
        public static monstersCount = 0;
        public static createRandom(map: Map, maxTier: number, mapx: number, mapy: number): Monster {
            let m = Math.floor(Math.random() * maxTier);
            for (let i = 0; i < maxTier; i++) {
                let def = MonsterDef.monsterDefs[m];
                if (def.availableInstances > 0)
                    return Monster.create(map, mapx, mapy, MonsterDef.monsterDefs[m]);
                m = (m + 1) % maxTier;
            }
            // To nevadí
            // alert("Nepodařilo se získat náhodného netvora - nejsou volné karty!");
            return null;
        }

        public static create(map: Map, mapx: number, mapy: number, def: MonsterDef): Monster {
            if (def.availableInstances == 0) {
                alert("Nepodařilo se získat netvora - nejsou volné karty!");
                return null;
            } else {
                def.availableInstances--;
                MonsterDef.totalAvailableInstances--;
                Monster.monstersCount++;
            }
            return new Monster(map, Monster.monstersCount, mapx, mapy, def);
        }

        private constructor(
            map: Map,
            creatureId: number,
            mapx: number,
            mapy: number,
            public def: MonsterDef
        ) {
            super(map, creatureId, mapx, mapy, false);
        }

        innerMove(fromRoom: Room, toRoom: Room) {
            if (fromRoom)
                delete fromRoom.monsters[this.id];
            toRoom.monsters[this.id] = this;
            EventBus.getInstance().fireEvent(new MonsterMovePayload(this.id, fromRoom.mapx, fromRoom.mapy, toRoom.mapx, toRoom.mapy));
        }
    }

    export enum MosterType {
        ZOMBIE, SKELETON, SWAMPER, TROLL, MINOTAUR
    }

    // netvoři
    MonsterDef.register(MosterType.ZOMBIE, "zombie", 1, 0, 1, 5);
    MonsterDef.register(MosterType.SKELETON, "skeleton", 2, 1, 1, 3);
    MonsterDef.register(MosterType.SWAMPER, "swamper", 3, 1, 2, 2);
    MonsterDef.register(MosterType.TROLL, "troll", 4, 2, 2, 1);
    MonsterDef.register(MosterType.MINOTAUR, "minotaur", 5, 2, 3, 1);

}