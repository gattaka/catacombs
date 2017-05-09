var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Catacombs;
(function (Catacombs) {
    var EventType;
    (function (EventType) {
        EventType[EventType["PLAYER_MOVE"] = 0] = "PLAYER_MOVE";
        EventType[EventType["MONSTER_MOVE"] = 1] = "MONSTER_MOVE";
        EventType[EventType["ROOM_DISCOVERED"] = 2] = "ROOM_DISCOVERED";
        EventType[EventType["ITEM_OBTAINED"] = 3] = "ITEM_OBTAINED";
        EventType[EventType["ITEM_USED"] = 4] = "ITEM_USED";
    })(EventType = Catacombs.EventType || (Catacombs.EventType = {}));
    var EventPayload = (function () {
        function EventPayload(type) {
            this.type = type;
        }
        return EventPayload;
    }());
    var SimpleEventPayload = (function (_super) {
        __extends(SimpleEventPayload, _super);
        function SimpleEventPayload(type) {
            return _super.call(this, type) || this;
        }
        return SimpleEventPayload;
    }(EventPayload));
    Catacombs.SimpleEventPayload = SimpleEventPayload;
    var StringEventPayload = (function (_super) {
        __extends(StringEventPayload, _super);
        function StringEventPayload(type, payload) {
            var _this = _super.call(this, type) || this;
            _this.payload = payload;
            return _this;
        }
        return StringEventPayload;
    }(EventPayload));
    Catacombs.StringEventPayload = StringEventPayload;
    var NumberEventPayload = (function (_super) {
        __extends(NumberEventPayload, _super);
        function NumberEventPayload(type, payload) {
            var _this = _super.call(this, type) || this;
            _this.payload = payload;
            return _this;
        }
        return NumberEventPayload;
    }(EventPayload));
    Catacombs.NumberEventPayload = NumberEventPayload;
    var TupleEventPayload = (function (_super) {
        __extends(TupleEventPayload, _super);
        function TupleEventPayload(type, x, y) {
            var _this = _super.call(this, type) || this;
            _this.x = x;
            _this.y = y;
            return _this;
        }
        return TupleEventPayload;
    }(EventPayload));
    Catacombs.TupleEventPayload = TupleEventPayload;
    var PlayerMovePayload = (function (_super) {
        __extends(PlayerMovePayload, _super);
        function PlayerMovePayload(player, x, y) {
            var _this = _super.call(this, EventType.PLAYER_MOVE) || this;
            _this.player = player;
            _this.x = x;
            _this.y = y;
            return _this;
        }
        return PlayerMovePayload;
    }(EventPayload));
    Catacombs.PlayerMovePayload = PlayerMovePayload;
    var MonsterMovePayload = (function (_super) {
        __extends(MonsterMovePayload, _super);
        function MonsterMovePayload(monster, x, y) {
            var _this = _super.call(this, EventType.PLAYER_MOVE) || this;
            _this.monster = monster;
            _this.x = x;
            _this.y = y;
            return _this;
        }
        return MonsterMovePayload;
    }(EventPayload));
    Catacombs.MonsterMovePayload = MonsterMovePayload;
    var EventBus = (function () {
        function EventBus() {
            this.consumers = {};
        }
        EventBus.getInstance = function () {
            if (!EventBus.INSTANCE) {
                EventBus.INSTANCE = new EventBus();
            }
            return EventBus.INSTANCE;
        };
        EventBus.prototype.clear = function () {
            this.consumers = {};
        };
        EventBus.prototype.fireEvent = function (argument) {
            var array = this.consumers[argument.type];
            if (array) {
                for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
                    var consumer = array_1[_i];
                    if (consumer) {
                        var consumed = consumer(argument);
                        if (consumed)
                            break;
                    }
                }
            }
        };
        EventBus.prototype.unregisterConsumer = function (type, callback) {
            var array = this.consumers[type];
            for (var i = 0; i < array.length; i++) {
                if (array[i] == callback) {
                    array[i] = undefined;
                }
            }
        };
        EventBus.prototype.registerConsumer = function (type, callback) {
            var array = this.consumers[type];
            if (!array) {
                array = new Array();
                this.consumers[type.toString()] = array;
            }
            array.push(callback);
        };
        return EventBus;
    }());
    Catacombs.EventBus = EventBus;
})(Catacombs || (Catacombs = {}));
