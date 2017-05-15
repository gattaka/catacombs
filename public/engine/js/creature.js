var Catacombs;
(function (Catacombs) {
    var Creature = (function () {
        function Creature(map, creatureId, mapx, mapy, canReveal) {
            this.map = map;
            this.creatureId = creatureId;
            this.mapx = mapx;
            this.mapy = mapy;
            this.canReveal = canReveal;
        }
        Creature.prototype.move = function (sideFrom, sideTo) {
            // můžu se posunout tímto směrem z aktuální místnosti?
            var room = this.map.rooms.getValue(this.mapx, this.mapy);
            if (!(sideFrom & room.rotatedExits)) {
                return false;
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
                return false;
            room = this.map.rooms.getValue(tmapx, tmapy);
            if (!room) {
                if (this.canReveal) {
                    room = this.map.revealMapPiece(tmapx, tmapy, sideTo);
                }
                else {
                    return false;
                }
            }
            else {
                if (!(sideTo & room.rotatedExits)) {
                    return false;
                }
            }
            var oldRoom = this.map.rooms.getValue(this.mapx, this.mapy);
            this.innerMove(oldRoom, room);
            this.mapx = tmapx;
            this.mapy = tmapy;
            return true;
        };
        return Creature;
    }());
    Catacombs.Creature = Creature;
})(Catacombs || (Catacombs = {}));
