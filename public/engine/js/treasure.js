var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Catacombs;
(function (Catacombs) {
    var TreasureDef = (function () {
        function TreasureDef(name, caption, price, availableInstances, canBuy, canPick) {
            this.name = name;
            this.caption = caption;
            this.price = price;
            this.availableInstances = availableInstances;
            this.canBuy = canBuy;
            this.canPick = canPick;
            TreasureDef.totalAvailableInstances += availableInstances;
        }
        TreasureDef.register = function (name, caption, price, availableInstances, canBuy, canPick) {
            if (canBuy === void 0) { canBuy = true; }
            if (canPick === void 0) { canPick = true; }
            TreasureDef.defsByName[name] = new TreasureDef(name, caption, price, availableInstances, canBuy, canPick);
            TreasureDef.defsByOrder.push(TreasureDef.defsByName[name]);
        };
        TreasureDef.getRandom = function () {
            var m = Math.floor(Math.random() * TreasureDef.defsByOrder.length);
            for (var i = 0; i < TreasureDef.defsByOrder.length; i++) {
                var def = TreasureDef.defsByOrder[m];
                if (def.availableInstances > 0)
                    return TreasureDef.defsByOrder[m];
                m = (m + 1) % TreasureDef.defsByOrder.length;
            }
            return null;
        };
        return TreasureDef;
    }());
    TreasureDef.totalAvailableInstances = 0;
    TreasureDef.defsByName = {};
    TreasureDef.defsByOrder = [];
    Catacombs.TreasureDef = TreasureDef;
    var Treasure = (function (_super) {
        __extends(Treasure, _super);
        function Treasure(map, treasureId, mapx, mapy, def) {
            var _this = _super.call(this, map, treasureId, mapx, mapy) || this;
            _this.def = def;
            return _this;
        }
        Treasure.createRandom = function (map, mapx, mapy) {
            return this.create(map, mapx, mapy, TreasureDef.getRandom());
        };
        Treasure.create = function (map, mapx, mapy, def) {
            if (def.availableInstances == 0) {
                alert("Nepodařilo se získat náhodnou odměnu - nejsou volné karty!");
                return null;
            }
            else {
                def.availableInstances--;
                TreasureDef.totalAvailableInstances--;
                Treasure.treasureCount++;
            }
            return new Treasure(map, Treasure.treasureCount, mapx, mapy, def);
        };
        return Treasure;
    }(Catacombs.MapItem));
    Treasure.treasureCount = 0;
    Catacombs.Treasure = Treasure;
    // položky
    TreasureDef.register("coin", "zlatou minci", 1, 15);
    TreasureDef.register("cup", "zlatý pohár", 5, 10);
    TreasureDef.register("gems", "drahokamy", 10, 5);
    TreasureDef.register("amulet", "amulet", 15, 2);
    TreasureDef.register("blue_key", "modrý klíč", 0, 1, false);
    TreasureDef.register("red_key", "červený klíč", 0, 1, false);
    TreasureDef.register("green_key", "zelený klíč", 0, 1, false);
    TreasureDef.register("yellow_key", "žlutý klíč", 0, 1, false);
    TreasureDef.register("blue_chest_token", "modrá truhla", 0, 1, false, false);
    TreasureDef.register("red_chest_token", "červená truhla", 0, 1, false, false);
    TreasureDef.register("green_chest_token", "zelený truhla", 0, 1, false, false);
    TreasureDef.register("yellow_chest_token", "žlutá truhla", 0, 1, false, false);
})(Catacombs || (Catacombs = {}));
