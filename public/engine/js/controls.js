var Catacombs;
(function (Catacombs) {
    var Controls = /** @class */ (function () {
        function Controls(proc) {
            this.proc = proc;
            this.activePlayer = 0;
            this.activeMonster = undefined;
            this.activeKeeper = false;
            // počet posunů/útoků které za tento tah hráč/netvor udělal
            this.actions = 0;
            this.activePlayer = 0;
        }
        Controls.prototype.isActiveKeeper = function () {
            return this.activeKeeper;
        };
        Controls.prototype.getActivePlayer = function () {
            return this.activePlayer;
        };
        Controls.prototype.getActiveMonster = function () {
            return this.activeMonster;
        };
        Controls.prototype.action = function () {
            this.actions++;
            if (this.actions > 1)
                this.next();
        };
        // Posune hráče/netvora někam
        Controls.prototype.move = function (movement) {
            if (this.activeKeeper && this.proc.monsters[this.activeMonster].move(movement)) {
                this.action();
            }
            else {
                if (this.proc.players[this.activePlayer].move(movement)) {
                    this.action();
                }
            }
        };
        /**
         * Zkus hrát za dalšího netvora, pokud je to možné, vrať false,
         * pokud už jsem v tomto tahu keepera hrál za všechny jeho netvory,
         * vrať true, protože je možné pokračovat dalším hráčem
         */
        Controls.prototype.nextMonster = function () {
            this.actions = 0;
            var lastMonster = this.activeMonster;
            // hledej dalšího netvora
            for (var i = 0; i < this.proc.monsters.length; i++) {
                this.activeMonster = this.activeMonster == undefined ? 0 : (this.activeMonster + 1) % this.proc.monsters.length;
                if (lastMonster == undefined || this.activeMonster > lastMonster) {
                    if (this.proc.monsters[this.activeMonster]) {
                        // ok, mám ho
                        Catacombs.EventBus.getInstance().fireEvent(new Catacombs.NumberEventPayload(Catacombs.EventType.MONSTER_ACTIVATE, this.activeMonster));
                        return false;
                    }
                }
                else {
                    // došlo k přetočení, hrál jsem tedy už za všechna monstra
                    return true;
                }
            }
            // žádná monstra?
            return true;
        };
        /**
         * Vybere dalšího hráče, pokud dojde k přetočení cyklu hráčů,
         * měl by hrát keeper to je dáno vrácením true
         */
        Controls.prototype.prepareNextPlayer = function () {
            var lastPlayer = this.activePlayer;
            // Vyzkoušej všechny hráče, pro případ, že by některý z nich byl mrtví
            for (var i = 0; i < this.proc.players.length; i++) {
                this.activePlayer = (this.activePlayer + 1) % this.proc.players.length;
                if (this.proc.players[this.activePlayer].health > 0) {
                    // true když dojde k přetočení
                    return lastPlayer > this.activePlayer;
                }
            }
            // všichni hráči jsou mrtví... takže hraje keeper
            return true;
        };
        Controls.prototype.activatePlayer = function () {
            Catacombs.EventBus.getInstance().fireEvent(new Catacombs.NumberEventPayload(Catacombs.EventType.PLAYER_ACTIVATE, this.activePlayer));
        };
        Controls.prototype.nextPlayer = function () {
            this.prepareNextPlayer();
            this.activatePlayer();
        };
        Controls.prototype.next = function () {
            this.actions = 0;
            if (this.activeKeeper) {
                if (this.nextMonster()) {
                    this.activeKeeper = false;
                    this.activatePlayer();
                }
            }
            else {
                if (this.prepareNextPlayer() && Catacombs.Monster.monstersCount > 0) {
                    // začíná hrát keeper
                    this.activeKeeper = true;
                    this.activeMonster = undefined;
                    this.nextMonster();
                }
                else {
                    this.activatePlayer();
                }
            }
        };
        return Controls;
    }());
    Catacombs.Controls = Controls;
})(Catacombs || (Catacombs = {}));
