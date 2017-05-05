///<reference path='lib/pixi/pixi.js.d.ts'/>

namespace Catacombs {

    declare class Stats {
        dom;
        constructor();
        showPanel(n: number);
        begin();
        end();
    };

    class MapSprite extends PIXI.Sprite {
        public mapx: number;
        public mapy: number;
        constructor(tex: PIXI.Texture, public type: number) {
            super(tex);
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

    export class Game {

        private static INSTANCE: Game;

        public renderer: PIXI.WebGLRenderer;
        private stage: PIXI.Container;

        public getSceneWidth(): number {
            return window.innerWidth; //this.renderer.view.width; 
        }
        public getSceneHeight(): number {
            return window.innerHeight; //this.renderer.view.height; 
        }

        public static getInstance() {
            if (!Game.INSTANCE) {
                Game.INSTANCE = new Game();
            }
            return Game.INSTANCE;
        }

        private constructor() {

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

            let unit = 20;
            let mapPieceSize = 394;
            let map = new Array2D<MapSprite>();

            // pro začátek zkusíme od každého dílku 5 kusů
            // je 10 druhů, takže 50 dílků mapy sqrt(50) je 7 (^49)
            // to se hodí, protože by se udělala mřížka 7x7, ve které
            // by byl jeden středový dílek 48+1, při délce dílku 4 cm 
            // by hrací plocha byla přijatelných 28x28 cm
            let mapPiecesLeft = 49;
            let mapSide = 7;
            let mapPiecesCount = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
            // kde jsou na dílku východy, 1 = východ, bráno shora doprava, mříž se bere jako stěna
            let mapPiecesExits = [0b1010, 0b1010, 0b1111, 0b1011, 0b1110, 0b1010, 0b1110, 0b0111, 0b1101, 0b0101];
            let mapTextures = [];
            for (let i = 1; i <= 10; i++)
                mapTextures.push(PIXI.Texture.fromImage('images/map' + i + '.png'));

            let randomMapPiece = (start: boolean): MapSprite => {
                if (mapPiecesLeft == 0)
                    return null;
                mapPiecesLeft--;
                let mapPieceIndex = start ? 2 : Math.floor(Math.random() * mapPiecesCount.length);
                // deset pokusů, pro každý druh dílku
                for (let i = 0; i < 10; i++) {
                    if (mapPiecesCount[mapPieceIndex] > 0) {
                        // ok, ještě dílky máme
                        mapPiecesCount[mapPieceIndex]--;
                        return new MapSprite(mapTextures[mapPieceIndex], mapPieceIndex);
                    } else {
                        // nemám už tenhle dílek, zkus jiný druh
                        mapPieceIndex = (mapPieceIndex + 1) % mapPiecesCount.length;
                    }
                }
            }

            let placeMapPiece = (x: number, y: number, mapx: number, mapy: number, direction: number) => {
                // pokud je direction =0 pak jde o startovací dílek, ten by měl být vždy stejný rozcestník '+'
                let piece = randomMapPiece(!direction);
                if (piece == null)
                    return;
                mapCont.addChild(piece);
                piece.x = mapx + 2 * unit;
                piece.y = mapy + 2 * unit;
                piece.scale = new PIXI.Point(4 * unit / mapPieceSize, 4 * unit / mapPieceSize);
                let exits = mapPiecesExits[piece.type];
                let rotation = 0;
                if (direction) {
                    for (let i = 0; i < 4; i++) {
                        if (direction & exits)
                            break;
                        rotation -= Math.PI / 2;
                        exits = exits >> 1;
                        if (!exits) exits = 0b1000;
                    }
                }
                piece.anchor.set(0.5);
                piece.rotation = rotation;
                map.setValue(x, y, piece);
            }

            let mapCont = new PIXI.Container();
            mapCont.fixedWidth = 4 * unit * mapSide;
            mapCont.fixedHeight = 4 * unit * mapSide;
            self.stage.addChild(mapCont);
            let gridSize = mapPiecesLeft;
            for (let i = 0; i < gridSize; i++) {
                let x = (i % mapSide);
                let y = Math.floor(i / mapSide);
                let mapX = x * (unit * 4 + 1);
                let mapY = y * (unit * 4 + 1);
                if (x == Math.floor(mapSide / 2) && y == Math.floor(mapSide / 2)) {
                    placeMapPiece(x, y, mapX, mapY, 0);
                } else {
                    let shape = new PIXI.Graphics();
                    shape.beginFill(0x222222);
                    shape.lineStyle(1, 0x000000);
                    let drawShape = ((i) => {
                        let ii = i;
                        return () => {
                            shape.drawRect(0, 0, 4 * unit, 4 * unit);
                        };
                    })(i);
                    drawShape();
                    shape.interactive = true;
                    shape.on("mouseover", () => {
                        shape.lineStyle(1, 0xaa0000);
                        drawShape();
                    });
                    shape.on("mouseout", () => {
                        shape.lineStyle(1, 0x000000);
                        drawShape();
                    });
                    shape.on("click", () => {
                        let direcition = 0;
                        // přicházím zleva
                        if (map.getValue(x - 1, y)) direcition = 0b0001;
                        // přicházím zprava
                        if (map.getValue(x + 1, y)) direcition = 0b0100;
                        // přicházím shora
                        if (map.getValue(x, y - 1)) direcition = 0b1000;
                        // přicházím zdola
                        if (map.getValue(x, y + 1)) direcition = 0b0010;
                        if (direcition) {
                            placeMapPiece(x, y, shape.x, shape.y, direcition);
                            mapCont.removeChild(shape);
                        }
                    })
                    mapCont.addChild(shape);
                    shape.x = mapX;
                    shape.y = mapY;
                }
            }
            mapCont.x = self.stage.fixedWidth / 2 - mapCont.fixedWidth / 2;
            mapCont.y = self.stage.fixedHeight / 2 - mapCont.fixedHeight / 2;

            let ticker = PIXI.ticker.shared;
            ticker.add(() => {
                statsFPS.begin();
                // ticker.deltaTime je přepočtený dle speed, to není rozdíl 
                // snímků v ms, jako bylo v createjs
                let delta = ticker.elapsedMS;

                self.renderer.render(self.stage);
                statsFPS.end();
            });
        };
    }
}
