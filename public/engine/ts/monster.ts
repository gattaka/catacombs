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
            alert("Nepodařilo se získat náhodného netvora - nejsou volné karty!");
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

    // netvoři
    MonsterDef.register("zombie", 1, 1, 0, 5);
    MonsterDef.register("skeleton", 2, 1, 1, 3);
    MonsterDef.register("swamper", 3, 2, 2, 2);
    MonsterDef.register("troll", 4, 3, 3, 1);
    MonsterDef.register("minotaur", 5, 4, 4, 1);

}