namespace Catacombs {
    export class Controls {

        public activePlayer: number;
        public activeMonster: number;
        public activeKeeper = false;

        // kolik posunů jsem v tomto tahu udělal?
        moves = 0;

        constructor(private proc: Proc) {

            Keyboard.on(37, () => { this.left(); });
            Keyboard.on(65, () => { this.left(); });
            Keyboard.on(38, () => { this.up(); });
            Keyboard.on(87, () => { this.up(); });
            Keyboard.on(39, () => { this.right(); });
            Keyboard.on(68, () => { this.right(); });
            Keyboard.on(40, () => { this.down(); });
            Keyboard.on(83, () => { this.down(); });
            Keyboard.on(32, () => { this.next(); });

            this.activePlayer = 0;
        }

        move(sideFrom: number, sideTo: number) {
            if (this.activeKeeper) {
                if (this.activeMonster && this.proc.monsters[this.activeMonster].move(sideFrom, sideTo)) {
                    this.moves++;
                    if (this.moves > 1)
                        this.next();
                }
            } else {
                if (this.proc.players[this.activePlayer].move(sideFrom, sideTo)) {
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
                if (this.proc.players[this.activePlayer].health > 0) {
                    EventBus.getInstance().fireEvent(new NumberEventPayload(EventType.PLAYER_ACTIVATE, this.activePlayer));
                } else {
                    this.next();
                }
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
                    }
                }
            }
        }

        up() { this.move(0b1000, 0b0010); }
        down() { this.move(0b0010, 0b1000); }
        left() { this.move(0b0001, 0b0100); }
        right() { this.move(0b0100, 0b0001); }
    }
}