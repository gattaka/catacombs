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
    var MonsterDef = /** @class */ (function () {
        function MonsterDef(type, file, tier, defense, attack, availableInstances) {
            this.type = type;
            this.file = file;
            this.tier = tier;
            this.defense = defense;
            this.attack = attack;
            this.availableInstances = availableInstances;
            MonsterDef.totalAvailableInstances += availableInstances;
        }
        MonsterDef.register = function (type, file, tier, defense, attack, availableInstances) {
            MonsterDef.monsterDefs[tier - 1] = new MonsterDef(type, file, tier, defense, attack, availableInstances);
        };
        MonsterDef.totalAvailableInstances = 0;
        MonsterDef.monsterDefs = new Array();
        return MonsterDef;
    }());
    Catacombs.MonsterDef = MonsterDef;
    var Monster = /** @class */ (function (_super) {
        __extends(Monster, _super);
        function Monster(map, creatureId, mapx, mapy, def) {
            var _this = _super.call(this, map, creatureId, mapx, mapy, false) || this;
            _this.def = def;
            _this.sleeping = false;
            return _this;
        }
        Monster.createRandom = function (map, maxTier, mapx, mapy) {
            var m = Math.floor(Math.random() * maxTier);
            for (var i = 0; i < maxTier; i++) {
                var def = MonsterDef.monsterDefs[m];
                if (def.availableInstances > 0)
                    return Monster.create(map, mapx, mapy, MonsterDef.monsterDefs[m]);
                m = (m + 1) % maxTier;
            }
            // To nevadí
            // alert("Nepodařilo se získat náhodného netvora - nejsou volné karty!");
            return null;
        };
        Monster.create = function (map, mapx, mapy, def) {
            if (def.availableInstances == 0) {
                alert("Nepodařilo se získat netvora - nejsou volné karty!");
                return null;
            }
            else {
                def.availableInstances--;
                MonsterDef.totalAvailableInstances--;
                Monster.monstersCount++;
            }
            return new Monster(map, Monster.monstersCount, mapx, mapy, def);
        };
        Monster.prototype.innerMove = function (fromRoom, toRoom) {
            if (fromRoom)
                delete fromRoom.monsters[this.id];
            toRoom.monsters[this.id] = this;
            Catacombs.EventBus.getInstance().fireEvent(new Catacombs.MonsterMovePayload(this.id, fromRoom.mapx, fromRoom.mapy, toRoom.mapx, toRoom.mapy));
        };
        Monster.monstersCount = 0;
        return Monster;
    }(Catacombs.Creature));
    Catacombs.Monster = Monster;
    var MonsterType;
    (function (MonsterType) {
        MonsterType[MonsterType["ZOMBIE"] = 0] = "ZOMBIE";
        MonsterType[MonsterType["SKELETON"] = 1] = "SKELETON";
        MonsterType[MonsterType["SWAMPER"] = 2] = "SWAMPER";
        MonsterType[MonsterType["TROLL"] = 3] = "TROLL";
        MonsterType[MonsterType["MINOTAUR"] = 4] = "MINOTAUR";
    })(MonsterType = Catacombs.MonsterType || (Catacombs.MonsterType = {}));
    // netvoři
    MonsterDef.register(MonsterType.ZOMBIE, "zombie", 1, 0, 1, 5);
    MonsterDef.register(MonsterType.SKELETON, "skeleton", 2, 1, 1, 3);
    MonsterDef.register(MonsterType.SWAMPER, "swamper", 3, 1, 2, 2);
    MonsterDef.register(MonsterType.TROLL, "troll", 4, 2, 2, 1);
    MonsterDef.register(MonsterType.MINOTAUR, "minotaur", 5, 2, 3, 1);
})(Catacombs || (Catacombs = {}));
