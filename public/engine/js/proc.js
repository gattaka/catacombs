var Catacombs;
(function (Catacombs) {
    var Proc = /** @class */ (function () {
        function Proc() {
            this.players = new Array();
            this.monsters = new Array();
            // Mapa
            this.map = new Catacombs.Map(9, this);
            // Players
            this.players = new Array();
            for (var i = 0; i < Proc.PLAYERS_COUNT; i++) {
                var player = Catacombs.Player.create(this.map);
                this.players[player.id] = player;
            }
        }
        Proc.prototype.killMonster = function (monster) {
            delete this.map.rooms.getValue(monster.mapx, monster.mapy).monsters[monster.id];
            delete this.monsters[monster.id];
            Catacombs.Monster.monstersCount--;
        };
        Proc.PLAYERS_COUNT = 4;
        return Proc;
    }());
    Catacombs.Proc = Proc;
})(Catacombs || (Catacombs = {}));
