namespace Catacombs {

    export class Player {
        private static playersCount = 0;
        public static create(map: Map): Player {
            if (Player.playersCount > 4)
                return null;
            Player.playersCount++;
            return new Player(new PIXI.Sprite(PIXI.Texture.fromImage('images/player' + Player.playersCount + '.png')), map);
        }

        public health: number;
        public inventory = new Array<string>();
        public mapx: number;
        public mapy: number;

        private constructor(public token: PIXI.Sprite, private map: Map) { }

        move(sideFrom: number, sideTo: number) {
            // můžu se posunout tímto směrem z aktuální místnosti?
            let room = this.map.rooms.getValue(this.mapx, this.mapy);
            if (!(sideFrom & room.rotatedExits)) {
                return;
            }

            // můžu se posunout tímto směrem do další místnosti (pokud je objevená)?
            let tmapx = this.mapx;
            let tmapy = this.mapy;
            switch (sideTo) {
                // přicházím zleva
                case 0b0001: tmapx = this.mapx + 1; break;
                // přicházím zprava
                case 0b0100: tmapx = this.mapx - 1; break;
                // přicházím shora
                case 0b1000: tmapy = this.mapy + 1; break;
                // přicházím zdola
                case 0b0010: tmapy = this.mapy - 1; break;
            }
            if (tmapx < 0 || tmapx >= this.map.sideSize || tmapy < 0 || tmapy >= this.map.sideSize)
                return;
            room = this.map.rooms.getValue(tmapx, tmapy);
            if (!room) {
                room = this.map.revealMapPiece(tmapx, tmapy, sideTo);
                this.map.mapCont.addChild(room.sprite);
                room.sprite.x = Game.ROOM_IMG_SIZE * (tmapx + 0.5);
                room.sprite.y = Game.ROOM_IMG_SIZE * (tmapy + 0.5);
            } else {
                if (!(sideTo & room.rotatedExits)) {
                    return;
                }
            }
            this.token.x += (tmapx - this.mapx) * Game.ROOM_IMG_SIZE;
            this.token.y += (tmapy - this.mapy) * Game.ROOM_IMG_SIZE;
            this.mapx = tmapx;
            this.mapy = tmapy;
        }

        up() { this.move(0b1000, 0b0010); }
        down() { this.move(0b0010, 0b1000); }
        left() { this.move(0b0001, 0b0100); }
        right() { this.move(0b0100, 0b0001); }
    }

}