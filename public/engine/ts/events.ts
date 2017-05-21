namespace Catacombs {

    export enum EventType {
        PLAYER_MOVE,
        MONSTER_MOVE,
        ROOM_DISCOVERED,
        INV_UPDATE,
        ROOM_ITEM_OBTAINED,
        PLAYER_ACTIVATE,
        KEEPER_ACTIVATE
    }

    abstract class EventPayload {
        constructor(public type: EventType) { }
    }

    export class SimpleEventPayload extends EventPayload {
        constructor(type: EventType) { super(type); }
    }

    export class StringEventPayload extends EventPayload {
        constructor(type: EventType, public payload: string) { super(type); }
    }

    export class NumberEventPayload extends EventPayload {
        constructor(type: EventType, public payload: number) { super(type); }
    }

    export class TupleEventPayload extends EventPayload {
        constructor(type: EventType, public x: number, public y: number) { super(type); }
    }

    export class PlayerMovePayload extends EventPayload {
        constructor(public playerId: number, public fromX: number, public fromY: number, public toX: number, public toY: number) { super(EventType.PLAYER_MOVE); }
    }

    export class MonsterMovePayload extends EventPayload {
        constructor(public monsterId: number, public fromX: number, public fromY: number, public toX: number, public toY: number) { super(EventType.MONSTER_MOVE); }
    }

    export class RoomItemObtainedPayload extends EventPayload {
        constructor(public room: Room, public item: TreasureDef, public playerId: number) { super(EventType.ROOM_ITEM_OBTAINED); }
    }

    export class EventBus {

        private static INSTANCE: EventBus;

        consumers: { [key: number]: Array<(payload: EventPayload) => boolean> } = {};

        public static getInstance() {
            if (!EventBus.INSTANCE) {
                EventBus.INSTANCE = new EventBus();
            }
            return EventBus.INSTANCE;
        }

        private constructor() { }

        public clear() {
            this.consumers = {};
        }

        public fireEvent(argument: EventPayload) {
            let array = this.consumers[argument.type];
            if (array) {
                for (let consumer of array) {
                    if (consumer) {
                        let consumed: boolean = consumer(argument);
                        if (consumed)
                            break;
                    }
                }
            }
        }

        public unregisterConsumer(type: EventType, callback: (payload: EventPayload) => boolean) {
            let array = this.consumers[type];
            for (let i = 0; i < array.length; i++) {
                if (array[i] == callback) {
                    array[i] = undefined;
                }
            }
        }

        public registerConsumer(type: EventType, callback: (payload: EventPayload) => boolean) {
            let array = this.consumers[type];
            if (!array) {
                array = new Array<(payload: EventPayload) => boolean>();
                this.consumers[type.toString()] = array;
            }
            array.push(callback);
        }

    }

}