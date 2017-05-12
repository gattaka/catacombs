var Catacombs;
(function (Catacombs) {
    var Proc = (function () {
        function Proc() {
            this.players = new Array();
            this.items = new Array();
            this.monsters = new Array();
            // Mapa
            this.map = new Catacombs.Map(7, this);
            // Players
            this.players = new Array();
            for (var i = 0; i < Proc.PLAYERS_COUNT; i++) {
                var player = Catacombs.Player.create(this.map);
                this.players.push(player);
                if (i == 0)
                    player.active = true;
            }
        }
        return Proc;
    }());
    Proc.PLAYERS_COUNT = 4;
    Catacombs.Proc = Proc;
})(Catacombs || (Catacombs = {}));