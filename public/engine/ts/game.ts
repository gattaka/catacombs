///<reference path='lib/pixi/pixi.js.d.ts'/>

namespace Catacombs {

    declare class Stats {
        dom;
        constructor();
        showPanel(n: number);
        begin();
        end();
    };

    export class Game {

        private static INSTANCE: Game;

        public static ROOM_IMG_SIZE = 100;
        public static TOKEN_IMG_SIZE = 30;

        public renderer: PIXI.WebGLRenderer;
        private stage: PIXI.Container;

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
            let treasuresCount = [15, 10, 5, 2];
            let treasuresTextures = [];
            let treasureToken = PIXI.Texture.fromImage('images/gold_token.png', false);
            for (let i = 1; i <= 4; i++)
                treasuresTextures.push(PIXI.Texture.fromImage('images/gold' + i + '.png', false));

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

            let map = new Map(7);
            self.stage.addChild(map.mapCont);
            map.mapCont.x = self.stage.fixedWidth / 2 - map.mapCont.fixedWidth / 2;
            map.mapCont.y = self.stage.fixedHeight / 2 - map.mapCont.fixedHeight / 2;

            let player = Player.create(map);
            player.mapx = Math.floor(map.sideSize / 2);
            player.mapy = Math.floor(map.sideSize / 2);
            self.stage.addChild(player.token);
            player.token.x = self.stage.fixedWidth / 2 - Game.TOKEN_IMG_SIZE / 2;
            player.token.y = self.stage.fixedHeight / 2 - Game.TOKEN_IMG_SIZE / 2;

            Keyboard.on(37, () => { player.left(); });
            Keyboard.on(65, () => { player.left(); });
            Keyboard.on(38, () => { player.up(); });
            Keyboard.on(87, () => { player.up(); });
            Keyboard.on(39, () => { player.right(); });
            Keyboard.on(68, () => { player.right(); });
            Keyboard.on(40, () => { player.down(); });
            Keyboard.on(83, () => { player.down(); });

            // Menu
            let createMenu = (): PIXI.Container => {
                let menu = new PIXI.Container();
                menu.fixedWidth = this.stage.fixedWidth / 2 - 20 - map.mapCont.fixedWidth / 2;
                menu.fixedHeight = this.stage.fixedHeight - 20;
                let shape = new PIXI.Graphics();
                shape.beginFill(0x222222);
                shape.lineStyle(1, 0x000000);
                shape.drawRect(1, 1, menu.fixedWidth, menu.fixedHeight);
                menu.addChild(shape);
                return menu;
            }

            // lmenu
            let lmenu = createMenu();
            this.stage.addChild(lmenu);
            lmenu.x = 10;
            lmenu.y = 10;

            MonsterDef.monsterDefs.forEach((v, i) => {
                let m = Monster.create(v);
                lmenu.addChild(m.token);
                m.token.x = i * (Game.TOKEN_IMG_SIZE + 5);
                m.token.y = 10;
            });

            // rmenu
            let rmenu = createMenu();
            this.stage.addChild(rmenu);
            rmenu.x = this.stage.fixedWidth - 10 - rmenu.fixedWidth;
            rmenu.y = 10;

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
