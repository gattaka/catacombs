namespace Catacombs {
    export class Proc {

        public static PLAYERS_COUNT = 4;

        public map: Map;
        public players = new Array<Player>();
        public items = new Array<Item>();
        public monsters = new Array<Monster>();

        constructor() {

            // Mapa
            this.map = new Map(7, this);

            // Players
            this.players = new Array<Player>();
            for (let i = 0; i < Proc.PLAYERS_COUNT; i++) {
                let player = Player.create(this.map);
                this.players.push(player);
            }

        }
    }
}