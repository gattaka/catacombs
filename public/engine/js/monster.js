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
    var Monster = (function () {
        function Monster(def) {
            this.def = def;
        }
        Monster.createRandom = function (maxTier) {
            var m = Math.floor(Math.random() * maxTier);
            for (var i = 0; i < maxTier; i++) {
                var def = MonsterDef.monsterDefs[m];
                if (def.availableInstances > 0)
                    return Monster.create(MonsterDef.monsterDefs[m]);
                m = (m + 1) % maxTier;
            }
            return null;
        };
        Monster.create = function (def) {
            if (def.availableInstances == 0) {
                return null;
            }
            else {
                def.availableInstances--;
                MonsterDef.totalAvailableInstances--;
            }
            return new Monster(def);
        };
        return Monster;
    }());
    Catacombs.Monster = Monster;
    // netvoři
    MonsterDef.register("zombie", 1, 1, 0, 5);
    MonsterDef.register("skeleton", 2, 1, 1, 3);
    MonsterDef.register("swamper", 3, 2, 2, 2);
    MonsterDef.register("troll", 4, 3, 3, 1);
    MonsterDef.register("minotaur", 5, 4, 4, 1);
})(Catacombs || (Catacombs = {}));
