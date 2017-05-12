var Catacombs;
(function (Catacombs) {
    var ItemDef = (function () {
        function ItemDef(name, price, availableInstances) {
            this.name = name;
            this.price = price;
            this.availableInstances = availableInstances;
            ItemDef.totalAvailableInstances += availableInstances;
        }
        ItemDef.register = function (name, price, availableInstances) {
            ItemDef.itemDefsByName[name] = new ItemDef(name, price, availableInstances);
            ItemDef.itemDefsByOrder.push(ItemDef.itemDefsByName[name]);
        };
        ItemDef.getRandom = function () {
            var m = Math.floor(Math.random() * ItemDef.itemDefsByOrder.length);
            for (var i = 0; i < ItemDef.itemDefsByOrder.length; i++) {
                var def = ItemDef.itemDefsByOrder[m];
                if (def.availableInstances > 0)
                    return ItemDef.itemDefsByOrder[m];
                m = (m + 1) % ItemDef.itemDefsByOrder.length;
            }
            return null;
        };
        return ItemDef;
    }());
    ItemDef.totalAvailableInstances = 0;
    ItemDef.itemDefsByName = {};
    ItemDef.itemDefsByOrder = [];
    Catacombs.ItemDef = ItemDef;
    var Item = (function () {
        function Item(def) {
            this.def = def;
        }
        Item.createRandom = function () {
            return this.create(ItemDef.getRandom());
        };
        Item.create = function (def) {
            if (def.availableInstances == 0) {
                return null;
            }
            else {
                def.availableInstances--;
                ItemDef.totalAvailableInstances--;
            }
            return new Item(def);
        };
        return Item;
    }());
    Catacombs.Item = Item;
    // položky
    ItemDef.register("cup", 5, 15);
    ItemDef.register("gem", 10, 10);
    ItemDef.register("coins", 15, 5);
    ItemDef.register("amulet", 20, 1);
    ItemDef.register("blue_chest", 20, 1);
})(Catacombs || (Catacombs = {}));
