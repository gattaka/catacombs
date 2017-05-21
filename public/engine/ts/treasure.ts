namespace Catacombs {

    export class TreasureDef {
        public static totalAvailableInstances = 0;
        public static defsByName: { [name: string]: TreasureDef } = {};
        private static defsByOrder = [];
        public static register(name: string, price: number, availableInstances: number, pickable = true) {
            TreasureDef.defsByName[name] = new TreasureDef(name, price, availableInstances, pickable);
            TreasureDef.defsByOrder.push(TreasureDef.defsByName[name]);
        }

        public static getRandom(): TreasureDef {
            let m = Math.floor(Math.random() * TreasureDef.defsByOrder.length);
            for (let i = 0; i < TreasureDef.defsByOrder.length; i++) {
                let def = TreasureDef.defsByOrder[m];
                if (def.availableInstances > 0)
                    return TreasureDef.defsByOrder[m];
                m = (m + 1) % TreasureDef.defsByOrder.length;
            }
            return null;
        }

        private constructor(public name: string, public price: number, public availableInstances: number, public pickable: boolean) {
            TreasureDef.totalAvailableInstances += availableInstances;
        }

    }

    export class Treasure extends MapItem {
        public static treasureCount = 0;

        public static createRandom(map: Map, mapx: number, mapy: number): Treasure {
            return this.create(map, mapx, mapy, TreasureDef.getRandom());
        }

        public static create(map: Map, mapx: number, mapy: number, def: TreasureDef): Treasure {
            if (def.availableInstances == 0) {
                alert("Nepodařilo se získat náhodnou odměnu - nejsou volné karty!");
                return null;
            } else {
                def.availableInstances--;
                TreasureDef.totalAvailableInstances--;
                Treasure.treasureCount++;
            }
            return new Treasure(map, Treasure.treasureCount, mapx, mapy, def);
        }

        private constructor(
            map: Map,
            treasureId: number,
            mapx: number,
            mapy: number,
            public def: TreasureDef
        ) {
            super(map, treasureId, mapx, mapy);
        }
    }

    // položky
    TreasureDef.register("cup", 1, 15);
    TreasureDef.register("gem", 5, 10);
    TreasureDef.register("amulet", 10, 5);
    TreasureDef.register("coins", 15, 1);
    TreasureDef.register("blue_chest", 0, 1, false);
    TreasureDef.register("red_chest", 0, 1, false);
    TreasureDef.register("green_chest", 0, 1, false);
    TreasureDef.register("yellow_chest", 0, 1, false);

}