var Catacombs;
(function (Catacombs) {
    var ItemDef = (function () {
        function ItemDef(key, price, availableInstances) {
            this.key = key;
            this.price = price;
            this.availableInstances = availableInstances;
            // this.cardTexture = PIXI.Texture.fromImage('images/' + key + '.png');
            this.tokenTexture = PIXI.Texture.fromImage('images/' + key + '_token.png');
            ItemDef.totalAvailableInstances += availableInstances;
        }
        ItemDef.register = function (key, price, availableInstances) {
            ItemDef.itemDefsByKey[key] = new ItemDef(key, price, availableInstances);
            ItemDef.itemDefsByOrder.push(ItemDef.itemDefsByKey[key]);
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
    ItemDef.itemDefsByKey = {};
    ItemDef.itemDefsByOrder = [];
    Catacombs.ItemDef = ItemDef;
    var Item = (function () {
        function Item(definition, sprite) {
            this.definition = definition;
            this.sprite = sprite;
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
            return new Item(def, new PIXI.Sprite(def.tokenTexture));
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
