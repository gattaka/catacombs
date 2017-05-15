namespace Catacombs {

    export class Map {

        public rooms = new Array2D<Room>();
        public center: number;

        constructor(public sideSize: number, private proc: Proc) {
            this.center = Math.floor(this.sideSize / 2);
            let def = RoomDef.startRoom();
            let room = new Room(def, this.center, this.center, def.exits, 0);
            this.rooms.setValue(this.center, this.center, room);
        }

        public revealMapPiece(mapx: number, mapy: number, direction: number): Room {
            // pokud je direction =0 pak jde o startovací dílek, ten by měl být vždy stejný
            let roomDef = RoomDef.rndAvailableRoom();
            if (roomDef == null)
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

            // obsah místnosti
            let rnd = Math.floor(Math.random() * (MonsterDef.totalAvailableInstances + ItemDef.totalAvailableInstances));
            let limit = MonsterDef.totalAvailableInstances;
            if (rnd < limit) {
                let centerDist = Math.max(Math.abs(mapx - this.center), Math.abs(mapy - this.center));
                // snižuje tier dle blízkosti ke středu
                // jsem-li ve středu, mám centerDist=0, takže se od maxTier odečte nejvíc
                // jsem-li na okraji, mám centerDist=3, takže se od maxTier neodečte nic
                let monster = Monster.createRandom(this, MonsterDef.monsterDefs.length - (this.center - centerDist), mapx, mapy);
                room.monsters[monster.creatureId] = monster;
                this.proc.monsters[monster.creatureId] = monster;
            } else {
                limit += ItemDef.totalAvailableInstances;
                if (rnd < limit) {
                    let item = Item.createRandom();
                    room.items.push(item);
                    this.proc.items.push(item);
                }
            }

            this.rooms.setValue(mapx, mapy, room);
            EventBus.getInstance().fireEvent(new TupleEventPayload(EventType.ROOM_DISCOVERED, mapx, mapy));

            return room;
        }
    }

    export class Room {
        public players = new Array<Player>();
        public monsters = new Array<Monster>();
        public items = new Array<Item>();
        constructor(public def: RoomDef, public mapx: number, public mapy: number, public rotatedExits: number, public rotation: number) {
            def.availableInstances--;
            RoomDef.totalAvailableInstances--;
        }
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
        }

        public static register(type: number, exits: number, availableInstances: number) {
            RoomDef.roomDefs[type] = new RoomDef(PIXI.Texture.fromImage('images/map' + type + '.png'), type, exits, availableInstances);
            RoomDef.totalAvailableInstances += availableInstances;
        }

        private constructor(public tex: PIXI.Texture, public type: number, public exits: number, public availableInstances: number) { }
    }

    // Místnosti
    // pro začátek zkusíme od každého dílku 5 kusů
    // je 10 druhů, takže 50 dílků mapy sqrt(50) je 7 (^49)
    // to se hodí, protože by se udělala mřížka 7x7, ve které
    // by byl jeden středový dílek 48+1, při délce dílku 4 cm 
    // by hrací plocha byla přijatelných 28x28 cm
    RoomDef.register(0, 0b0101, 5);
    RoomDef.register(1, 0b1010, 5);
    RoomDef.register(2, 0b1010, 5);
    RoomDef.register(3, 0b1111, 5);
    RoomDef.register(4, 0b1011, 5);
    RoomDef.register(5, 0b1110, 5);
    RoomDef.register(6, 0b1010, 5);
    RoomDef.register(7, 0b1110, 5);
    RoomDef.register(8, 0b0111, 5);
    RoomDef.register(9, 0b1101, 5);

}