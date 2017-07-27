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
                return undefined;
            let player = new Player(map, Player.playersCount);
            Player.playersCount++;
            return player;
        }

        public treasure: number;
        public inventory: { [name: string]: InventoryItem } = {};

        private constructor(map: Map, playerId: number) {
            super(map, playerId, map.center, map.center, true);
            this.health = 3;
            this.map.rooms.getValue(this.mapx, this.mapy).players[this.id] = this;
        }

        public name(): string {
            switch (this.id) {
                case 0: return "zelený";
                case 1: return "červený";
                case 2: return "žlutý";
                case 3: return "modrý";
            }
        }

        innerMove(fromRoom: Room, toRoom: Room) {
            if (fromRoom)
                delete fromRoom.players[this.id];
            toRoom.players[this.id] = this;
            EventBus.getInstance().fireEvent(new PlayerMovePayload(this.id, fromRoom.mapx, fromRoom.mapy, toRoom.mapx, toRoom.mapy));
            let player = this;
            if (toRoom.treasure && toRoom.treasure.def.canPick) {
                player.takeItem(toRoom.treasure);
                EventBus.getInstance().fireEvent(new RoomItemObtainedPayload(toRoom, toRoom.treasure.def, this.id));
                EventBus.getInstance().fireEvent(new StringEventPayload(EventType.LOG, this.name() + " hráč získal " + toRoom.treasure.def.caption));
                delete toRoom.treasure;
            }
        }

        takeItem(item: Treasure) {
            let invItem = this.inventory[item.def.name];
            if (invItem) {
                invItem.amount++;
            } else {
                let itemDef = item.def;
                invItem = new InventoryItem(item.def.name);
                this.inventory[item.def.name] = invItem;
                this.treasure += itemDef.price;
            }
        }

        useItem(key: string) {
            let item = this.inventory[key];
            item.amount--;
            EventBus.getInstance().fireEvent(new NumberEventPayload(EventType.INV_UPDATE, this.id));
        }

        buy(def: EquipmentDef) {
            this.treasure -= def.price;
            let toPay = def.price;
            let item;
            // postupně projdi cennosti od nejdražších
            let types = ["amulet", "gems", "cup", "coin"];
            for (let i = 0; i < types.length; i++) {
                let t = types[i];
                item = this.inventory[t];
                // pokud hráč má v inventáři takovou cennost
                if (!item) {
                    let payPart;
                    // může tímto typem zaplatit celou částku?
                    if (item.def.price * item.amount >= toPay) {
                        // ano, splacená část je celá zbylá cena
                        payPart = toPay;
                    } else {
                        // ne, splacená část je všechno od této cenosti, co mám
                        payPart = item.def.price * item.amount;
                    }
                    // sniž množství cennosti, dle toho, kolik se utratilo
                    item.amount -= payPart / item.def.price;
                    if (item.amount == 0) {
                        delete this.inventory[t];
                    }
                    // sniž cenu, kterou ještě zbývá doplatit
                    toPay -= payPart;
                    if (toPay == 0)
                        break;
                }
            }
            this.inventory[def.name] = new InventoryItem(def.name, 1);
            // nemám co s tou instancí dělat, potřebuju, aby se snížily počty karet
            Equipment.create(def);
            EventBus.getInstance().fireEvent(new NumberEventPayload(EventType.INV_UPDATE, this.id));
        }

    }

}