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
    var TreasureDef = /** @class */ (function () {
        function TreasureDef(type, file, caption, price, availableInstances, canBuy, canPick) {
            this.type = type;
            this.file = file;
            this.caption = caption;
            this.price = price;
            this.availableInstances = availableInstances;
            this.canBuy = canBuy;
            this.canPick = canPick;
            TreasureDef.totalAvailableInstances += availableInstances;
        }
        TreasureDef.register = function (type, file, caption, price, availableInstances, canBuy, canPick) {
            if (canBuy === void 0) { canBuy = true; }
            if (canPick === void 0) { canPick = true; }
            var def = new TreasureDef(type, file, caption, price, availableInstances, canBuy, canPick);
            TreasureDef.defsByType[TreasureType[type]] = def;
            for (var i = 0; i < availableInstances; i++) {
                TreasureDef.defsPool.push(def);
            }
        };
        TreasureDef.getRandom = function () {
            var m = Math.floor(Math.random() * TreasureDef.defsPool.length);
            var def = TreasureDef.defsPool[m];
            TreasureDef.defsPool.splice(m, 1);
            return def;
        };
        TreasureDef.totalAvailableInstances = 0;
        TreasureDef.defsByType = {};
        TreasureDef.defsPool = [];
        return TreasureDef;
    }());
    Catacombs.TreasureDef = TreasureDef;
    var Treasure = /** @class */ (function (_super) {
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
        Treasure.treasureCount = 0;
        return Treasure;
    }(Catacombs.MapItem));
    Catacombs.Treasure = Treasure;
    var TreasureType;
    (function (TreasureType) {
        TreasureType[TreasureType["COIN"] = 0] = "COIN";
        TreasureType[TreasureType["CUP"] = 1] = "CUP";
        TreasureType[TreasureType["GEMS"] = 2] = "GEMS";
        TreasureType[TreasureType["AMULET"] = 3] = "AMULET";
        TreasureType[TreasureType["BLUE_KEY"] = 4] = "BLUE_KEY";
        TreasureType[TreasureType["RED_KEY"] = 5] = "RED_KEY";
        TreasureType[TreasureType["GREEN_KEY"] = 6] = "GREEN_KEY";
        TreasureType[TreasureType["YELLOW_KEY"] = 7] = "YELLOW_KEY";
        TreasureType[TreasureType["BLUE_CHEST"] = 8] = "BLUE_CHEST";
        TreasureType[TreasureType["RED_CHEST"] = 9] = "RED_CHEST";
        TreasureType[TreasureType["GREEN_CHEST"] = 10] = "GREEN_CHEST";
        TreasureType[TreasureType["YELLOW_CHEST"] = 11] = "YELLOW_CHEST";
    })(TreasureType = Catacombs.TreasureType || (Catacombs.TreasureType = {}));
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
})(Catacombs || (Catacombs = {}));
