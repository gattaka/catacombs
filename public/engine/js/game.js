///<reference path='lib/pixi/pixi.js.d.ts'/>
///<reference path='lib/tweenjs.d.ts'/>
var Catacombs;
(function (Catacombs) {
    ;
    var Game = (function () {
        function Game() {
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
            self.proc = new Catacombs.Proc();
            // Controls
            self.controls = new Catacombs.Controls(self.proc);
            // GFX layer 
            self.gfx = new Catacombs.Gfx(self.stage, self.controls, self.proc);
            Catacombs.EventBus.getInstance().fireEvent(new Catacombs.NumberEventPayload(Catacombs.EventType.PLAYER_ACTIVATE, 0));
            Catacombs.EventBus.getInstance().fireEvent(new Catacombs.StringEventPayload(Catacombs.EventType.LOG, "hra začala"));
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
        return Game;
    }());
    Catacombs.Game = Game;
})(Catacombs || (Catacombs = {}));
