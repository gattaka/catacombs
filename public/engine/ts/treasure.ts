namespace Catacombs {

    export class TreasureDef {
        public static totalAvailableInstances = 0;
        public static defsByName: { [name: string]: TreasureDef } = {};
        private static defsByOrder = [];
        public static register(name: string, caption: string, price: number, availableInstances: number, canBuy = true, canPick = true) {
            TreasureDef.defsByName[name] = new TreasureDef(name, caption, price, availableInstances, canBuy, canPick);
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

        private constructor(public name: string, public caption: string, public price: number, public availableInstances: number, public canBuy: boolean, public canPick: boolean) {
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
    TreasureDef.register("coin", "zlatou minci", 2, 15);
    TreasureDef.register("cup", "zlatý pohár", 2, 10);
    TreasureDef.register("gems", "drahokamy", 4, 5);
    TreasureDef.register("amulet", "amulet", 4, 2);
    TreasureDef.register("blue_key", "modrý klíč", 0, 1, false);
    TreasureDef.register("red_key", "červený klíč", 0, 1, false);
    TreasureDef.register("green_key", "zelený klíč", 0, 1, false);
    TreasureDef.register("yellow_key", "žlutý klíč", 0, 1, false);
    TreasureDef.register("blue_chest_token", "modrá truhla", 0, 1, false, false);
    TreasureDef.register("red_chest_token", "červená truhla", 0, 1, false, false);
    TreasureDef.register("green_chest_token", "zelený truhla", 0, 1, false, false);
    TreasureDef.register("yellow_chest_token", "žlutá truhla", 0, 1, false, false);

}