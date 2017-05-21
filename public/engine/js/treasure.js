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
        function TreasureDef(name, price, availableInstances, pickable) {
            this.name = name;
            this.price = price;
            this.availableInstances = availableInstances;
            this.pickable = pickable;
            TreasureDef.totalAvailableInstances += availableInstances;
        }
        TreasureDef.register = function (name, price, availableInstances, pickable) {
            if (pickable === void 0) { pickable = true; }
            TreasureDef.defsByName[name] = new TreasureDef(name, price, availableInstances, pickable);
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
    TreasureDef.register("cup", 1, 15);
    TreasureDef.register("gem", 5, 10);
    TreasureDef.register("amulet", 10, 5);
    TreasureDef.register("coins", 15, 1);
    TreasureDef.register("blue_chest", 0, 1, false);
    TreasureDef.register("red_chest", 0, 1, false);
    TreasureDef.register("green_chest", 0, 1, false);
    TreasureDef.register("yellow_chest", 0, 1, false);
})(Catacombs || (Catacombs = {}));
