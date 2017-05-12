namespace Catacombs {

    export class ItemDef {
        public static totalAvailableInstances = 0;
        public static itemDefsByName: { [name: string]: ItemDef } = {};
        private static itemDefsByOrder = [];
        public static register(name: string, price: number, availableInstances: number) {
            ItemDef.itemDefsByName[name] = new ItemDef(name, price, availableInstances);
            ItemDef.itemDefsByOrder.push(ItemDef.itemDefsByName[name]);
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

        private constructor(public name: string, public price: number, public availableInstances: number) {
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
            return new Item(def);
        }

        public mapx: number;
        public mapy: number;

        private constructor(public def: ItemDef) {
        }
    }

    // položky
    ItemDef.register("cup", 5, 15);
    ItemDef.register("gem", 10, 10);
    ItemDef.register("coins", 15, 5);
    ItemDef.register("amulet", 20, 1);
    ItemDef.register("blue_chest", 20, 1);

}