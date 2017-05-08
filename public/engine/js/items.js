var Catacombs;
(function (Catacombs) {
    var ItemDef = (function () {
        function ItemDef(id, name, price, availableInstances) {
            this.id = id;
            this.name = name;
            this.price = price;
            this.availableInstances = availableInstances;
            this.cardTexture = PIXI.Texture.fromImage('images/' + name + '.png');
            this.tokenTexture = PIXI.Texture.fromImage('images/' + name + '_token.png');
            ItemDef.totalAvailableInstances += availableInstances;
        }
        ItemDef.register = function (name, price, availableInstances) {
            ItemDef.itemDefs.push(new ItemDef(ItemDef.itemDefs.length, name, price, availableInstances));
        };
        return ItemDef;
    }());
    ItemDef.totalAvailableInstances = 0;
    ItemDef.itemDefs = new Array();
    Catacombs.ItemDef = ItemDef;
    var Item = (function () {
        function Item(definition, sprite) {
            this.definition = definition;
            this.sprite = sprite;
        }
        Item.createRandom = function () {
            var m = Math.floor(Math.random() * ItemDef.itemDefs.length);
            for (var i = 0; i < ItemDef.itemDefs.length; i++) {
                var def = ItemDef.itemDefs[m];
                if (def.availableInstances > 0)
                    return Item.create(ItemDef.itemDefs[m]);
                m = (m + 1) % ItemDef.itemDefs.length;
            }
            return null;
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
    // netvoři
    ItemDef.register("cup", 5, 15);
    ItemDef.register("gem", 10, 10);
    ItemDef.register("coins", 15, 5);
    ItemDef.register("amulet", 20, 1);
})(Catacombs || (Catacombs = {}));
