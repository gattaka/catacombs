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
        function Monster(map, creatureId, mapx, mapy, def) {
            var _this = _super.call(this, map, creatureId, mapx, mapy, false) || this;
            _this.def = def;
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
            alert("Nepodařilo se získat náhodného netvora - nejsou volné karty!");
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
