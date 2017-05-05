///<reference path='lib/pixi/pixi.js.d.ts'/>
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
    ;
    var MapSprite = (function (_super) {
        __extends(MapSprite, _super);
        function MapSprite(tex, type) {
            var _this = _super.call(this, tex) || this;
            _this.type = type;
            return _this;
        }
        return MapSprite;
    }(PIXI.Sprite));
    var Array2D = (function () {
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
    var Game = (function () {
        function Game() {
            var self = this;
            // stats
            var statsFPS = new Stats();
            statsFPS.showPanel(0);
            document.body.appendChild(statsFPS.dom);
            console.log("running");
            // Create the renderer
            // This Render works by automatically managing webGLBatchs. 
            // So no need for Sprite Batches or Sprite Clouds.
            self.renderer = new PIXI.WebGLRenderer(window.innerWidth, window.innerHeight, {
                antialias: false,
                roundPixels: false,
                autoResize: false
            });
            self.renderer.view.style.position = "absolute";
            self.renderer.view.style.display = "block";
            // Add the canvas to the HTML document
            document.body.appendChild(self.renderer.view);
            // Create a container object called the `stage`
            self.stage = new PIXI.Container();
            self.stage.fixedWidth = window.innerWidth;
            self.stage.fixedHeight = window.innerHeight;
            var unit = 20;
            var mapPieceSize = 394;
            var map = new Array2D();
            // pro začátek zkusíme od každého dílku 5 kusů
            // je 10 druhů, takže 50 dílků mapy sqrt(50) je 7 (^49)
            // to se hodí, protože by se udělala mřížka 7x7, ve které
            // by byl jeden středový dílek 48+1, při délce dílku 4 cm 
            // by hrací plocha byla přijatelných 28x28 cm
            var mapPiecesLeft = 49;
            var mapSide = 7;
            var mapPiecesCount = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
            // kde jsou na dílku východy, 1 = východ, bráno shora doprava, mříž se bere jako stěna
            var mapPiecesExits = [10, 10, 15, 11, 14, 10, 14, 7, 13, 5];
            var mapTextures = [];
            for (var i = 1; i <= 10; i++)
                mapTextures.push(PIXI.Texture.fromImage('images/map' + i + '.png'));
            var randomMapPiece = function (start) {
                if (mapPiecesLeft == 0)
                    return null;
                mapPiecesLeft--;
                var mapPieceIndex = start ? 2 : Math.floor(Math.random() * mapPiecesCount.length);
                // deset pokusů, pro každý druh dílku
                for (var i = 0; i < 10; i++) {
                    if (mapPiecesCount[mapPieceIndex] > 0) {
                        // ok, ještě dílky máme
                        mapPiecesCount[mapPieceIndex]--;
                        return new MapSprite(mapTextures[mapPieceIndex], mapPieceIndex);
                    }
                    else {
                        // nemám už tenhle dílek, zkus jiný druh
                        mapPieceIndex = (mapPieceIndex + 1) % mapPiecesCount.length;
                    }
                }
            };
            var placeMapPiece = function (x, y, mapx, mapy, direction) {
                // pokud je direction =0 pak jde o startovací dílek, ten by měl být vždy stejný rozcestník '+'
                var piece = randomMapPiece(!direction);
                if (piece == null)
                    return;
                mapCont.addChild(piece);
                piece.x = mapx + 2 * unit;
                piece.y = mapy + 2 * unit;
                piece.scale = new PIXI.Point(4 * unit / mapPieceSize, 4 * unit / mapPieceSize);
                var exits = mapPiecesExits[piece.type];
                var rotation = 0;
                if (direction) {
                    for (var i = 0; i < 4; i++) {
                        if (direction & exits)
                            break;
                        rotation -= Math.PI / 2;
                        exits = exits >> 1;
                        if (!exits)
                            exits = 8;
                    }
                }
                piece.anchor.set(0.5);
                piece.rotation = rotation;
                map.setValue(x, y, piece);
            };
            var mapCont = new PIXI.Container();
            mapCont.fixedWidth = 4 * unit * mapSide;
            mapCont.fixedHeight = 4 * unit * mapSide;
            self.stage.addChild(mapCont);
            var gridSize = mapPiecesLeft;
            var _loop_1 = function (i) {
                var x = (i % mapSide);
                var y = Math.floor(i / mapSide);
                var mapX = x * (unit * 4 + 1);
                var mapY = y * (unit * 4 + 1);
                if (x == Math.floor(mapSide / 2) && y == Math.floor(mapSide / 2)) {
                    placeMapPiece(x, y, mapX, mapY, 0);
                }
                else {
                    var shape_1 = new PIXI.Graphics();
                    shape_1.beginFill(0x222222);
                    shape_1.lineStyle(1, 0x000000);
                    var drawShape_1 = (function (i) {
                        var ii = i;
                        return function () {
                            shape_1.drawRect(0, 0, 4 * unit, 4 * unit);
                        };
                    })(i);
                    drawShape_1();
                    shape_1.interactive = true;
                    shape_1.on("mouseover", function () {
                        shape_1.lineStyle(1, 0xaa0000);
                        drawShape_1();
                    });
                    shape_1.on("mouseout", function () {
                        shape_1.lineStyle(1, 0x000000);
                        drawShape_1();
                    });
                    shape_1.on("click", function () {
                        var direcition = 0;
                        // přicházím zleva
                        if (map.getValue(x - 1, y))
                            direcition = 1;
                        // přicházím zprava
                        if (map.getValue(x + 1, y))
                            direcition = 4;
                        // přicházím shora
                        if (map.getValue(x, y - 1))
                            direcition = 8;
                        // přicházím zdola
                        if (map.getValue(x, y + 1))
                            direcition = 2;
                        if (direcition) {
                            placeMapPiece(x, y, shape_1.x, shape_1.y, direcition);
                            mapCont.removeChild(shape_1);
                        }
                    });
                    mapCont.addChild(shape_1);
                    shape_1.x = mapX;
                    shape_1.y = mapY;
                }
            };
            for (var i = 0; i < gridSize; i++) {
                _loop_1(i);
            }
            mapCont.x = self.stage.fixedWidth / 2 - mapCont.fixedWidth / 2;
            mapCont.y = self.stage.fixedHeight / 2 - mapCont.fixedHeight / 2;
            var ticker = PIXI.ticker.shared;
            ticker.add(function () {
                statsFPS.begin();
                // ticker.deltaTime je přepočtený dle speed, to není rozdíl 
                // snímků v ms, jako bylo v createjs
                var delta = ticker.elapsedMS;
                self.renderer.render(self.stage);
                statsFPS.end();
            });
        }
        Game.prototype.getSceneWidth = function () {
            return window.innerWidth; //this.renderer.view.width; 
        };
        Game.prototype.getSceneHeight = function () {
            return window.innerHeight; //this.renderer.view.height; 
        };
        Game.getInstance = function () {
            if (!Game.INSTANCE) {
                Game.INSTANCE = new Game();
            }
            return Game.INSTANCE;
        };
        ;
        return Game;
    }());
    Catacombs.Game = Game;
})(Catacombs || (Catacombs = {}));
