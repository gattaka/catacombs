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
        constructor(tex: PIXI.Texture, public type: number, public exits: number) {
            super(tex);
        }
    }

    class PlayerSprite extends PIXI.Sprite {
        public posx: number;
        public posy: number;
        constructor(tex: PIXI.Texture) {
            super(tex);
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

            let mapPieceSize = 100;
            let tokenSize = 30;
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
                mapTextures.push(PIXI.Texture.fromImage('images/map' + i + '.png', false));

            // poklady
            let treasuresCount = [15, 10, 5, 2];
            let treasuresTextures = [];
            let treasureToken = PIXI.Texture.fromImage('images/gold_token.png', false);
            for (let i = 1; i <= 4; i++)
                treasuresTextures.push(PIXI.Texture.fromImage('images/gold' + i + '.png', false));

            // hráči
            let playerTextures = [];
            for (let i = 1; i <= 4; i++)
                playerTextures.push(PIXI.Texture.fromImage('images/player' + i + '.png', false));

            // netvoři
            let monsterCount = [5, 3, 2, 1, 1];
            let monsterDefense = [0, 1, 2, 3, 4];
            let monsterAttack = [1, 1, 2, 3, 4];
            let monsterTextures = [];
            let monsterDescTextures = [];
            monsterDescTextures.push(PIXI.Texture.fromImage('images/zombie.png', false));
            monsterDescTextures.push(PIXI.Texture.fromImage('images/skeleton.png', false));
            monsterDescTextures.push(PIXI.Texture.fromImage('images/swamper.png', false));
            monsterDescTextures.push(PIXI.Texture.fromImage('images/troll.png', false));
            monsterDescTextures.push(PIXI.Texture.fromImage('images/minotaur.png', false));
            monsterTextures.push(PIXI.Texture.fromImage('images/zombie_token.png', false));
            monsterTextures.push(PIXI.Texture.fromImage('images/skeleton_token.png', false));
            monsterTextures.push(PIXI.Texture.fromImage('images/swamper_token.png', false));
            monsterTextures.push(PIXI.Texture.fromImage('images/troll_token.png', false));
            monsterTextures.push(PIXI.Texture.fromImage('images/minotaur_token.png', false));

            // vybavení
            let itemsCount = [1, 1, 1, 1, 1, 1, 1, 1];
            let itemsTextures = [];
            itemsTextures.push(PIXI.Texture.fromImage('images/key.png', false));
            itemsTextures.push(PIXI.Texture.fromImage('images/pickaxe.png', false));
            itemsTextures.push(PIXI.Texture.fromImage('images/sword.png', false));
            itemsTextures.push(PIXI.Texture.fromImage('images/lantern.png', false));
            itemsTextures.push(PIXI.Texture.fromImage('images/crossbow.png', false));
            itemsTextures.push(PIXI.Texture.fromImage('images/armor.png', false));
            itemsTextures.push(PIXI.Texture.fromImage('images/shield.png', false));
            itemsTextures.push(PIXI.Texture.fromImage('images/potion.png', false));

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
                        return new MapSprite(mapTextures[mapPieceIndex], mapPieceIndex, mapPiecesExits[mapPieceIndex]);
                    } else {
                        // nemám už tenhle dílek, zkus jiný druh
                        mapPieceIndex = (mapPieceIndex + 1) % mapPiecesCount.length;
                    }
                }
            }

            let revealMapPiece = (posx: number, posy: number, x: number, y: number, direction: number) => {
                // pokud je direction =0 pak jde o startovací dílek, ten by měl být vždy stejný rozcestník '+'
                let piece = randomMapPiece(!direction);
                if (piece == null)
                    return;
                mapCont.addChild(piece);
                piece.x = x + mapPieceSize / 2;
                piece.y = y + mapPieceSize / 2;
                let exits = mapPiecesExits[piece.type];
                let rotation = 0;
                if (direction) {
                    for (let i = 0; i < 4; i++) {
                        if (direction & exits)
                            break;
                        rotation += Math.PI / 2;
                        exits = Utils.scr(exits);
                    }
                }
                piece.anchor.set(0.5);
                piece.rotation = rotation;
                piece.exits = exits;
                map.setValue(posx, posy, piece);
            }

            let mapCont = new PIXI.Container();
            mapCont.fixedWidth = mapPieceSize * mapSide;
            mapCont.fixedHeight = mapPieceSize * mapSide;
            self.stage.addChild(mapCont);
            let gridSize = mapPiecesLeft;
            for (let i = 0; i < gridSize; i++) {
                let posx = (i % mapSide);
                let posy = Math.floor(i / mapSide);
                let x = posx * mapPieceSize;
                let y = posy * mapPieceSize;
                if (posx == Math.floor(mapSide / 2) && posy == Math.floor(mapSide / 2)) {
                    revealMapPiece(posx, posy, x, y, 0);
                } else {
                    let shape = new PIXI.Graphics();
                    shape.beginFill(0x222222);
                    shape.lineStyle(1, 0x000000);
                    shape.drawRect(1, 1, mapPieceSize - 2, mapPieceSize - 2);
                    mapCont.addChild(shape);
                    shape.x = x;
                    shape.y = y;
                }
            }
            mapCont.x = self.stage.fixedWidth / 2 - mapCont.fixedWidth / 2;
            mapCont.y = self.stage.fixedHeight / 2 - mapCont.fixedHeight / 2;

            let player = new PlayerSprite(playerTextures[0]);
            player.posx = Math.floor(mapSide / 2);
            player.posy = Math.floor(mapSide / 2);
            self.stage.addChild(player);
            player.x = self.stage.fixedWidth / 2 - tokenSize / 2;
            player.y = self.stage.fixedHeight / 2 - tokenSize / 2;

            let movePlayer = (sideFrom, sideTo) => {
                let posx = player.posx;
                let posy = player.posy;

                // můžu se posunout tímto směrem z aktuální místnosti?
                let mapPiece = map.getValue(posx, posy);
                if (!(sideFrom & mapPiece.exits)) {
                    return;
                }

                // můžu se posunout tímto směrem do další místnosti (pokud je objevená)?
                let tposx = posx;
                let tposy = posy;
                switch (sideTo) {
                    // přicházím zleva
                    case 0b0001: tposx = posx + 1; break;
                    // přicházím zprava
                    case 0b0100: tposx = posx - 1; break;
                    // přicházím shora
                    case 0b1000: tposy = posy + 1; break;
                    // přicházím zdola
                    case 0b0010: tposy = posy - 1; break;
                }
                if (tposx < 0 || tposx >= mapSide || tposy < 0 || tposy >= mapSide)
                    return;
                mapPiece = map.getValue(tposx, tposy);
                if (!mapPiece) {
                    revealMapPiece(tposx, tposy, tposx * mapPieceSize, tposy * mapPieceSize, sideTo);
                } else {
                    if (!(sideTo & mapPiece.exits)) {
                        return;
                    }
                }
                player.x += (tposx - player.posx) * mapPieceSize;
                player.y += (tposy - player.posy) * mapPieceSize;
                player.posx = tposx;
                player.posy = tposy;
            }

            let playerUp = () => movePlayer(0b1000, 0b0010);
            let playerDown = () => movePlayer(0b0010, 0b1000);
            let playerLeft = () => movePlayer(0b0001, 0b0100);
            let playerRight = () => movePlayer(0b0100, 0b0001);

            Keyboard.on(37, () => { playerLeft(); });
            Keyboard.on(65, () => { playerLeft(); });
            Keyboard.on(38, () => { playerUp(); });
            Keyboard.on(87, () => { playerUp(); });
            Keyboard.on(39, () => { playerRight(); });
            Keyboard.on(68, () => { playerRight(); });
            Keyboard.on(40, () => { playerDown(); });
            Keyboard.on(83, () => { playerDown(); });

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
