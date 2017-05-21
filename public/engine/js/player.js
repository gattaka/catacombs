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
    var InventoryItem = (function () {
        function InventoryItem(name, amount) {
            if (amount === void 0) { amount = 1; }
            this.name = name;
            this.amount = amount;
        }
        return InventoryItem;
    }());
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(map, playerId) {
            var _this = _super.call(this, map, playerId, map.center, map.center, true) || this;
            _this.inventory = {};
            _this.health = 3;
            _this.map.rooms.getValue(_this.mapx, _this.mapy).players[_this.id] = _this;
            return _this;
        }
        Player.create = function (map) {
            if (Player.playersCount > 4)
                return undefined;
            var player = new Player(map, Player.playersCount);
            Player.playersCount++;
            return player;
        };
        Player.prototype.name = function () {
            switch (this.id) {
                case 0: return "zelený";
                case 1: return "červený";
                case 2: return "žlutý";
                case 3: return "modrý";
            }
        };
        Player.prototype.innerMove = function (fromRoom, toRoom) {
            if (fromRoom)
                delete fromRoom.players[this.id];
            toRoom.players[this.id] = this;
            Catacombs.EventBus.getInstance().fireEvent(new Catacombs.PlayerMovePayload(this.id, fromRoom.mapx, fromRoom.mapy, toRoom.mapx, toRoom.mapy));
            var player = this;
            if (toRoom.treasure && toRoom.treasure.def.canPick) {
                player.takeItem(toRoom.treasure);
                Catacombs.EventBus.getInstance().fireEvent(new Catacombs.RoomItemObtainedPayload(toRoom, toRoom.treasure.def, this.id));
                Catacombs.EventBus.getInstance().fireEvent(new Catacombs.StringEventPayload(Catacombs.EventType.LOG, this.name() + " hráč získal " + toRoom.treasure.def.caption));
                delete toRoom.treasure;
            }
        };
        Player.prototype.takeItem = function (item) {
            var invItem = this.inventory[item.def.name];
            if (invItem) {
                invItem.amount++;
            }
            else {
                var itemDef = item.def;
                invItem = new InventoryItem(item.def.name);
                this.inventory[item.def.name] = invItem;
            }
        };
        Player.prototype.useItem = function (key) {
            var item = this.inventory[key];
            item.amount--;
            Catacombs.EventBus.getInstance().fireEvent(new Catacombs.NumberEventPayload(Catacombs.EventType.INV_UPDATE, this.id));
        };
        return Player;
    }(Catacombs.Creature));
    Player.playersCount = 0;
    Catacombs.Player = Player;
})(Catacombs || (Catacombs = {}));
