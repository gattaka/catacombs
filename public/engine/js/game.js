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
        function MapSprite(tex, type, exits) {
            var _this = _super.call(this, tex) || this;
            _this.type = type;
            _this.exits = exits;
            return _this;
        }
        return MapSprite;
    }(PIXI.Sprite));
    var PlayerSprite = (function (_super) {
        __extends(PlayerSprite, _super);
        function PlayerSprite(tex) {
            return _super.call(this, tex) || this;
        }
        return PlayerSprite;
    }(PIXI.Sprite));
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
            var mapPieceSize = 100;
            var tokenSize = 30;
            var map = new Catacombs.Array2D();
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
                mapTextures.push(PIXI.Texture.fromImage('images/map' + i + '.png', false));
            // poklady
            var treasuresCount = [15, 10, 5, 2];
            var treasuresTextures = [];
            var treasureToken = PIXI.Texture.fromImage('images/gold_token.png', false);
            for (var i = 1; i <= 4; i++)
                treasuresTextures.push(PIXI.Texture.fromImage('images/gold' + i + '.png', false));
            // hráči
            var playerTextures = [];
            for (var i = 1; i <= 4; i++)
                playerTextures.push(PIXI.Texture.fromImage('images/player' + i + '.png', false));
            // netvoři
            var monsterCount = [5, 3, 2, 1, 1];
            var monsterDefense = [0, 1, 2, 3, 4];
            var monsterAttack = [1, 1, 2, 3, 4];
            var monsterTextures = [];
            var monsterDescTextures = [];
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
            var itemsCount = [1, 1, 1, 1, 1, 1, 1, 1];
            var itemsTextures = [];
            itemsTextures.push(PIXI.Texture.fromImage('images/key.png', false));
            itemsTextures.push(PIXI.Texture.fromImage('images/pickaxe.png', false));
            itemsTextures.push(PIXI.Texture.fromImage('images/sword.png', false));
            itemsTextures.push(PIXI.Texture.fromImage('images/lantern.png', false));
            itemsTextures.push(PIXI.Texture.fromImage('images/crossbow.png', false));
            itemsTextures.push(PIXI.Texture.fromImage('images/armor.png', false));
            itemsTextures.push(PIXI.Texture.fromImage('images/shield.png', false));
            itemsTextures.push(PIXI.Texture.fromImage('images/potion.png', false));
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
                        return new MapSprite(mapTextures[mapPieceIndex], mapPieceIndex, mapPiecesExits[mapPieceIndex]);
                    }
                    else {
                        // nemám už tenhle dílek, zkus jiný druh
                        mapPieceIndex = (mapPieceIndex + 1) % mapPiecesCount.length;
                    }
                }
            };
            var revealMapPiece = function (posx, posy, x, y, direction) {
                // pokud je direction =0 pak jde o startovací dílek, ten by měl být vždy stejný rozcestník '+'
                var piece = randomMapPiece(!direction);
                if (piece == null)
                    return;
                mapCont.addChild(piece);
                piece.x = x + mapPieceSize / 2;
                piece.y = y + mapPieceSize / 2;
                var exits = mapPiecesExits[piece.type];
                var rotation = 0;
                if (direction) {
                    for (var i = 0; i < 4; i++) {
                        if (direction & exits)
                            break;
                        rotation += Math.PI / 2;
                        exits = Catacombs.Utils.scr(exits);
                    }
                }
                piece.anchor.set(0.5);
                piece.rotation = rotation;
                piece.exits = exits;
                map.setValue(posx, posy, piece);
            };
            var mapCont = new PIXI.Container();
            mapCont.fixedWidth = mapPieceSize * mapSide;
            mapCont.fixedHeight = mapPieceSize * mapSide;
            self.stage.addChild(mapCont);
            var gridSize = mapPiecesLeft;
            for (var i = 0; i < gridSize; i++) {
                var posx = (i % mapSide);
                var posy = Math.floor(i / mapSide);
                var x = posx * mapPieceSize;
                var y = posy * mapPieceSize;
                if (posx == Math.floor(mapSide / 2) && posy == Math.floor(mapSide / 2)) {
                    revealMapPiece(posx, posy, x, y, 0);
                }
                else {
                    var shape = new PIXI.Graphics();
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
            var player = new PlayerSprite(playerTextures[0]);
            player.posx = Math.floor(mapSide / 2);
            player.posy = Math.floor(mapSide / 2);
            self.stage.addChild(player);
            player.x = self.stage.fixedWidth / 2 - tokenSize / 2;
            player.y = self.stage.fixedHeight / 2 - tokenSize / 2;
            var movePlayer = function (sideFrom, sideTo) {
                var posx = player.posx;
                var posy = player.posy;
                // můžu se posunout tímto směrem z aktuální místnosti?
                var mapPiece = map.getValue(posx, posy);
                if (!(sideFrom & mapPiece.exits)) {
                    return;
                }
                // můžu se posunout tímto směrem do další místnosti (pokud je objevená)?
                var tposx = posx;
                var tposy = posy;
                switch (sideTo) {
                    // přicházím zleva
                    case 1:
                        tposx = posx + 1;
                        break;
                    // přicházím zprava
                    case 4:
                        tposx = posx - 1;
                        break;
                    // přicházím shora
                    case 8:
                        tposy = posy + 1;
                        break;
                    // přicházím zdola
                    case 2:
                        tposy = posy - 1;
                        break;
                }
                if (tposx < 0 || tposx >= mapSide || tposy < 0 || tposy >= mapSide)
                    return;
                mapPiece = map.getValue(tposx, tposy);
                if (!mapPiece) {
                    revealMapPiece(tposx, tposy, tposx * mapPieceSize, tposy * mapPieceSize, sideTo);
                }
                else {
                    if (!(sideTo & mapPiece.exits)) {
                        return;
                    }
                }
                player.x += (tposx - player.posx) * mapPieceSize;
                player.y += (tposy - player.posy) * mapPieceSize;
                player.posx = tposx;
                player.posy = tposy;
            };
            var playerUp = function () { return movePlayer(8, 2); };
            var playerDown = function () { return movePlayer(2, 8); };
            var playerLeft = function () { return movePlayer(1, 4); };
            var playerRight = function () { return movePlayer(4, 1); };
            Catacombs.Keyboard.on(37, function () { playerLeft(); });
            Catacombs.Keyboard.on(65, function () { playerLeft(); });
            Catacombs.Keyboard.on(38, function () { playerUp(); });
            Catacombs.Keyboard.on(87, function () { playerUp(); });
            Catacombs.Keyboard.on(39, function () { playerRight(); });
            Catacombs.Keyboard.on(68, function () { playerRight(); });
            Catacombs.Keyboard.on(40, function () { playerDown(); });
            Catacombs.Keyboard.on(83, function () { playerDown(); });
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
