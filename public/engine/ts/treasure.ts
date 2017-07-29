namespace Catacombs {

    export class TreasureDef {
        public static totalAvailableInstances = 0;
        public static defsByType: { [type: string]: TreasureDef } = {};
        private static defsByOrder = [];
        public static register(type: TreasureType, file: string, caption: string, price: number, availableInstances: number, canBuy = true, canPick = true) {
            TreasureDef.defsByType[TreasureType[type]] = new TreasureDef(type, file, caption, price, availableInstances, canBuy, canPick);
            TreasureDef.defsByOrder.push(TreasureDef.defsByType[TreasureType[type]]);
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

        private constructor(public type: TreasureType, public file: string, public caption: string, public price: number, public availableInstances: number, public canBuy: boolean, public canPick: boolean) {
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

    export enum TreasureType {
        COIN, CUP, GEMS, AMULET, BLUE_KEY, RED_KEY, GREEN_KEY, YELLOW_KEY, BLUE_CHEST, RED_CHEST, GREEN_CHEST, YELLOW_CHEST
    }

    // položky
    TreasureDef.register(TreasureType.COIN, "coin", "zlatou minci", 2, 15);
    TreasureDef.register(TreasureType.CUP, "cup", "zlatý pohár", 2, 10);
    TreasureDef.register(TreasureType.GEMS, "gems", "drahokamy", 4, 5);
    TreasureDef.register(TreasureType.AMULET, "amulet", "amulet", 4, 2);
    TreasureDef.register(TreasureType.BLUE_KEY, "blue_key", "modrý klíč", 0, 1, false);
    TreasureDef.register(TreasureType.RED_KEY, "red_key", "červený klíč", 0, 1, false);
    TreasureDef.register(TreasureType.GREEN_KEY, "green_key", "zelený klíč", 0, 1, false);
    TreasureDef.register(TreasureType.YELLOW_KEY, "yellow_key", "žlutý klíč", 0, 1, false);
    TreasureDef.register(TreasureType.BLUE_CHEST, "blue_chest_token", "modrá truhla", 0, 1, false, false);
    TreasureDef.register(TreasureType.RED_CHEST, "red_chest_token", "červená truhla", 0, 1, false, false);
    TreasureDef.register(TreasureType.GREEN_CHEST, "green_chest_token", "zelený truhla", 0, 1, false, false);
    TreasureDef.register(TreasureType.YELLOW_CHEST, "yellow_chest_token", "žlutá truhla", 0, 1, false, false);

}