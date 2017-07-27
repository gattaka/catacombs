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
                this.treasure += itemDef.price;
            }
        };
        Player.prototype.useItem = function (key) {
            var item = this.inventory[key];
            item.amount--;
            Catacombs.EventBus.getInstance().fireEvent(new Catacombs.NumberEventPayload(Catacombs.EventType.INV_UPDATE, this.id));
        };
        Player.prototype.buy = function (def) {
            this.treasure -= def.price;
            var toPay = def.price;
            var item;
            // postupně projdi cennosti od nejdražších
            var types = ["amulet", "gems", "cup", "coin"];
            for (var i = 0; i < types.length; i++) {
                var t = types[i];
                item = this.inventory[t];
                // pokud hráč má v inventáři takovou cennost
                if (!item) {
                    var payPart = void 0;
                    // může tímto typem zaplatit celou částku?
                    if (item.def.price * item.amount >= toPay) {
                        // ano, splacená část je celá zbylá cena
                        payPart = toPay;
                    }
                    else {
                        // ne, splacená část je všechno od této cenosti, co mám
                        payPart = item.def.price * item.amount;
                    }
                    // sniž množství cennosti, dle toho, kolik se utratilo
                    item.amount -= payPart / item.def.price;
                    if (item.amount == 0) {
                        delete this.inventory[t];
                    }
                    // sniž cenu, kterou ještě zbývá doplatit
                    toPay -= payPart;
                    if (toPay == 0)
                        break;
                }
            }
            this.inventory[def.name] = new InventoryItem(def.name, 1);
            // nemám co s tou instancí dělat, potřebuju, aby se snížily počty karet
            Catacombs.Equipment.create(def);
            Catacombs.EventBus.getInstance().fireEvent(new Catacombs.NumberEventPayload(Catacombs.EventType.INV_UPDATE, this.id));
        };
        return Player;
    }(Catacombs.Creature));
    Player.playersCount = 0;
    Catacombs.Player = Player;
})(Catacombs || (Catacombs = {}));
