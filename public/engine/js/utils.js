var Catacombs;
(function (Catacombs) {
    var Key = /** @class */ (function () {
        function Key() {
        }
        return Key;
    }());
    var Keyboard = /** @class */ (function () {
        function Keyboard() {
        }
        ;
        Keyboard.on = function (keyCode, onPress, onRelease) {
            var key = new Key;
            key.code = keyCode;
            key.isDown = false;
            key.isUp = true;
            //The `downHandler`
            var downHandler = function (event) {
                if (event.keyCode === key.code) {
                    if (key.isUp && onPress)
                        onPress();
                    key.isDown = true;
                    key.isUp = false;
                }
                event.preventDefault();
            };
            //The `upHandler`
            var upHandler = function (event) {
                if (event.keyCode === key.code) {
                    if (key.isDown && onRelease)
                        onRelease();
                    key.isDown = false;
                    key.isUp = true;
                }
                event.preventDefault();
            };
            //Attach event listeners
            window.addEventListener("keydown", downHandler.bind(key), false);
            window.addEventListener("keyup", upHandler.bind(key), false);
            return key;
        };
        return Keyboard;
    }());
    Catacombs.Keyboard = Keyboard;
    var Utils = /** @class */ (function () {
        function Utils() {
        }
        /**
          * Shift circular left
         */
        Utils.scl = function (n) {
            var overflow = (8 & n) >> 3;
            return n << 1 | overflow;
        };
        /**
         * Shift circular right
         */
        Utils.scr = function (n) {
            var overflow = (1 & n) << 3;
            return n >> 1 | overflow;
        };
        return Utils;
    }());
    Catacombs.Utils = Utils;
    var Array2D = /** @class */ (function () {
        function Array2D(width, height) {
            if (width === void 0) { width = 0; }
            if (height === void 0) { height = 0; }
            this.width = width;
            this.height = height;
            this.array = new Array();
        }
        Array2D.prototype.getPlainArray = function () {
            return this.array;
        };
        Array2D.prototype.forEach = function (fn) {
            this.array.forEach(function (subarray) {
                subarray.forEach(fn);
            });
        };
        Array2D.prototype.getValue = function (x, y) {
            var row = this.array[y];
            if (typeof row === "undefined" || row[x] == null) {
                return null;
            }
            else {
                return row[x];
            }
        };
        Array2D.prototype.setValue = function (x, y, val) {
            if (x < 0 || (x >= this.width && this.width != 0))
                return false;
            if (y < 0 || (y >= this.height && this.height != 0))
                return false;
            var row = this.array[y];
            if (typeof row === "undefined") {
                row = [];
                this.array[y] = row;
            }
            row[x] = val;
            return true;
        };
        return Array2D;
    }());
    Catacombs.Array2D = Array2D;
})(Catacombs || (Catacombs = {}));
