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

            let map = new Map(7);
            self.stage.addChild(map.mapCont);
            map.mapCont.x = self.stage.fixedWidth / 2 - map.mapCont.fixedWidth / 2;
            map.mapCont.y = self.stage.fixedHeight / 2 - map.mapCont.fixedHeight / 2;

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

            // rmenu
            let rmenu = createMenu();
            this.stage.addChild(rmenu);
            rmenu.x = this.stage.fixedWidth - 10 - rmenu.fixedWidth;
            rmenu.y = 10;

            let activeHgl = new PIXI.Graphics();
            activeHgl.beginFill(0xffff00);
            let radius = Game.TOKEN_IMG_SIZE / 2 + 2
            activeHgl.drawCircle(0, 0, radius);
            activeHgl.pivot.set(-radius, -radius);
            rmenu.addChild(activeHgl);

            let players = new Array<Player>();
            for (let i = 0; i < 4; i++) {
                let player = Player.create(map);
                self.stage.addChild(player.token);
                player.token.x = self.stage.fixedWidth / 2 - Game.TOKEN_IMG_SIZE / 2;
                player.token.y = self.stage.fixedHeight / 2 - Game.TOKEN_IMG_SIZE / 2;
                players.push(player);
                let playerMenuIcon = new PIXI.Sprite(player.token.texture);
                playerMenuIcon.interactive = true;
                playerMenuIcon.on("click", () => {
                    players.forEach((p) => p.active = false);
                    players[player.playerID].active = true;
                    activeHgl.y = playerMenuIcon.y - 2;
                });

                rmenu.addChild(playerMenuIcon);
                playerMenuIcon.x = 10;
                playerMenuIcon.y = 10 + player.playerID * (Game.TOKEN_IMG_SIZE + 20);

                if (i == 0) {
                    player.active = true;
                    activeHgl.x = playerMenuIcon.x - 2;
                    activeHgl.y = playerMenuIcon.y - 2;
                }

            }

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
