namespace Catacombs {

    class TreasureItem {
        constructor(
            public def: TreasureDef,
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

        public treasureSum = 0;
        public attack = 1;
        public defense = 0;
        public treasure: { [type: string]: TreasureItem } = {};
        public equipment: { [type: string]: EquipmentDef } = {};

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
            let invItem = this.treasure[TreasureType[item.def.type]];
            if (invItem) {
                invItem.amount++;
            } else {
                let itemDef = item.def;
                invItem = new TreasureItem(item.def);
                this.treasure[TreasureType[item.def.type]] = invItem;
                this.treasureSum += itemDef.price;
            }
        }

        useItem(type: EquipmentType) {
            let item = this.treasure[EquipmentType[type]];
            item.amount--;
            EventBus.getInstance().fireEvent(new NumberEventPayload(EventType.INV_UPDATE, this.id));
        }

        buy(def: EquipmentDef) {
            this.treasureSum -= def.price;
            let toPay = def.price;
            let item;
            // postupně projdi cennosti od nejdražších
            let types = [TreasureType.AMULET, TreasureType.GEMS, TreasureType.CUP, TreasureType.COIN];
            for (let i = 0; i < types.length; i++) {
                let t = types[i];
                item = this.treasure[TreasureType[t]];
                // pokud hráč má v inventáři takovou cennost
                if (item) {
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
                        delete this.treasure[TreasureType[t]];
                    }
                    // sniž cenu, kterou ještě zbývá doplatit
                    toPay -= payPart;
                    if (toPay == 0)
                        break;
                }
            }
            this.equipment[EquipmentType[def.type]] = def;
            switch (def.type) {
                case EquipmentType.ARMOR:
                    this.defense++;
                    break;
                case EquipmentType.SHIELD:
                    this.defense++;
                    break;
                case EquipmentType.SWORD:
                    this.attack = 2;
                    break;
            }
            // nemám co s tou instancí dělat, potřebuju, aby se snížily počty karet
            Equipment.create(def);
            EventBus.getInstance().fireEvent(new NumberEventPayload(EventType.INV_UPDATE, this.id));
        }

    }

}