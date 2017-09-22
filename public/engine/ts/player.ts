namespace Catacombs {

    class TreasureItem {
        constructor(
            public def: TreasureDef,
            public amount = 1
        ) { }
    }

    export class Player extends Creature {
        private static MAX_HEALTH = 4;

        private static playersCount = 0;
        public static create(map: Map): Player {
            if (Player.playersCount > 4)
                return undefined;
            let player = new Player(map, Player.playersCount);
            Player.playersCount++;
            return player;
        }

        public treasureSum = 0;
        public lockpick = false;
        public attack = 1;
        public defense = 0;
        public treasure: { [type: string]: TreasureItem } = {};
        public equipment: { [type: string]: EquipmentDef } = {};

        private constructor(map: Map, playerId: number) {
            super(map, playerId, map.center, map.center, true);
            this.health = Player.MAX_HEALTH;
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
            let itemDef = item.def;
            if (invItem) {
                invItem.amount++;
            } else {
                invItem = new TreasureItem(item.def);
                this.treasure[TreasureType[item.def.type]] = invItem;
            }
            this.treasureSum += itemDef.price;
        }

        useItem(type: EquipmentType) {
            let item = this.treasure[EquipmentType[type]];
            item.amount--;
            EventBus.getInstance().fireEvent(new NumberEventPayload(EventType.PLAYER_BAR_UPDATE, this.id));
        }


        buy(def: EquipmentDef): boolean {
            if (this.equipment[EquipmentType[def.type]]
                || def.type == EquipmentType.POTION && this.health == Player.MAX_HEALTH
                || def.availableInstances <= 0
                || this.treasureSum < def.price)
                return false;
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
            switch (def.type) {
                case EquipmentType.ARMOR:
                    this.defense++;
                    this.equipment[EquipmentType[def.type]] = def;
                    break;
                case EquipmentType.SHIELD:
                    this.defense++;
                    this.equipment[EquipmentType[def.type]] = def;
                    break;
                case EquipmentType.SWORD:
                    this.attack = 2;
                    this.equipment[EquipmentType[def.type]] = def;
                    break;
                case EquipmentType.CROSSBOW:
                    this.attack = 3;
                    this.equipment[EquipmentType[def.type]] = def;
                    break;
                case EquipmentType.POTION:
                    this.health++;
                    break;
                case EquipmentType.LOCKPICK:
                    this.lockpick = true;
                    break;
            }
            // nemám co s tou instancí dělat, potřebuju, aby se snížily počty karet
            Equipment.create(def);
            EventBus.getInstance().fireEvent(new NumberEventPayload(EventType.PLAYER_BAR_UPDATE, this.id));
            return true;
        }

    }

}