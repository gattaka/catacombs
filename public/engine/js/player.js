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
    var TreasureItem = (function () {
        function TreasureItem(def, amount) {
            if (amount === void 0) { amount = 1; }
            this.def = def;
            this.amount = amount;
        }
        return TreasureItem;
    }());
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(map, playerId) {
            var _this = _super.call(this, map, playerId, map.center, map.center, true) || this;
            _this.treasureSum = 0;
            _this.attack = 1;
            _this.defense = 0;
            _this.treasure = {};
            _this.equipment = {};
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
            var invItem = this.treasure[Catacombs.TreasureType[item.def.type]];
            if (invItem) {
                invItem.amount++;
            }
            else {
                var itemDef = item.def;
                invItem = new TreasureItem(item.def);
                this.treasure[Catacombs.TreasureType[item.def.type]] = invItem;
                this.treasureSum += itemDef.price;
            }
        };
        Player.prototype.useItem = function (type) {
            var item = this.treasure[Catacombs.EquipmentType[type]];
            item.amount--;
            Catacombs.EventBus.getInstance().fireEvent(new Catacombs.NumberEventPayload(Catacombs.EventType.INV_UPDATE, this.id));
        };
        Player.prototype.buy = function (def) {
            this.treasureSum -= def.price;
            var toPay = def.price;
            var item;
            // postupně projdi cennosti od nejdražších
            var types = [Catacombs.TreasureType.AMULET, Catacombs.TreasureType.GEMS, Catacombs.TreasureType.CUP, Catacombs.TreasureType.COIN];
            for (var i = 0; i < types.length; i++) {
                var t = types[i];
                item = this.treasure[Catacombs.TreasureType[t]];
                // pokud hráč má v inventáři takovou cennost
                if (item) {
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
                        delete this.treasure[Catacombs.TreasureType[t]];
                    }
                    // sniž cenu, kterou ještě zbývá doplatit
                    toPay -= payPart;
                    if (toPay == 0)
                        break;
                }
            }
            this.equipment[Catacombs.EquipmentType[def.type]] = def;
            switch (def.type) {
                case Catacombs.EquipmentType.ARMOR:
                    this.defense++;
                    break;
                case Catacombs.EquipmentType.SHIELD:
                    this.defense++;
                    break;
                case Catacombs.EquipmentType.SWORD:
                    this.attack = 2;
                    break;
            }
            // nemám co s tou instancí dělat, potřebuju, aby se snížily počty karet
            Catacombs.Equipment.create(def);
            Catacombs.EventBus.getInstance().fireEvent(new Catacombs.NumberEventPayload(Catacombs.EventType.INV_UPDATE, this.id));
        };
        return Player;
    }(Catacombs.Creature));
    Player.playersCount = 0;
    Catacombs.Player = Player;
})(Catacombs || (Catacombs = {}));
