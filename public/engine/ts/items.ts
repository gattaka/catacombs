namespace Catacombs {

    export class ItemDef {
        public static totalAvailableInstances = 0;
        public static itemDefsByKey: { [key: string]: ItemDef } = {};
        private static itemDefsByOrder = [];
        public static register(key: string, price: number, availableInstances: number) {
            ItemDef.itemDefsByKey[key] = new ItemDef(key, price, availableInstances);
            ItemDef.itemDefsByOrder.push(ItemDef.itemDefsByKey[key]);
        }

        public static getRandom(): ItemDef {
            let m = Math.floor(Math.random() * ItemDef.itemDefsByOrder.length);
            for (let i = 0; i < ItemDef.itemDefsByOrder.length; i++) {
                let def = ItemDef.itemDefsByOrder[m];
                if (def.availableInstances > 0)
                    return ItemDef.itemDefsByOrder[m];
                m = (m + 1) % ItemDef.itemDefsByOrder.length;
            }
            return null;
        }

        public cardTexture: PIXI.Texture;
        public tokenTexture: PIXI.Texture;
        private constructor(public key: string, public price: number, public availableInstances: number) {
            // this.cardTexture = PIXI.Texture.fromImage('images/' + key + '.png');
            this.tokenTexture = PIXI.Texture.fromImage('images/' + key + '_token.png');
            ItemDef.totalAvailableInstances += availableInstances;
        }

    }

    export class Item {

        public static createRandom(): Item {
            return this.create(ItemDef.getRandom());
        }

        public static create(def: ItemDef): Item {
            if (def.availableInstances == 0) {
                return null;
            } else {
                def.availableInstances--;
                ItemDef.totalAvailableInstances--;
            }
            return new Item(def,
                new PIXI.Sprite(def.tokenTexture));
        }

        public mapx: number;
        public mapy: number;

        private constructor(public definition: ItemDef, public sprite: PIXI.Sprite) {
        }
    }

    // položky
    ItemDef.register("cup", 5, 15);
    ItemDef.register("gem", 10, 10);
    ItemDef.register("coins", 15, 5);
    ItemDef.register("amulet", 20, 1);
    ItemDef.register("blue_chest", 20, 1);
    
}