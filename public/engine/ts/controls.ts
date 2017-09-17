namespace Catacombs {
    export class Controls {

        private activePlayer = 0;
        private activeMonster = undefined;
        private activeKeeper = false;
        // počet posunů/útoků které za tento tah hráč/netvor udělal
        private actions = 0;

        constructor(private proc: Proc) {
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

        action() {
            this.actions++;
            if (this.actions > 1)
                this.next();
        }

        // Posune hráče/netvora někam
        move(movement: Movement) {
            if (this.activeKeeper && this.proc.monsters[this.activeMonster].move(movement)) {
                this.action();
            } else {
                if (this.proc.players[this.activePlayer].move(movement)) {
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
            this.actions = 0;
            let lastMonster = this.activeMonster;
            // hledej dalšího netvora
            for (let i = 0; i < this.proc.monsters.length; i++) {
                this.activeMonster = this.activeMonster == undefined ? 0 : (this.activeMonster + 1) % this.proc.monsters.length;
                if (lastMonster == undefined || this.activeMonster > lastMonster) {
                    if (this.proc.monsters[this.activeMonster]) {
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
            for (let i = 0; i < this.proc.players.length; i++) {
                this.activePlayer = (this.activePlayer + 1) % this.proc.players.length;
                if (this.proc.players[this.activePlayer].health > 0) {
                    // true když dojde k přetočení
                    return lastPlayer > this.activePlayer;
                }
            }
            // všichni hráči jsou mrtví... takže hraje keeper
            return true;
        }

        private activatePlayer() {
            // zkontroluj, že hráč stále žije (mohlo se stát, že ho keeper mezitím zabil)
            if (this.proc.players[this.activePlayer].health > 0)
                EventBus.getInstance().fireEvent(new NumberEventPayload(EventType.PLAYER_ACTIVATE, this.activePlayer));
            else
                this.nextPlayer();

        }

        private nextPlayer() {
            this.prepareNextPlayer();
            this.activatePlayer();
        }

        next() {
            this.actions = 0;
            if (this.activeKeeper) {
                if (this.nextMonster()) {
                    this.activeKeeper = false;
                    this.activatePlayer();
                }
            } else {
                if (this.prepareNextPlayer() && Object.keys(this.proc.monsters).length > 0) {
                    // začíná hrát keeper
                    this.activeKeeper = true;
                    this.activeMonster = undefined;
                    this.nextMonster();
                } else {
                    this.activatePlayer();
                }
            }
        }
    }
}