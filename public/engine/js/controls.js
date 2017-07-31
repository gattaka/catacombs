var Catacombs;
(function (Catacombs) {
    var Controls = (function () {
        function Controls(proc) {
            this.proc = proc;
            this.activeKeeper = false;
            // kolik posunů jsem v tomto tahu udělal?
            this.moves = 0;
            this.activePlayer = 0;
        }
        Controls.prototype.move = function (movement) {
            if (this.activeKeeper) {
                if (this.activeMonster && this.proc.monsters[this.activeMonster].move(movement)) {
                    // this.moves++;
                    // if (this.moves > 1)
                    this.next();
                }
            }
            else {
                if (this.proc.players[this.activePlayer].move(movement)) {
                    this.moves++;
                    if (this.moves > 1)
                        this.next();
                }
            }
        };
        Controls.prototype.next = function () {
            this.moves = 0;
            if (this.activeKeeper) {
                this.activeKeeper = false;
                this.activeMonster = undefined;
                // Vyzkoušej všechny hráče, pro případ, že by některý z nich byl mrtví
                for (var i = 0; i < this.proc.players.length; i++) {
                    if (this.proc.players[this.activePlayer].health > 0) {
                        Catacombs.EventBus.getInstance().fireEvent(new Catacombs.NumberEventPayload(Catacombs.EventType.PLAYER_ACTIVATE, this.activePlayer));
                        return;
                    }
                    else {
                        this.activePlayer = (this.activePlayer + 1) % this.proc.players.length;
                    }
                }
                // všichni hráči jsou mrtví...
                Catacombs.EventBus.getInstance().fireEvent(new Catacombs.SimpleEventPayload(Catacombs.EventType.KEEPER_WON));
            }
            else {
                this.activePlayer = (this.activePlayer + 1) % this.proc.players.length;
                if (Catacombs.Monster.monstersCount > 0) {
                    this.activeKeeper = true;
                    Catacombs.EventBus.getInstance().fireEvent(new Catacombs.SimpleEventPayload(Catacombs.EventType.KEEPER_ACTIVATE));
                }
                else {
                    if (this.proc.players[this.activePlayer].health > 0) {
                        Catacombs.EventBus.getInstance().fireEvent(new Catacombs.NumberEventPayload(Catacombs.EventType.PLAYER_ACTIVATE, this.activePlayer));
                    }
                    else {
                        this.next();
                        return;
                    }
                }
            }
        };
        return Controls;
    }());
    Catacombs.Controls = Controls;
})(Catacombs || (Catacombs = {}));
