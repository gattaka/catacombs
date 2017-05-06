var Catacombs;
(function (Catacombs) {
    var MonsterDef = (function () {
        function MonsterDef(name, tier, attack, defense, count) {
            this.name = name;
            this.tier = tier;
            this.attack = attack;
            this.defense = defense;
            this.count = count;
            this.cardTexture = PIXI.Texture.fromImage('images/' + name + '.png');
            this.tokenTexture = PIXI.Texture.fromImage('images/' + name + '_token.png');
        }
        MonsterDef.register = function (name, tier, attack, defense, count) {
            MonsterDef.monsterDefs[tier - 1] = new MonsterDef(name, tier, attack, defense, count);
        };
        return MonsterDef;
    }());
    MonsterDef.monsterDefs = new Array();
    Catacombs.MonsterDef = MonsterDef;
    var Monster = (function () {
        function Monster(definition, card, token) {
            this.definition = definition;
            this.card = card;
            this.token = token;
        }
        Monster.createRandom = function (maxTier) {
            var m = Math.floor(Math.random() * maxTier);
            for (var i = 0; i < maxTier; i++) {
                if (Monster.counter[m] == undefined || Monster.counter[m] > 0)
                    return Monster.create(MonsterDef.monsterDefs[m]);
                m = (m + 1) % maxTier;
            }
            return null;
        };
        Monster.create = function (def) {
            if (Monster.counter[def.tier - 1] !== undefined) {
                if (Monster.counter[def.tier - 1] == 0)
                    return null;
            }
            else {
                Monster.counter[def.tier - 1] = def.count;
            }
            Monster.counter[def.tier - 1]--;
            return new Monster(def, new PIXI.Sprite(def.cardTexture), new PIXI.Sprite(def.tokenTexture));
        };
        return Monster;
    }());
    Monster.counter = new Array();
    Catacombs.Monster = Monster;
    // netvoři
    MonsterDef.register("zombie", 1, 1, 0, 5);
    MonsterDef.register("skeleton", 2, 1, 1, 3);
    MonsterDef.register("swamper", 3, 2, 2, 2);
    MonsterDef.register("troll", 4, 3, 3, 1);
    MonsterDef.register("minotaur", 5, 4, 4, 1);
})(Catacombs || (Catacombs = {}));
