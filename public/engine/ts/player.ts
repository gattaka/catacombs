namespace Catacombs {

    class InventoryItem {
        constructor(
            public name: string,
            public amount = 1
        ) { }
    }

    export class Player extends Creature {
        private static playersCount = 0;
        public static create(map: Map): Player {
            if (Player.playersCount > 4)
                return null;
            let player = new Player(map, Player.playersCount);
            Player.playersCount++;
            return player;
        }

        public treasure: number;
        public inventory: { [name: string]: InventoryItem } = {};

        private constructor(map: Map, creatureId: number) {
            super(map, creatureId, map.center, map.center, true);
            this.health = 3;
            this.map.rooms.getValue(this.mapx, this.mapy).players[this.creatureId] = this;
        }

        innerMove(fromRoom: Room, toRoom: Room) {
            if (fromRoom)
                fromRoom.players[this.creatureId] = null;
            toRoom.players[this.creatureId] = this;
            EventBus.getInstance().fireEvent(new PlayerMovePayload(this.creatureId, toRoom.mapx, toRoom.mapy));
            let player = this;
            toRoom.items.splice(0, toRoom.items.length).forEach((i: Item) => {
                player.takeItem(i);
                EventBus.getInstance().fireEvent(new RoomItemObtainedPayload(toRoom, i.def, this.creatureId));
            });
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
        }

        useItem(key: string) {
            let item = this.inventory[key];
            item.amount--;
            EventBus.getInstance().fireEvent(new NumberEventPayload(EventType.INV_UPDATE, this.creatureId));
        }

    }

}