namespace Catacombs {

    class Key {
        public code: number;
        public isDown: boolean;
        public isUp: boolean;
    }

    export class Keyboard {

        private constructor() { };

        static on(keyCode: number, onPress: Function, onRelease?: Function) {
            var key = new Key;
            key.code = keyCode;
            key.isDown = false;
            key.isUp = true;

            //The `downHandler`
            let downHandler = function (event) {
                if (event.keyCode === key.code) {
                    if (key.isUp && onPress) onPress();
                    key.isDown = true;
                    key.isUp = false;
                }
                event.preventDefault();
            };

            //The `upHandler`
            let upHandler = function (event) {
                if (event.keyCode === key.code) {
                    if (key.isDown && onRelease) onRelease();
                    key.isDown = false;
                    key.isUp = true;
                }
                event.preventDefault();
            };

            //Attach event listeners
            window.addEventListener(
                "keydown", downHandler.bind(key), false
            );
            window.addEventListener(
                "keyup", upHandler.bind(key), false
            );
            return key;
        }
    }

    export class Utils {

        /**
          * Shift circular left
         */
        public static scl(n: number): number {
            let overflow = (0b1000 & n) >> 3;
            return n << 1 | overflow;
        }

        /**
         * Shift circular right
         */
        public static scr(n: number): number {
            let overflow = (0b0001 & n) << 3;
            return n >> 1 | overflow;
        }
    }

    export class Array2D<T> {

        private array = new Array<Array<T>>();

        public getPlainArray() {
            return this.array;
        }

        constructor(public width = 0, public height = 0) {
        }

        getValue(x: number, y: number): T {
            var row = this.array[y];
            if (typeof row === "undefined" || row[x] == null) {
                return null;
            }
            else {
                return row[x];
            }
        }

        setValue(x: number, y: number, val: T): boolean {
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
        }
    }
}