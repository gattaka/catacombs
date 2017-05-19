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
    var MonsterDef = (function () {
        function MonsterDef(name, tier, attack, defense, availableInstances) {
            this.name = name;
            this.tier = tier;
            this.attack = attack;
            this.defense = defense;
            this.availableInstances = availableInstances;
            MonsterDef.totalAvailableInstances += availableInstances;
        }
        MonsterDef.register = function (name, tier, attack, defense, availableInstances) {
            MonsterDef.monsterDefs[tier - 1] = new MonsterDef(name, tier, attack, defense, availableInstances);
        };
        return MonsterDef;
    }());
    MonsterDef.totalAvailableInstances = 0;
    MonsterDef.monsterDefs = new Array();
    Catacombs.MonsterDef = MonsterDef;
    var Monster = (function (_super) {
        __extends(Monster, _super);
        function Monster(map, creatureId, def, mapx, mapy) {
            var _this = _super.call(this, map, creatureId, mapx, mapy, false) || this;
            _this.def = def;
            _this.mapx = mapx;
            _this.mapy = mapy;
            return _this;
        }
        Monster.createRandom = function (map, maxTier, mapx, mapy) {
            var m = Math.floor(Math.random() * maxTier);
            for (var i = 0; i < maxTier; i++) {
                var def = MonsterDef.monsterDefs[m];
                if (def.availableInstances > 0)
                    return Monster.create(map, MonsterDef.monsterDefs[m], mapx, mapy);
                m = (m + 1) % maxTier;
            }
            return null;
        };
        Monster.create = function (map, def, mapx, mapy) {
            if (def.availableInstances == 0) {
                return null;
            }
            else {
                def.availableInstances--;
                MonsterDef.totalAvailableInstances--;
                Monster.monstersCount++;
            }
            return new Monster(map, Monster.monstersCount, def, mapx, mapy);
        };
        Monster.prototype.innerMove = function (fromRoom, toRoom) {
            if (fromRoom)
                fromRoom.monsters[this.creatureId] = null;
            toRoom.monsters[this.creatureId] = this;
            Catacombs.EventBus.getInstance().fireEvent(new Catacombs.MonsterMovePayload(this.creatureId, fromRoom.mapx, fromRoom.mapy, toRoom.mapx, toRoom.mapy));
        };
        return Monster;
    }(Catacombs.Creature));
    Monster.monstersCount = 0;
    Catacombs.Monster = Monster;
    // netvoři
    MonsterDef.register("zombie", 1, 1, 0, 5);
    MonsterDef.register("skeleton", 2, 1, 1, 3);
    MonsterDef.register("swamper", 3, 2, 2, 2);
    MonsterDef.register("troll", 4, 3, 3, 1);
    MonsterDef.register("minotaur", 5, 4, 4, 1);
})(Catacombs || (Catacombs = {}));
