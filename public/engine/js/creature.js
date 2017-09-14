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
    var Creature = /** @class */ (function (_super) {
        __extends(Creature, _super);
        function Creature(map, creatureId, mapx, mapy, canReveal) {
            var _this = _super.call(this, map, creatureId, mapx, mapy) || this;
            _this.canReveal = canReveal;
            return _this;
        }
        Creature.prototype.move = function (movement) {
            // kontroly, zda tohle jde jsou dělané na UI
            var oldRoom = this.map.rooms.getValue(movement.fromX, movement.fromY);
            var toRoom = this.map.rooms.getValue(movement.toX, movement.toY);
            if (!toRoom) {
                toRoom = this.map.revealMapPiece(movement.toX, movement.toY, movement.sideTo);
            }
            this.innerMove(oldRoom, toRoom);
            // posun, teď už jsem v cílové místnosti
            this.mapx = movement.toX;
            this.mapy = movement.toY;
            return true;
        };
        return Creature;
    }(Catacombs.MapItem));
    Catacombs.Creature = Creature;
})(Catacombs || (Catacombs = {}));
