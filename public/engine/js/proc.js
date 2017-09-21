var Catacombs;
(function (Catacombs) {
    var Proc = /** @class */ (function () {
        function Proc() {
            this.players = new Array();
            this.monsters = new Array();
            this.activePlayer = 0;
            this.activeMonster = undefined;
            this.activeKeeper = false;
            // počet posunů/útoků které za tento tah hráč/netvor udělal
            this.actions = 0;
            this.map = new Catacombs.Map(9, this);
            this.players = new Array();
            for (var i = 0; i < Proc.PLAYERS_COUNT; i++) {
                var player = Catacombs.Player.create(this.map);
                this.players[player.id] = player;
            }
            this.activePlayer = 0;
        }
        Proc.prototype.isActiveKeeper = function () {
            return this.activeKeeper;
        };
        Proc.prototype.getActivePlayer = function () {
            return this.activePlayer;
        };
        Proc.prototype.getActiveMonster = function () {
            return this.activeMonster;
        };
        /**
         * Zaeviduje, že v rámci tahu byla provedena další akce,
         * pokud tím byl ukončen tah, vrátí false, jinak true
         */
        Proc.prototype.action = function () {
            this.actions++;
            if (this.actions > 1) {
                this.next();
                return false;
            }
            console.log("Actions = 1");
            return true;
        };
        Proc.prototype.resetActions = function () {
            console.log("Actions = 0");
            this.actions = 0;
        };
        // Posune hráče/netvora někam
        Proc.prototype.move = function (movement) {
            if (this.activeKeeper && this.monsters[this.activeMonster].move(movement)) {
                this.action();
            }
            else {
                if (this.players[this.activePlayer].move(movement)) {
                    this.action();
                }
            }
        };
        /**
         * Zkus hrát za dalšího netvora, pokud je to možné, vrať false,
         * pokud už jsem v tomto tahu keepera hrál za všechny jeho netvory,
         * vrať true, protože je možné pokračovat dalším hráčem
         */
        Proc.prototype.nextMonster = function () {
            this.resetActions();
            var lastMonster = this.activeMonster;
            // hledej dalšího netvora
            for (var i = 0; i < this.monsters.length; i++) {
                this.activeMonster = this.activeMonster == undefined ? 0 : (this.activeMonster + 1) % this.monsters.length;
                if (lastMonster == undefined || this.activeMonster > lastMonster) {
                    if (this.monsters[this.activeMonster]) {
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
        Proc.prototype.prepareNextPlayer = function () {
            var lastPlayer = this.activePlayer;
            // Vyzkoušej všechny hráče, pro případ, že by některý z nich byl mrtví
            for (var i = 0; i < this.players.length; i++) {
                this.activePlayer = (this.activePlayer + 1) % this.players.length;
                if (this.players[this.activePlayer].health > 0) {
                    // true když dojde k přetočení (když jsem poslední hráč, jsem to zase já)
                    return lastPlayer >= this.activePlayer;
                }
            }
            // všichni hráči jsou mrtví... takže hraje keeper
            return true;
        };
        Proc.prototype.activatePlayer = function () {
            // zkontroluj, že hráč stále žije (mohlo se stát, že ho keeper mezitím zabil)
            if (this.players[this.activePlayer].health > 0)
                Catacombs.EventBus.getInstance().fireEvent(new Catacombs.NumberEventPayload(Catacombs.EventType.PLAYER_ACTIVATE, this.activePlayer));
            else
                this.nextPlayer();
        };
        Proc.prototype.nextPlayer = function () {
            this.prepareNextPlayer();
            this.activatePlayer();
        };
        Proc.prototype.next = function () {
            this.resetActions();
            if (this.activeKeeper) {
                if (this.nextMonster()) {
                    this.activeKeeper = false;
                    this.activatePlayer();
                }
            }
            else {
                if (this.prepareNextPlayer() && Object.keys(this.monsters).length > 0) {
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
        Proc.prototype.killMonster = function (monster) {
            monster.notifyKill();
            delete this.map.rooms.getValue(monster.mapx, monster.mapy).monsters[monster.id];
            delete this.monsters[monster.id];
        };
        Proc.prototype.attackMonster = function (monster) {
            var currentPlayer = this.players[this.getActivePlayer()];
            // útok je daný aktuálním útočníkem -- ten může útočit i z jiné mísnosti, 
            // než je cílový netvor
            var deployedAttack = currentPlayer.attack;
            var result = { success: false, death: false };
            if (deployedAttack > monster.def.defense && !monster.stunned) {
                result.success = true;
                // Zombie se dá trvale zabít až když je +2 útok, 
                // jinak se jenom omráčí a v další tahu ji může keeper znovu oživit
                if (monster.def.type != Catacombs.MonsterType.ZOMBIE || deployedAttack > monster.def.defense + 1 && monster.def.type == Catacombs.MonsterType.ZOMBIE) {
                    this.killMonster(monster);
                    result.death = true;
                }
                else {
                    monster.stunned = true;
                }
                if (monster.def.type == Catacombs.MonsterType.SWAMPER) {
                    this.innerAttackPlayer(currentPlayer, monster.def);
                }
                if (currentPlayer.health > 0)
                    this.action();
                else
                    this.next();
                return result;
            }
            else {
                return result;
            }
        };
        Proc.prototype.innerAttackPlayer = function (player, monster) {
            if (monster.attack > player.defense) {
                player.health--;
                // netvor má pouze jeden útok za tah
                this.next();
                Catacombs.EventBus.getInstance().fireEvent(new Catacombs.PlayerHitPayload(player.id, true, player.health == 0));
            }
            else {
                Catacombs.EventBus.getInstance().fireEvent(new Catacombs.PlayerHitPayload(player.id, false, false));
            }
        };
        Proc.prototype.attackPlayer = function (player, monsterId) {
            var monster = this.monsters[monsterId];
            this.innerAttackPlayer(player, monster.def);
        };
        Proc.PLAYERS_COUNT = 4;
        return Proc;
    }());
    Catacombs.Proc = Proc;
})(Catacombs || (Catacombs = {}));
