namespace Catacombs {

    export class Map {
        public rooms = new Array2D<Room>();
        public mapCont = new PIXI.Container();
        public center: number;
        constructor(public sideSize: number) {
            this.mapCont.fixedWidth = Game.ROOM_IMG_SIZE * this.sideSize;
            this.mapCont.fixedHeight = Game.ROOM_IMG_SIZE * this.sideSize;

            this.center = Math.floor(this.sideSize / 2);

            for (let mapy = 0; mapy < this.sideSize; mapy++) {
                for (let mapx = 0; mapx < this.sideSize; mapx++) {
                    let x = mapy * Game.ROOM_IMG_SIZE;
                    let y = mapx * Game.ROOM_IMG_SIZE;
                    if (mapx == this.center && mapy == this.center) {
                        let room = this.revealMapPiece(mapx, mapy, 0);
                    } else {
                        let shape = new PIXI.Graphics();
                        shape.beginFill(0x222222);
                        shape.lineStyle(1, 0x000000);
                        shape.drawRect(1, 1, Game.ROOM_IMG_SIZE - 2, Game.ROOM_IMG_SIZE - 2);
                        this.mapCont.addChild(shape);
                        shape.x = x;
                        shape.y = y;
                    }
                }
            }
        }

        public revealMapPiece(mapx: number, mapy: number, direction: number): Room {
            // pokud je direction =0 pak jde o startovací dílek, ten by měl být vždy stejný
            let roomDef = direction ? RoomDef.rndAvailableRoom() : RoomDef.startRoom();
            if (roomDef == null)
                return;
            let room = new Room(roomDef, mapx, mapy);
            roomDef.availableInstances--;
            RoomDef.totalAvailableInstances--;
            let exits = roomDef.exits;
            let rotation = 0;
            if (direction) {
                for (let i = 0; i < 4; i++) {
                    if (direction & exits)
                        break;
                    rotation += Math.PI / 2;
                    exits = Utils.scr(exits);
                }
            }
            room.sprite.anchor.set(0.5);
            room.sprite.rotation = rotation;
            room.rotatedExits = exits;
            this.mapCont.addChild(room.sprite);
            room.sprite.x = Game.ROOM_IMG_SIZE * (mapx + 0.5);
            room.sprite.y = Game.ROOM_IMG_SIZE * (mapy + 0.5)
            this.rooms.setValue(mapx, mapy, room);

            if (!direction)
                return room;

            // obsah místnosti
            let rnd = Math.floor(Math.random() * (MonsterDef.totalAvailableInstances + 10));
            let limit = MonsterDef.totalAvailableInstances;
            if (rnd < limit) {
                let centerDist = Math.max(Math.abs(mapx - this.center), Math.abs(mapy - this.center));
                // snižuje tier dle blízkosti ke středu
                // jsem-li ve středu, mám centerDist=0, takže se od maxTier odečte nejvíc
                // jsem-li na okraji, mám centerDist=3, takže se od maxTier neodečte nic
                let monster = Monster.createRandom(MonsterDef.monsterDefs.length - (this.center - centerDist));
                room.monsters.push(monster);
                this.mapCont.addChild(monster.sprite);
                monster.sprite.x = Game.ROOM_IMG_SIZE * (mapx + 0.25);
                monster.sprite.y = Game.ROOM_IMG_SIZE * (mapy + 0.25);
            } else {
                limit += 10;
                if (rnd < limit) {
                    // nic
                }
            }
            return room;
        }
    }

    export class Room {
        public sprite: PIXI.Sprite;
        public rotatedExits: number;
        public players = new Array<Player>();
        public monsters = new Array<Monster>();
        constructor(public def: RoomDef, public mapx: number, public mapy: number) {
            this.sprite = new PIXI.Sprite(def.tex);
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