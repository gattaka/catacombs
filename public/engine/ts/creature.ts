namespace Catacombs {

    export abstract class Creature extends MapItem {
        public health: number;
        protected abstract innerMove(fromRoom: Room, toRoom: Room);

        constructor(
            map: Map,
            creatureId: number,
            mapx: number,
            mapy: number,
            private canReveal: boolean
        ) {
            super(map, creatureId, mapx, mapy);
        }

        move(sideFrom: number, sideTo: number): boolean {
            // můžu se posunout tímto směrem z aktuální místnosti?
            let room = this.map.rooms.getValue(this.mapx, this.mapy);
            if (!(sideFrom & room.rotatedExits)) {
                return false;
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
                return false;
            room = this.map.rooms.getValue(tmapx, tmapy);
            if (!room) {
                if (this.canReveal) {
                    room = this.map.revealMapPiece(tmapx, tmapy, sideTo);
                } else {
                    return false;
                }
            } else {
                if (!(sideTo & room.rotatedExits)) {
                    return false;
                }
            }
            let oldRoom = this.map.rooms.getValue(this.mapx, this.mapy);
            this.innerMove(oldRoom, room);
            this.mapx = tmapx;
            this.mapy = tmapy;
            return true;
        }

    }

}