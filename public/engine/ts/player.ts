namespace Catacombs {

    class InventoryItem {
        constructor(
            public name: string,
            public amount = 1
        ) { }
    }

    export class Player {
        private static playersCount = 0;
        public static create(map: Map): Player {
            if (Player.playersCount > 4)
                return null;
            let player = new Player(map, Player.playersCount);
            Player.playersCount++;
            return player;
        }

        public health: number;
        public treasure: number;
        public inventory: { [name: string]: InventoryItem } = {};
        public mapx: number;
        public mapy: number;
        // je na tahu?
        public active = false;

        private constructor(private map: Map, public playerID: number) {
            this.mapx = map.center;
            this.mapy = map.center;
            this.map.rooms.getValue(this.mapx, this.mapy).players[this.playerID] = this;

            Keyboard.on(37, () => { this.left(); });
            Keyboard.on(65, () => { this.left(); });
            Keyboard.on(38, () => { this.up(); });
            Keyboard.on(87, () => { this.up(); });
            Keyboard.on(39, () => { this.right(); });
            Keyboard.on(68, () => { this.right(); });
            Keyboard.on(40, () => { this.down(); });
            Keyboard.on(83, () => { this.down(); });
        }

        takeItem(item: Item) {
            let invItem = this.inventory[item.def.name];
            if (invItem) {
                invItem.amount++;
            } else {
                let itemDef = item.def;
                invItem = new InventoryItem(item.def.name);
                this.inventory[item.def.name] = invItem;
            }
            EventBus.getInstance().fireEvent(new NumberEventPayload(EventType.INV_UPDATE, this.playerID));
        }

        useItem(key: string) {
            let item = this.inventory[key];
            item.amount--;
            EventBus.getInstance().fireEvent(new NumberEventPayload(EventType.INV_UPDATE, this.playerID));
        }

        move(sideFrom: number, sideTo: number) {
            if (!this.active)
                return;

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
            } else {
                if (!(sideTo & room.rotatedExits)) {
                    return;
                }
            }
            let oldRoom = this.map.rooms.getValue(this.mapx, this.mapy);
            if (oldRoom)
                oldRoom.players[this.playerID] = null;
            room.players[this.playerID] = this;
            EventBus.getInstance().fireEvent(new PlayerMovePayload(this.playerID, tmapx, tmapy));
            this.mapx = tmapx;
            this.mapy = tmapy;
            let player = this;
            room.items.splice(0, room.items.length).forEach((i: Item) => {
                player.takeItem(i);
            });
        }

        up() { this.move(0b1000, 0b0010); }
        down() { this.move(0b0010, 0b1000); }
        left() { this.move(0b0001, 0b0100); }
        right() { this.move(0b0100, 0b0001); }
    }

}