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
    var Creature = (function (_super) {
        __extends(Creature, _super);
        function Creature(map, creatureId, mapx, mapy, canReveal) {
            var _this = _super.call(this, map, creatureId, mapx, mapy) || this;
            _this.canReveal = canReveal;
            return _this;
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
    }(Catacombs.MapItem));
    Catacombs.Creature = Creature;
})(Catacombs || (Catacombs = {}));
