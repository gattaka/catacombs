var Catacombs;
(function (Catacombs) {
    var Player = (function () {
        function Player(token, map) {
            this.token = token;
            this.map = map;
            this.inventory = new Array();
        }
        Player.create = function (map) {
            if (Player.playersCount > 4)
                return null;
            Player.playersCount++;
            return new Player(new PIXI.Sprite(PIXI.Texture.fromImage('images/player' + Player.playersCount + '.png')), map);
        };
        Player.prototype.move = function (sideFrom, sideTo) {
            // můžu se posunout tímto směrem z aktuální místnosti?
            var room = this.map.rooms.getValue(this.mapx, this.mapy);
            if (!(sideFrom & room.rotatedExits)) {
                return;
            }
            // můžu se posunout tímto směrem do další místnosti (pokud je objevená)?
            var tmapx = this.mapx;
            var tmapy = this.mapy;
            switch (sideTo) {
                // přicházím zleva
                case 1:
                    tmapx = this.mapx + 1;
                    break;
                // přicházím zprava
                case 4:
                    tmapx = this.mapx - 1;
                    break;
                // přicházím shora
                case 8:
                    tmapy = this.mapy + 1;
                    break;
                // přicházím zdola
                case 2:
                    tmapy = this.mapy - 1;
                    break;
            }
            if (tmapx < 0 || tmapx >= this.map.sideSize || tmapy < 0 || tmapy >= this.map.sideSize)
                return;
            room = this.map.rooms.getValue(tmapx, tmapy);
            if (!room) {
                room = this.map.revealMapPiece(tmapx, tmapy, sideTo);
            }
            else {
                if (!(sideTo & room.rotatedExits)) {
                    return;
                }
            }
            this.token.x += (tmapx - this.mapx) * Catacombs.Game.ROOM_IMG_SIZE;
            this.token.y += (tmapy - this.mapy) * Catacombs.Game.ROOM_IMG_SIZE;
            this.mapx = tmapx;
            this.mapy = tmapy;
        };
        Player.prototype.up = function () { this.move(8, 2); };
        Player.prototype.down = function () { this.move(2, 8); };
        Player.prototype.left = function () { this.move(1, 4); };
        Player.prototype.right = function () { this.move(4, 1); };
        return Player;
    }());
    Player.playersCount = 0;
    Catacombs.Player = Player;
})(Catacombs || (Catacombs = {}));
