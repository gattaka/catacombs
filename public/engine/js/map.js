var Catacombs;
(function (Catacombs) {
    var Map = (function () {
        function Map(sideSize, proc) {
            this.sideSize = sideSize;
            this.proc = proc;
            this.rooms = new Catacombs.Array2D();
            this.center = Math.floor(this.sideSize / 2);
            var def = RoomDef.startRoom();
            var room = new Room(def, this.center, this.center, def.exits, 0);
            this.rooms.setValue(this.center, this.center, room);
        }
        Map.prototype.revealMapPiece = function (mapx, mapy, direction) {
            // pokud je direction =0 pak jde o startovací dílek, ten by měl být vždy stejný
            var roomDef = RoomDef.rndAvailableRoom();
            if (roomDef == null)
                return;
            var exits = roomDef.exits;
            var rotation = 0;
            for (var i = 0; i < 4; i++) {
                if (direction & exits)
                    break;
                rotation += Math.PI / 2;
                exits = Catacombs.Utils.scr(exits);
            }
            var room = new Room(roomDef, mapx, mapy, exits, rotation);
            // obsah místnosti
            var rnd = Math.floor(Math.random() * (Catacombs.MonsterDef.totalAvailableInstances + Catacombs.ItemDef.totalAvailableInstances));
            var limit = Catacombs.MonsterDef.totalAvailableInstances;
            if (rnd < limit) {
                var centerDist = Math.max(Math.abs(mapx - this.center), Math.abs(mapy - this.center));
                // snižuje tier dle blízkosti ke středu
                // jsem-li ve středu, mám centerDist=0, takže se od maxTier odečte nejvíc
                // jsem-li na okraji, mám centerDist=3, takže se od maxTier neodečte nic
                var monster = Catacombs.Monster.createRandom(Catacombs.MonsterDef.monsterDefs.length - (this.center - centerDist));
                room.monsters.push(monster);
                this.proc.monsters.push(monster);
            }
            else {
                limit += Catacombs.ItemDef.totalAvailableInstances;
                if (rnd < limit) {
                    var item = Catacombs.Item.createRandom();
                    room.items.push(item);
                    this.proc.items.push(item);
                }
            }
            this.rooms.setValue(mapx, mapy, room);
            Catacombs.EventBus.getInstance().fireEvent(new Catacombs.TupleEventPayload(Catacombs.EventType.ROOM_DISCOVERED, mapx, mapy));
            return room;
        };
        return Map;
    }());
    Catacombs.Map = Map;
    var Room = (function () {
        function Room(def, mapx, mapy, rotatedExits, rotation) {
            this.def = def;
            this.mapx = mapx;
            this.mapy = mapy;
            this.rotatedExits = rotatedExits;
            this.rotation = rotation;
            this.players = new Array();
            this.monsters = new Array();
            this.items = new Array();
            def.availableInstances--;
            RoomDef.totalAvailableInstances--;
        }
        return Room;
    }());
    Catacombs.Room = Room;
    var RoomDef = (function () {
        function RoomDef(tex, type, exits, availableInstances) {
            this.tex = tex;
            this.type = type;
            this.exits = exits;
            this.availableInstances = availableInstances;
        }
        RoomDef.startRoom = function () {
            return RoomDef.roomDefs[3];
        };
        RoomDef.rndAvailableRoom = function () {
            var roomType = Math.floor(Math.random() * RoomDef.roomDefs.length);
            // pro každý druh místnosti
            for (var i = 0; i < RoomDef.roomDefs.length; i++) {
                var roomDef = RoomDef.roomDefs[roomType];
                if (roomDef.availableInstances > 0) {
                    // ok, ještě dílky máme
                    return roomDef;
                }
                else {
                    // nemám už tenhle dílek, zkus jiný druh
                    roomType = (roomType + 1) % RoomDef.roomDefs.length;
                }
            }
        };
        RoomDef.register = function (type, exits, availableInstances) {
            RoomDef.roomDefs[type] = new RoomDef(PIXI.Texture.fromImage('images/map' + type + '.png'), type, exits, availableInstances);
            RoomDef.totalAvailableInstances += availableInstances;
        };
        return RoomDef;
    }());
    RoomDef.totalAvailableInstances = 0;
    RoomDef.roomDefs = new Array();
    Catacombs.RoomDef = RoomDef;
    // Místnosti
    // pro začátek zkusíme od každého dílku 5 kusů
    // je 10 druhů, takže 50 dílků mapy sqrt(50) je 7 (^49)
    // to se hodí, protože by se udělala mřížka 7x7, ve které
    // by byl jeden středový dílek 48+1, při délce dílku 4 cm 
    // by hrací plocha byla přijatelných 28x28 cm
    RoomDef.register(0, 5, 5);
    RoomDef.register(1, 10, 5);
    RoomDef.register(2, 10, 5);
    RoomDef.register(3, 15, 5);
    RoomDef.register(4, 11, 5);
    RoomDef.register(5, 14, 5);
    RoomDef.register(6, 10, 5);
    RoomDef.register(7, 14, 5);
    RoomDef.register(8, 7, 5);
    RoomDef.register(9, 13, 5);
})(Catacombs || (Catacombs = {}));
