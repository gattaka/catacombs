namespace Catacombs {
    export class Proc {

        public static PLAYERS_COUNT = 4;

        public map: Map;
        public players = new Array<Player>();
        public monsters = new Array<Monster>();

        constructor() {
            // Mapa
            this.map = new Map(9, this);

            // Players
            this.players = new Array<Player>();
            for (let i = 0; i < Proc.PLAYERS_COUNT; i++) {
                let player = Player.create(this.map);
                this.players[player.id] = player;
            }
        }

        public killMonster(monster: Monster) {
            delete this.map.rooms.getValue(monster.mapx, monster.mapy).monsters[monster.id];
            delete this.monsters[monster.id];
            Monster.monstersCount--;
        }
    }
}