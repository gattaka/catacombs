///<reference path='lib/pixi/pixi.js.d.ts'/>
///<reference path='lib/tweenjs.d.ts'/>

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
        private static defaultWidth: number = 1920;
        private static defaultHeight: number = 1080;

        private renderer: PIXI.WebGLRenderer;
        private stage: PIXI.Container;
        private gfx: Gfx;
        private proc: Proc;

        public static getInstance() {
            if (!Game.INSTANCE) {
                new Game();
            }
            return Game.INSTANCE;
        }

        private constructor() {
            let self = this;
            Game.INSTANCE = self;

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

            let resize = () => {
                let ratio = Math.min(window.innerWidth / Game.defaultWidth, window.innerHeight / Game.defaultHeight);
                self.stage.scale.set(ratio, ratio);
                self.stage.x = window.innerWidth / 2 - self.stage.width / 2;
                self.stage.y = window.innerHeight / 2 - self.stage.height / 2;
            }
            window.addEventListener('resize', resize, false);

            // Processing layer
            self.proc = new Proc();

            // GFX layer 
            self.gfx = new Gfx(self.stage, self.proc);

            EventBus.getInstance().fireEvent(new NumberEventPayload(EventType.PLAYER_ACTIVATE, 0));
            EventBus.getInstance().fireEvent(new StringEventPayload(EventType.LOG, "hra začala"));

            resize();

            let ticker = PIXI.ticker.shared;
            ticker.add(() => {
                statsFPS.begin();
                // ticker.deltaTime je přepočtený dle speed, to není rozdíl 
                // snímků v ms, jako bylo v createjs
                let delta = ticker.elapsedMS;

                self.renderer.render(self.stage);
                statsFPS.end();
            });
        }

    }
}
