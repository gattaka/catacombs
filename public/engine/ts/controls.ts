namespace Catacombs {
    export class Controls {

        public activePlayer: number;
        public activeMonster: number;
        public activeKeeper = false;

        // kolik posunů jsem v tomto tahu udělal?
        moves = 0;

        constructor(private proc: Proc) {
            this.activePlayer = 0;
        }

        move(movement: Movement) {
            if (this.activeKeeper) {
                if (this.activeMonster && this.proc.monsters[this.activeMonster].move(movement)) {
                    // this.moves++;
                    // if (this.moves > 1)
                    this.next();
                }
            } else {
                if (this.proc.players[this.activePlayer].move(movement)) {
                    this.moves++;
                    if (this.moves > 1)
                        this.next();
                }
            }
        }

        next() {
            this.moves = 0;
            if (this.activeKeeper) {
                this.activeKeeper = false;
                this.activeMonster = undefined;
                // Vyzkoušej všechny hráče, pro případ, že by některý z nich byl mrtví
                for (let i = 0; i < this.proc.players.length; i++) {
                    if (this.proc.players[this.activePlayer].health > 0) {
                        EventBus.getInstance().fireEvent(new NumberEventPayload(EventType.PLAYER_ACTIVATE, this.activePlayer));
                        return;
                    } else {
                        this.activePlayer = (this.activePlayer + 1) % this.proc.players.length;
                    }
                }
                // všichni hráči jsou mrtví...
                EventBus.getInstance().fireEvent(new SimpleEventPayload(EventType.KEEPER_WON));
            } else {
                this.activePlayer = (this.activePlayer + 1) % this.proc.players.length;
                if (Monster.monstersCount > 0) {
                    this.activeKeeper = true;
                    EventBus.getInstance().fireEvent(new SimpleEventPayload(EventType.KEEPER_ACTIVATE));
                } else {
                    if (this.proc.players[this.activePlayer].health > 0) {
                        EventBus.getInstance().fireEvent(new NumberEventPayload(EventType.PLAYER_ACTIVATE, this.activePlayer));
                    } else {
                        this.next();
                        return;
                    }
                }
            }
        }
    }
}