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

        private renderer: PIXI.WebGLRenderer;
        private stage: PIXI.Container;
        private gfx: Gfx;
        private proc: Proc;
        private controls: Controls;

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

            // Processing layer
            self.proc = new Proc();

            // Controls
            self.controls = new Controls(self.proc);

            // GFX layer 
            self.gfx = new Gfx(self.stage, self.controls, self.proc);

            EventBus.getInstance().fireEvent(new NumberEventPayload(EventType.PLAYER_ACTIVATE, 0));
            EventBus.getInstance().fireEvent(new StringEventPayload(EventType.LOG, "hra začala"));

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
