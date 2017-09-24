namespace Catacombs {

    export class MonsterDef {
        public static totalAvailableInstances = 0;
        public static monsterDefs = new Array<MonsterDef>();
        public static register(type: MonsterType, file: string, tier: number, defense: number, attack: number, availableInstances: number) {
            MonsterDef.monsterDefs[tier - 1] = new MonsterDef(type, file, tier, defense, attack, availableInstances);
        }

        private constructor(public type: MonsterType, public file: string, public tier: number, public defense: number,
            public attack: number, public availableInstances: number) {
            MonsterDef.totalAvailableInstances += availableInstances;
        }
    }

    export class Monster extends Creature {
        private static nextId = 0;
        public stunned: boolean = false;

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
                return new Monster(map, Monster.nextId++, mapx, mapy, def);
            }
        }

        public notifyKill() {
            this.def.availableInstances++;
            MonsterDef.totalAvailableInstances++;
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

    export enum MonsterType {
        ZOMBIE, SKELETON, SWAMPER, TROLL, MINOTAUR
    }

    // netvoři
    MonsterDef.register(MonsterType.ZOMBIE, "zombie", 1, 0, 1, 10);
    MonsterDef.register(MonsterType.SKELETON, "skeleton", 2, 1, 1, 10);
    MonsterDef.register(MonsterType.SWAMPER, "swamper", 3, 1, 1, 8);
    MonsterDef.register(MonsterType.TROLL, "troll", 4, 2, 2, 5);
    MonsterDef.register(MonsterType.MINOTAUR, "minotaur", 5, 2, 3, 2);

}