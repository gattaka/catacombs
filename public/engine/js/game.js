///<reference path='lib/pixi/pixi.js.d.ts'/>
var Catacombs;
(function (Catacombs) {
    ;
    var Game = (function () {
        function Game() {
            var _this = this;
            var self = this;
            // stats
            var statsFPS = new Stats();
            statsFPS.showPanel(0);
            // document.body.appendChild(statsFPS.dom);
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
            // poklady
            var treasuresCount = [15, 10, 5, 2];
            var treasuresTextures = [];
            var treasureToken = PIXI.Texture.fromImage('images/gold_token.png', false);
            for (var i = 1; i <= 4; i++)
                treasuresTextures.push(PIXI.Texture.fromImage('images/gold' + i + '.png', false));
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
            var map = new Catacombs.Map(7);
            self.stage.addChild(map.mapCont);
            map.mapCont.x = self.stage.fixedWidth / 2 - map.mapCont.fixedWidth / 2;
            map.mapCont.y = self.stage.fixedHeight / 2 - map.mapCont.fixedHeight / 2;
            var player = Catacombs.Player.create(map);
            player.mapx = Math.floor(map.sideSize / 2);
            player.mapy = Math.floor(map.sideSize / 2);
            self.stage.addChild(player.token);
            player.token.x = self.stage.fixedWidth / 2 - Game.TOKEN_IMG_SIZE / 2;
            player.token.y = self.stage.fixedHeight / 2 - Game.TOKEN_IMG_SIZE / 2;
            Catacombs.Keyboard.on(37, function () { player.left(); });
            Catacombs.Keyboard.on(65, function () { player.left(); });
            Catacombs.Keyboard.on(38, function () { player.up(); });
            Catacombs.Keyboard.on(87, function () { player.up(); });
            Catacombs.Keyboard.on(39, function () { player.right(); });
            Catacombs.Keyboard.on(68, function () { player.right(); });
            Catacombs.Keyboard.on(40, function () { player.down(); });
            Catacombs.Keyboard.on(83, function () { player.down(); });
            // Menu
            var createMenu = function () {
                var menu = new PIXI.Container();
                menu.fixedWidth = _this.stage.fixedWidth / 2 - 20 - map.mapCont.fixedWidth / 2;
                menu.fixedHeight = _this.stage.fixedHeight - 20;
                var shape = new PIXI.Graphics();
                shape.beginFill(0x222222);
                shape.lineStyle(1, 0x000000);
                shape.drawRect(1, 1, menu.fixedWidth, menu.fixedHeight);
                menu.addChild(shape);
                return menu;
            };
            // lmenu
            var lmenu = createMenu();
            this.stage.addChild(lmenu);
            lmenu.x = 10;
            lmenu.y = 10;
            // rmenu
            var rmenu = createMenu();
            this.stage.addChild(rmenu);
            rmenu.x = this.stage.fixedWidth - 10 - rmenu.fixedWidth;
            rmenu.y = 10;
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
        Game.getInstance = function () {
            if (!Game.INSTANCE) {
                Game.INSTANCE = new Game();
            }
            return Game.INSTANCE;
        };
        ;
        return Game;
    }());
    Game.ROOM_IMG_SIZE = 100;
    Game.TOKEN_IMG_SIZE = 30;
    Catacombs.Game = Game;
})(Catacombs || (Catacombs = {}));
