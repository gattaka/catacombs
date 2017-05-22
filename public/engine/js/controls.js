var Catacombs;
(function (Catacombs) {
    var Controls = (function () {
        function Controls(proc) {
            var _this = this;
            this.proc = proc;
            this.activeKeeper = false;
            Catacombs.Keyboard.on(37, function () { _this.left(); });
            Catacombs.Keyboard.on(65, function () { _this.left(); });
            Catacombs.Keyboard.on(38, function () { _this.up(); });
            Catacombs.Keyboard.on(87, function () { _this.up(); });
            Catacombs.Keyboard.on(39, function () { _this.right(); });
            Catacombs.Keyboard.on(68, function () { _this.right(); });
            Catacombs.Keyboard.on(40, function () { _this.down(); });
            Catacombs.Keyboard.on(83, function () { _this.down(); });
            Catacombs.Keyboard.on(32, function () { _this.next(); });
            this.activePlayer = 0;
        }
        Controls.prototype.move = function (sideFrom, sideTo) {
            if (this.activeKeeper) {
                if (this.activeMonster && this.proc.monsters[this.activeMonster].move(sideFrom, sideTo)) {
                    this.next();
                }
            }
            else {
                if (this.proc.players[this.activePlayer].move(sideFrom, sideTo)) {
                    this.next();
                }
            }
        };
        Controls.prototype.next = function () {
            if (this.activeKeeper) {
                this.activeKeeper = false;
                this.activeMonster = undefined;
                if (this.proc.players[this.activePlayer].health > 0) {
                    Catacombs.EventBus.getInstance().fireEvent(new Catacombs.NumberEventPayload(Catacombs.EventType.PLAYER_ACTIVATE, this.activePlayer));
                }
                else {
                    this.next();
                }
            }
            else {
                this.activePlayer = (this.activePlayer + 1) % this.proc.players.length;
                if (this.activePlayer == 0 && Catacombs.Monster.monstersCount > 0) {
                    this.activeKeeper = true;
                    Catacombs.EventBus.getInstance().fireEvent(new Catacombs.SimpleEventPayload(Catacombs.EventType.KEEPER_ACTIVATE));
                }
                else {
                    if (this.proc.players[this.activePlayer].health > 0) {
                        Catacombs.EventBus.getInstance().fireEvent(new Catacombs.NumberEventPayload(Catacombs.EventType.PLAYER_ACTIVATE, this.activePlayer));
                    }
                    else {
                        this.next();
                    }
                }
            }
        };
        Controls.prototype.up = function () { this.move(8, 2); };
        Controls.prototype.down = function () { this.move(2, 8); };
        Controls.prototype.left = function () { this.move(1, 4); };
        Controls.prototype.right = function () { this.move(4, 1); };
        return Controls;
    }());
    Catacombs.Controls = Controls;
})(Catacombs || (Catacombs = {}));
