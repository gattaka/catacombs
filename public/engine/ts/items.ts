namespace Catacombs {

    export class ItemDef {
        public static totalAvailableInstances = 0;
        public static itemDefs = new Array<ItemDef>();
        public static register(name: string, price: number, availableInstances: number) {
            ItemDef.itemDefs.push(new ItemDef(ItemDef.itemDefs.length, name, price, availableInstances));
        }

        public cardTexture: PIXI.Texture;
        public tokenTexture: PIXI.Texture;
        private constructor(public id: number, public name: string, public price: number, public availableInstances: number) {
            this.cardTexture = PIXI.Texture.fromImage('images/' + name + '.png');
            this.tokenTexture = PIXI.Texture.fromImage('images/' + name + '_token.png');
            ItemDef.totalAvailableInstances += availableInstances;
        }
    }

    export class Item {
        public static createRandom(): Item {
            let m = Math.floor(Math.random() * ItemDef.itemDefs.length);
            for (let i = 0; i < ItemDef.itemDefs.length; i++) {
                let def = ItemDef.itemDefs[m];
                if (def.availableInstances > 0)
                    return Item.create(ItemDef.itemDefs[m]);
                m = (m + 1) % ItemDef.itemDefs.length;
            }
            return null;
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

    // netvoři
    ItemDef.register("cup", 5, 15);
    ItemDef.register("gem", 10, 10);
    ItemDef.register("coins", 15, 5);
    ItemDef.register("amulet", 20, 1);
}