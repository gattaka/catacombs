namespace Catacombs {

    export class Map {

        public rooms = new Array2D<Room>();
        public center: number;

        public noMonsterCases = 4;
        public noTreasureCases = 0;

        constructor(public sideSize: number, private proc: Proc) {
            this.center = Math.floor(this.sideSize / 2);
            let def = RoomDef.startRoom();
            let room = new Room(def, this.center, this.center, def.exits, 0);
            this.rooms.setValue(this.center, this.center, room);
        }

        public revealMapPiece(mapx: number, mapy: number, direction: number): Room {
            // pokud je direction =0 pak jde o startovací dílek, ten by měl být vždy stejný
            let roomDef = RoomDef.rndAvailableRoom();
            if (!roomDef)
                return;
            let exits = roomDef.exits;
            let rotation = 0;
            for (let i = 0; i < 4; i++) {
                if (direction & exits)
                    break;
                rotation += Math.PI / 2;
                exits = Utils.scr(exits);
            }
            let room = new Room(roomDef, mapx, mapy, exits, rotation);

            if (Math.random() * (MonsterDef.totalAvailableInstances + this.noMonsterCases) > this.noMonsterCases) {
                let centerDist = Math.max(Math.abs(mapx - this.center), Math.abs(mapy - this.center));
                // snižuje tier dle blízkosti ke středu
                // jsem-li ve středu, mám centerDist=0, takže se od maxTier odečte nejvíc
                // jsem-li na okraji, mám centerDist=3, takže se od maxTier neodečte nic
                let monster = Monster.createRandom(this, MonsterDef.monsterDefs.length - (this.center - centerDist), mapx, mapy);
                if (monster) {
                    room.monsters[monster.id] = monster;
                    this.proc.monsters[monster.id] = monster;
                }
            } else {
                this.noMonsterCases--;
            }

            if (Math.random() * (TreasureDef.totalAvailableInstances + this.noTreasureCases) > this.noTreasureCases) {
                let treasure = Treasure.createRandom(this, mapx, mapy);
                room.treasure = treasure;
            } else {
                this.noTreasureCases--;
            }

            this.rooms.setValue(mapx, mapy, room);
            EventBus.getInstance().fireEvent(new TupleEventPayload(EventType.ROOM_REVEALED, mapx, mapy));

            return room;
        }

        public canTravel(movement: Movement, ignoreBars: boolean, canReveal: boolean): boolean {
            let fromRoom = this.proc.map.rooms.getValue(movement.fromX, movement.fromY);

            // je možné tímto směrem odejít z počáteční místnosti?
            if (!(movement.sideFrom & fromRoom.rotatedExits)) {
                return false;
            }
            // je cílová místnost v mezích mapy?
            if (movement.toX < 0 || movement.toX >= this.proc.map.sideSize || movement.toY < 0 || movement.toY >= this.proc.map.sideSize)
                return false;
            // existuje cílová místnost?
            let toRoom = this.proc.map.rooms.getValue(movement.toX, movement.toY);
            if (toRoom) {
                // je možné tímto směrem vejít do cílové místnosti?
                if (!(movement.sideTo & toRoom.rotatedExits)) {
                    return false;
                } else
                    return true;
            } else {
                // ok, neexistuje, tak tam lze cestovat... pokud je to povolené
                return canReveal;
            }
        }
    }

    export class Room {
        public players = new Array<Player>();
        public monsters = new Array<Monster>();
        public treasure: Treasure;
        constructor(public def: RoomDef, public mapx: number, public mapy: number, public rotatedExits: number, public rotation: number) {
            def.availableInstances--;
            RoomDef.totalAvailableInstances--;
        }
    }

    export class Movement {
        constructor(
            public sideFrom: number,
            public sideTo: number,
            public fromX: number,
            public fromY: number,
            public toX: number,
            public toY: number
        ) { }
    }

    export class RoomDef {
        public static totalAvailableInstances = 0;
        public static roomDefs = new Array<RoomDef>();

        public static startRoom(): RoomDef {
            return RoomDef.roomDefs[3];
        }

        public static rndAvailableRoom(): RoomDef {
            let roomType = Math.floor(Math.random() * RoomDef.roomDefs.length);
            // pro každý druh místnosti
            for (let i = 0; i < RoomDef.roomDefs.length; i++) {
                let roomDef = RoomDef.roomDefs[roomType];
                if (roomDef.availableInstances > 0) {
                    // ok, ještě dílky máme
                    return roomDef;
                } else {
                    // nemám už tenhle dílek, zkus jiný druh
                    roomType = (roomType + 1) % RoomDef.roomDefs.length;
                }
            }
            alert("Nepodařilo se získat náhodnou místnost - nejsou volné karty!")
            return null;
        }

        public static register(type: number, exits: number, availableInstances: number) {
            RoomDef.roomDefs[type] = new RoomDef(PIXI.Texture.fromImage('images/map' + type + '.png'), type, exits, availableInstances);
            RoomDef.totalAvailableInstances += availableInstances;
        }

        private constructor(public tex: PIXI.Texture, public type: number, public exits: number, public availableInstances: number) { }
    }

    // Místnosti
    // od každého dílku 8 kusů + 9 kusů od křižovatkového dílku
    // je 10 druhů, takže 70 + 11 = 81 dílků
    // takže je hrací pole 9x9 se středovým polem
    // při délce dílku 4 cm to je hrací plocha 36x36cm
    // je možné změnšit na 7x7 apod.
    RoomDef.register(0, 0b0101, 8);
    RoomDef.register(1, 0b1010, 8);
    RoomDef.register(2, 0b1010, 8);
    RoomDef.register(3, 0b1111, 9);
    RoomDef.register(4, 0b1011, 8);
    RoomDef.register(5, 0b1110, 8);
    RoomDef.register(6, 0b1010, 8);
    RoomDef.register(7, 0b1110, 8);
    RoomDef.register(8, 0b0111, 8);
    RoomDef.register(9, 0b1101, 8);

}