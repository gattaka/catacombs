namespace Catacombs {
    export class Proc {

        public static PLAYERS_COUNT = 4;

        public map: Map;
        public players = new Array<Player>();
        public monsters = new Array<Monster>();
        public souls = 4;

        private activePlayer = 0;
        private activeMonster = undefined;
        private activeKeeper = false;

        // počet posunů/útoků které za tento tah hráč/netvor udělal
        private actions = 0;

        constructor() {
            this.map = new Map(9, this);
            this.players = new Array<Player>();
            for (let i = 0; i < Proc.PLAYERS_COUNT; i++) {
                let player = Player.create(this.map);
                this.players[player.id] = player;
            }
            this.activePlayer = 0;
        }

        isActiveKeeper() {
            return this.activeKeeper;
        }

        getActivePlayer() {
            return this.activePlayer;
        }

        getActiveMonster() {
            return this.activeMonster;
        }

        /**
         * Zaeviduje, že v rámci tahu byla provedena další akce, 
         * pokud tím byl ukončen tah, vrátí false, jinak true
         */
        action() {
            this.actions++;
            if (this.actions > 1) {
                this.next();
                return false;
            }
            return true;
        }

        private resetActions() {
            this.actions = 0;
        }

        // Posune hráče/netvora někam
        move(movement: Movement) {
            if (this.activeKeeper && this.monsters[this.activeMonster].move(movement)) {
                this.action();
            } else {
                if (this.players[this.activePlayer].move(movement)) {
                    this.action();
                }
            }
        }

        /**
         * Zkus hrát za dalšího netvora, pokud je to možné, vrať false, 
         * pokud už jsem v tomto tahu keepera hrál za všechny jeho netvory, 
         * vrať true, protože je možné pokračovat dalším hráčem
         */
        private nextMonster(): boolean {
            this.resetActions();
            let lastMonster = this.activeMonster;
            // hledej dalšího netvora
            for (let i = 0; i < this.monsters.length; i++) {
                this.activeMonster = this.activeMonster == undefined ? 0 : (this.activeMonster + 1) % this.monsters.length;
                if (lastMonster == undefined || this.activeMonster > lastMonster) {
                    if (this.monsters[this.activeMonster]) {
                        // ok, mám ho
                        EventBus.getInstance().fireEvent(new NumberEventPayload(EventType.MONSTER_ACTIVATE, this.activeMonster));
                        return false;
                    }
                } else {
                    // došlo k přetočení, hrál jsem tedy už za všechna monstra
                    return true;
                }
            }
            // žádná monstra?
            return true;
        }

        /**
         * Vybere dalšího hráče, pokud dojde k přetočení cyklu hráčů, 
         * měl by hrát keeper to je dáno vrácením true
         */
        private prepareNextPlayer(): boolean {
            let lastPlayer = this.activePlayer;
            // Vyzkoušej všechny hráče, pro případ, že by některý z nich byl mrtví
            for (let i = 0; i < this.players.length; i++) {
                this.activePlayer = (this.activePlayer + 1) % this.players.length;
                if (this.players[this.activePlayer].health > 0) {
                    // true když dojde k přetočení (když jsem poslední hráč, jsem to zase já)
                    return lastPlayer >= this.activePlayer;
                }
            }
            // všichni hráči jsou mrtví... takže hraje keeper
            return true;
        }

        private activatePlayer() {
            // zkontroluj, že hráč stále žije (mohlo se stát, že ho keeper mezitím zabil)
            if (this.players[this.activePlayer].health > 0)
                EventBus.getInstance().fireEvent(new NumberEventPayload(EventType.PLAYER_ACTIVATE, this.activePlayer));
            else
                this.nextPlayer();
        }

        private nextPlayer() {
            this.prepareNextPlayer();
            this.activatePlayer();
        }

        next() {
            this.resetActions();
            if (this.activeKeeper) {
                if (this.nextMonster()) {
                    this.activeKeeper = false;
                    this.activatePlayer();
                }
            } else {
                if (this.prepareNextPlayer() && Object.keys(this.monsters).length > 0) {
                    // začíná hrát keeper
                    this.activeKeeper = true;
                    this.activeMonster = undefined;
                    this.nextMonster();
                } else {
                    this.activatePlayer();
                }
            }
        }

        private killMonster(monster: Monster) {
            monster.notifyKill();
            delete this.map.rooms.getValue(monster.mapx, monster.mapy).monsters[monster.id];
            delete this.monsters[monster.id];
        }

        public attackMonster(monster: Monster): { success: boolean, death: boolean } {
            let currentPlayer = this.players[this.getActivePlayer()];
            // útok je daný aktuálním útočníkem -- ten může útočit i z jiné mísnosti, 
            // než je cílový netvor
            let deployedAttack = currentPlayer.attack;
            let result = { success: false, death: false };
            if (deployedAttack > monster.def.defense && !monster.stunned) {
                result.success = true;
                // Zombie se dá trvale zabít až když je +2 útok, 
                // jinak se jenom omráčí a v další tahu ji může keeper znovu oživit
                if (monster.def.type != MonsterType.ZOMBIE || deployedAttack > monster.def.defense + 1 && monster.def.type == MonsterType.ZOMBIE) {
                    this.killMonster(monster);
                    result.death = true;
                } else {
                    monster.stunned = true;
                }
                if (monster.def.type == MonsterType.SWAMPER) {
                    this.innerAttackPlayer(currentPlayer, monster.def.attack);
                }
                if (currentPlayer.health > 0)
                    this.action();
                else
                    this.next();
                return result;
            } else {
                return result;
            }
        }

        private innerAttackPlayer(player: Player, attack: number) {
            if (attack > player.defense) {
                player.health--;
                EventBus.getInstance().fireEvent(new PlayerHitPayload(player.id, true, player.health == 0));
            } else {
                EventBus.getInstance().fireEvent(new PlayerHitPayload(player.id, false, false));
            }
        }

        public attackPlayer(player: Player, monsterId: number) {
            let monster = this.monsters[monsterId];
            this.innerAttackPlayer(player, monster.def.attack);
            // netvor má pouze jeden útok za tah
            this.next();
        }
    }
}