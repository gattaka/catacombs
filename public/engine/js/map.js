var Catacombs;
(function (Catacombs) {
    var Map = (function () {
        function Map(sideSize) {
            this.sideSize = sideSize;
            this.rooms = new Catacombs.Array2D();
            this.mapCont = new PIXI.Container();
            this.mapCont.fixedWidth = Catacombs.Game.ROOM_IMG_SIZE * this.sideSize;
            this.mapCont.fixedHeight = Catacombs.Game.ROOM_IMG_SIZE * this.sideSize;
            this.center = Math.floor(this.sideSize / 2);
            for (var mapy = 0; mapy < this.sideSize; mapy++) {
                for (var mapx = 0; mapx < this.sideSize; mapx++) {
                    var x = mapy * Catacombs.Game.ROOM_IMG_SIZE;
                    var y = mapx * Catacombs.Game.ROOM_IMG_SIZE;
                    if (mapx == this.center && mapy == this.center) {
                        var room = this.revealMapPiece(mapx, mapy, 0);
                    }
                    else {
                        var shape = new PIXI.Graphics();
                        shape.beginFill(0x222222);
                        shape.lineStyle(1, 0x000000);
                        shape.drawRect(1, 1, Catacombs.Game.ROOM_IMG_SIZE - 2, Catacombs.Game.ROOM_IMG_SIZE - 2);
                        this.mapCont.addChild(shape);
                        shape.x = x;
                        shape.y = y;
                    }
                }
            }
        }
        Map.prototype.revealMapPiece = function (mapx, mapy, direction) {
            // pokud je direction =0 pak jde o startovací dílek, ten by měl být vždy stejný
            var roomDef = direction ? RoomDef.rndAvailableRoom() : RoomDef.startRoom();
            if (roomDef == null)
                return;
            var room = new Room(roomDef, mapx, mapy);
            roomDef.availableInstances--;
            RoomDef.totalAvailableInstances--;
            var exits = roomDef.exits;
            var rotation = 0;
            if (direction) {
                for (var i = 0; i < 4; i++) {
                    if (direction & exits)
                        break;
                    rotation += Math.PI / 2;
                    exits = Catacombs.Utils.scr(exits);
                }
            }
            room.sprite.anchor.set(0.5);
            room.sprite.rotation = rotation;
            room.rotatedExits = exits;
            this.mapCont.addChild(room.sprite);
            room.sprite.x = Catacombs.Game.ROOM_IMG_SIZE * (mapx + 0.5);
            room.sprite.y = Catacombs.Game.ROOM_IMG_SIZE * (mapy + 0.5);
            this.rooms.setValue(mapx, mapy, room);
            if (!direction)
                return room;
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
                this.mapCont.addChild(monster.sprite);
                monster.sprite.x = Catacombs.Game.ROOM_IMG_SIZE * mapx + 10;
                monster.sprite.y = Catacombs.Game.ROOM_IMG_SIZE * mapy + 10;
            }
            else {
                limit += Catacombs.ItemDef.totalAvailableInstances;
                if (rnd < limit) {
                    var item = Catacombs.Item.createRandom();
                    room.items.push(item);
                    this.mapCont.addChild(item.sprite);
                    item.sprite.x = Catacombs.Game.ROOM_IMG_SIZE * (mapx + 1) - 10 - Catacombs.Game.TOKEN_IMG_SIZE;
                    item.sprite.y = Catacombs.Game.ROOM_IMG_SIZE * mapy + 10;
                }
            }
            return room;
        };
        return Map;
    }());
    Catacombs.Map = Map;
    var Room = (function () {
        function Room(def, mapx, mapy) {
            this.def = def;
            this.mapx = mapx;
            this.mapy = mapy;
            this.players = new Array();
            this.monsters = new Array();
            this.items = new Array();
            this.sprite = new PIXI.Sprite(def.tex);
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
