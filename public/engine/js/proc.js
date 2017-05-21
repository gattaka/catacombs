var Catacombs;
(function (Catacombs) {
    var Proc = (function () {
        function Proc() {
            this.players = new Array();
            this.items = new Array();
            this.monsters = new Array();
            // Mapa
            this.map = new Catacombs.Map(9, this);
            // Players
            this.players = new Array();
            for (var i = 0; i < Proc.PLAYERS_COUNT; i++) {
                var player = Catacombs.Player.create(this.map);
                this.players.push(player);
            }
        }
        return Proc;
    }());
    Proc.PLAYERS_COUNT = 4;
    Catacombs.Proc = Proc;
})(Catacombs || (Catacombs = {}));
