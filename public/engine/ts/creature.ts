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

        move(movement: Movement): boolean {
            // kontroly, zda tohle jde jsou dělané na UI
            let oldRoom = this.map.rooms.getValue(movement.fromX, movement.fromY);
            let toRoom = this.map.rooms.getValue(movement.toX, movement.toY);
            if (!toRoom) {
                toRoom = this.map.revealMapPiece(movement.toX, movement.toY, movement.sideTo);
            }
            this.innerMove(oldRoom, toRoom);
            // posun, teď už jsem v cílové místnosti
            this.mapx = movement.toX;
            this.mapy = movement.toY;
            return true;
        }

    }

}