var Catacombs;
(function (Catacombs) {
    var Map = (function () {
        function Map(sideSize, proc) {
            this.sideSize = sideSize;
            this.proc = proc;
            this.rooms = new Catacombs.Array2D();
            this.noMonsterCases = 4;
            this.noTreasureCases = 0;
            this.center = Math.floor(this.sideSize / 2);
            var def = RoomDef.startRoom();
            var room = new Room(def, this.center, this.center, def.exits, 0);
            this.rooms.setValue(this.center, this.center, room);
        }
        Map.prototype.revealMapPiece = function (mapx, mapy, direction) {
            // pokud je direction =0 pak jde o startovací dílek, ten by měl být vždy stejný
            var roomDef = RoomDef.rndAvailableRoom();
            if (!roomDef)
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
            var rnd = Math.floor(Math.random() * (Catacombs.MonsterDef.totalAvailableInstances + Catacombs.TreasureDef.totalAvailableInstances));
            var limit = Catacombs.MonsterDef.totalAvailableInstances;
            if (Math.random() * (Catacombs.MonsterDef.totalAvailableInstances + this.noMonsterCases) > this.noMonsterCases) {
                var centerDist = Math.max(Math.abs(mapx - this.center), Math.abs(mapy - this.center));
                // snižuje tier dle blízkosti ke středu
                // jsem-li ve středu, mám centerDist=0, takže se od maxTier odečte nejvíc
                // jsem-li na okraji, mám centerDist=3, takže se od maxTier neodečte nic
                var monster = Catacombs.Monster.createRandom(this, Catacombs.MonsterDef.monsterDefs.length - (this.center - centerDist), mapx, mapy);
                if (monster) {
                    room.monsters[monster.id] = monster;
                    this.proc.monsters[monster.id] = monster;
                }
            }
            else {
                this.noMonsterCases--;
            }
            if (Math.random() * (Catacombs.TreasureDef.totalAvailableInstances + this.noTreasureCases) > this.noTreasureCases) {
                limit += Catacombs.TreasureDef.totalAvailableInstances;
                if (rnd < limit) {
                    var treasure = Catacombs.Treasure.createRandom(this, mapx, mapy);
                    room.treasure = treasure;
                    this.proc.treasures.push(treasure);
                }
            }
            else {
                this.noTreasureCases--;
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
            alert("Nepodařilo se získat náhodnou místnost - nejsou volné karty!");
            return null;
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
    // od každého dílku 8 kusů + 9 kusů od křižovatkového dílku
    // je 10 druhů, takže 70 + 11 = 81 dílků
    // takže je hrací pole 9x9 se středovým polem
    // při délce dílku 4 cm to je hrací plocha 36x36cm
    // je možné změnšit na 7x7 apod.
    RoomDef.register(0, 5, 8);
    RoomDef.register(1, 10, 8);
    RoomDef.register(2, 10, 8);
    RoomDef.register(3, 15, 9);
    RoomDef.register(4, 11, 8);
    RoomDef.register(5, 14, 8);
    RoomDef.register(6, 10, 8);
    RoomDef.register(7, 14, 8);
    RoomDef.register(8, 7, 8);
    RoomDef.register(9, 13, 8);
})(Catacombs || (Catacombs = {}));
