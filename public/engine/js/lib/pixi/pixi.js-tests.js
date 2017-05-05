/// <reference path="pixi.js.d.ts" />
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
var basics;
(function (basics) {
    var Basics = (function () {
        function Basics() {
            var _this = this;
            this.app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb });
            document.body.appendChild(this.app.view);
            this.bunny = PIXI.Sprite.fromImage("required/assets/basics/bunny.png");
            this.bunny.anchor.set(0.5);
            this.bunny.x = this.app.renderer.width / 2;
            this.bunny.y = this.app.renderer.height / 2;
            this.app.stage.addChild(this.bunny);
            this.app.ticker.add(function (delta) {
                _this.bunny.rotation += 0.1 / delta;
            });
        }
        return Basics;
    }());
    basics.Basics = Basics;
    var Click = (function () {
        function Click() {
            var _this = this;
            this.app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb });
            document.body.appendChild(this.app.view);
            this.sprite = PIXI.Sprite.fromImage("../../_assets/basics/bunny.png");
            this.sprite.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
            this.sprite.anchor.set(0.5);
            this.sprite.x = this.app.renderer.width / 2;
            this.sprite.y = this.app.renderer.height / 2;
            this.sprite.interactive = true;
            this.sprite.buttonMode = true;
            this.sprite.on("pointerdown", function () {
                _this.sprite.scale.x *= 1.25;
                _this.sprite.scale.y *= 1.25;
            });
            this.app.stage.addChild(this.sprite);
        }
        return Click;
    }());
    basics.Click = Click;
    var ContainerPivot = (function () {
        function ContainerPivot() {
            var _this = this;
            this.app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb });
            document.body.appendChild(this.app.view);
            this.container = new PIXI.Container();
            this.app.stage.addChild(this.container);
            var texture = PIXI.Texture.fromImage("../../_assets/basics/bunny.png");
            for (var i = 0; i < 25; i++) {
                var bunny = new PIXI.Sprite(texture);
                bunny.anchor.set(0.5);
                bunny.x = (i % 5) * 40;
                bunny.y = Math.floor(i / 5) * 40;
                this.container.addChild(bunny);
            }
            this.container.x = this.app.renderer.width / 2;
            this.container.y = this.app.renderer.height / 2;
            this.container.pivot.x = this.container.fixedWidth / 2;
            this.container.pivot.y = this.container.fixedHeight / 2;
            this.app.ticker.add(function (delta) {
                _this.container.rotation -= 0.01 / delta;
            });
        }
        return ContainerPivot;
    }());
    basics.ContainerPivot = ContainerPivot;
    var Container = (function () {
        function Container() {
            this.app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb });
            document.body.appendChild(this.app.view);
            this.container = new PIXI.Container();
            this.app.stage.addChild(this.container);
            var texture = PIXI.Texture.fromImage("../../_assets/basics/bunny.png");
            for (var i = 0; i < 25; i++) {
                var bunny = new PIXI.Sprite(texture);
                bunny.anchor.set(0.5);
                bunny.x = (i % 5) * 40;
                bunny.y = Math.floor(i / 5) * 40;
                this.container.addChild(bunny);
            }
            this.container.x = this.app.renderer.width / 2;
            this.container.y = this.app.renderer.height / 2;
        }
        return Container;
    }());
    basics.Container = Container;
    var CustomizedFilter = (function (_super) {
        __extends(CustomizedFilter, _super);
        function CustomizedFilter(fragmentSource) {
            return _super.call(this, null, fragmentSource, {
                customUniform: {
                    type: "1f",
                    value: 0
                }
            }) || this;
        }
        return CustomizedFilter;
    }(PIXI.Filter));
    basics.CustomizedFilter = CustomizedFilter;
    var CustomFilter = (function () {
        function CustomFilter() {
            var _this = this;
            this.app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb });
            document.body.appendChild(this.app.view);
            this.background = PIXI.Sprite.fromImage("required/assets/bkg-grass.jpg");
            this.background.fixedWidth = this.app.renderer.width;
            this.background.fixedHeight = this.app.renderer.height;
            this.app.stage.addChild(this.background);
            this.app.stop();
            PIXI.loader.add("shader", "_assets/basics/shader.frag")
                .load(function (loader, resource) {
                _this.filter = new PIXI.Filter(null, resource.shader.data);
                _this.background.filters = [_this.filter];
                _this.app.start();
                _this.app.ticker.add(function (delta) {
                    _this.filter.uniforms.customUniform += 0.04 / delta;
                });
            });
        }
        return CustomFilter;
    }());
    basics.CustomFilter = CustomFilter;
    var Graphics = (function () {
        function Graphics() {
            this.app = new PIXI.Application(800, 600, { antialias: true });
            document.body.appendChild(this.app.view);
            var graphics = new PIXI.Graphics();
            // set a fill and line style
            graphics.beginFill(0xFF3300);
            graphics.lineStyle(4, 0xffd900, 1);
            // draw a shape
            graphics.moveTo(50, 50);
            graphics.lineTo(250, 50);
            graphics.lineTo(100, 100);
            graphics.lineTo(50, 50);
            graphics.endFill();
            // set a fill and a line style again and draw a rectangle
            graphics.lineStyle(2, 0x0000FF, 1);
            graphics.beginFill(0xFF700B, 1);
            graphics.drawRect(50, 250, 120, 120);
            // draw a rounded rectangle
            graphics.lineStyle(2, 0xFF00FF, 1);
            graphics.beginFill(0xFF00BB, 0.25);
            graphics.drawRoundedRect(150, 450, 300, 100, 15);
            graphics.endFill();
            // draw a circle, set the lineStyle to zero so the circle doesn"t have an outline
            graphics.lineStyle(0);
            graphics.beginFill(0xFFFF0B, 0.5);
            graphics.drawCircle(470, 90, 60);
            graphics.endFill();
            this.graphics = graphics;
            this.app.stage.addChild(this.graphics);
        }
        return Graphics;
    }());
    basics.Graphics = Graphics;
    var RenderTexture = (function () {
        function RenderTexture() {
            var _this = this;
            this.app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb });
            document.body.appendChild(this.app.view);
            this.container = new PIXI.Container();
            this.app.stage.addChild(this.container);
            var texture = PIXI.Texture.fromImage("required/assets/basics/bunny.png");
            for (var i = 0; i < 25; i++) {
                var bunny = new PIXI.Sprite(texture);
                bunny.x = (i % 5) * 30;
                bunny.y = Math.floor(i / 5) * 30;
                bunny.rotation = Math.random() * (Math.PI * 2);
                this.container.addChild(bunny);
            }
            var brt = new PIXI.BaseRenderTexture(300, 300, PIXI.SCALE_MODES.LINEAR, 1);
            var rt = new PIXI.RenderTexture(brt);
            this.sprite = new PIXI.Sprite(rt);
            this.sprite.x = 450;
            this.sprite.y = 60;
            this.app.stage.addChild(this.sprite);
            this.container.x = 100;
            this.container.y = 60;
            this.app.ticker.add(function (delta) {
                _this.app.renderer.render(_this.container, rt);
            });
        }
        return RenderTexture;
    }());
    basics.RenderTexture = RenderTexture;
    var SpriteSheet = (function () {
        function SpriteSheet() {
            var _this = this;
            PIXI.loader
                .add("required/assets/basics/fighter.json")
                .load(function (loader, resource) {
                var frames = [];
                for (var i = 0; i < 30; i++) {
                    var val = i < 10 ? "0" + i : i;
                    frames.push(PIXI.Texture.fromFrame("rollSequence00" + val + ".png"));
                }
                _this.anim = new PIXI.extras.AnimatedSprite(frames);
                _this.anim.x = _this.app.renderer.width / 2;
                _this.anim.y = _this.app.renderer.height / 2;
                _this.anim.anchor.set(0.5);
                _this.anim.animationSpeed = 0.5;
                _this.anim.play();
                _this.app.stage.addChild(_this.anim);
                _this.app.ticker.add(function (deltaTime) {
                    _this.anim.rotation += 0.01;
                });
            });
        }
        return SpriteSheet;
    }());
    basics.SpriteSheet = SpriteSheet;
    var Text = (function () {
        function Text() {
            this.app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb });
            document.body.appendChild(this.app.view);
            this.basicText = new PIXI.Text("Basic text in pixi");
            this.basicText.x = 30;
            this.basicText.y = 90;
            this.app.stage.addChild(this.basicText);
            var style = new PIXI.TextStyle({
                fontFamily: "Arial",
                fontSize: 36,
                fontStyle: "italic",
                fontWeight: "bold",
                fill: ["#ffffff", "#fff0b5"],
                stroke: "#4a1850",
                strokeThickness: 5,
                dropShadow: true,
                dropShadowColor: "#000000",
                dropShadowBlur: 4,
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 6,
                wordWrap: true,
                wordWrapWidth: 440
            });
            this.richText = new PIXI.Text("Rich text with a lot of options and across multiple lines", style);
            this.richText.x = 30;
            this.richText.y = 180;
            this.app.stage.addChild(this.richText);
        }
        return Text;
    }());
    basics.Text = Text;
    var TexturedMesh = (function () {
        function TexturedMesh() {
            var _this = this;
            var ropeLength = 918 / 20;
            for (var i = 0; i < 25; i++) {
                this.points.push(new PIXI.Point(i * ropeLength, 0));
            }
            this.strip = new PIXI.mesh.Rope(PIXI.Texture.fromImage("required/assets/snake.png"), this.points);
            this.strip.x = -40;
            this.strip.y = 300;
            this.app.stage.addChild(this.strip);
            this.graphics = new PIXI.Graphics();
            this.graphics.x = this.strip.x;
            this.graphics.y = this.strip.y;
            this.app.stage.addChild(this.graphics);
            // start animating
            this.app.ticker.add(function (deltaTime) {
                _this.count += 0.1;
                // make the snake
                for (var i = 0; i < _this.points.length; i++) {
                    _this.points[i].y = Math.sin((i * 0.5) + _this.count) * 30;
                    _this.points[i].x = i * ropeLength + Math.cos((i * 0.3) + _this.count) * 20;
                }
                _this.renderPoints();
            });
        }
        TexturedMesh.prototype.renderPoints = function () {
            this.graphics.clear();
            this.graphics.lineStyle(2, 0xffc2c2);
            this.graphics.moveTo(this.points[0].x, this.points[0].y);
            for (var i = 1; i < this.points.length; i++) {
                this.graphics.lineTo(this.points[i].x, this.points[i].y);
            }
            for (var i = 1; i < this.points.length; i++) {
                this.graphics.beginFill(0xff0022);
                this.graphics.drawCircle(this.points[i].x, this.points[i].y, 10);
                this.graphics.endFill();
            }
        };
        return TexturedMesh;
    }());
    basics.TexturedMesh = TexturedMesh;
    var TilingSprite = (function () {
        function TilingSprite() {
            var _this = this;
            this.app = new PIXI.Application();
            document.body.appendChild(this.app.view);
            var texture = PIXI.Texture.fromImage("required/assets/p2.jpeg");
            this.tilingSprite = new PIXI.extras.TilingSprite(texture, this.app.renderer.width, this.app.renderer.height);
            this.app.stage.addChild(this.tilingSprite);
            this.count = 0;
            this.app.ticker.add(function (deltaTime) {
                _this.count += 0.005;
                _this.tilingSprite.tileScale.x = 2 + Math.sin(_this.count);
                _this.tilingSprite.tileScale.y = 2 + Math.cos(_this.count);
                _this.tilingSprite.tilePosition.x += 1;
                _this.tilingSprite.tilePosition.y += 1;
            });
        }
        return TilingSprite;
    }());
    basics.TilingSprite = TilingSprite;
    var Video = (function () {
        function Video() {
            var _this = this;
            this.app = new PIXI.Application(800, 600, { transparent: true });
            document.body.appendChild(this.app.view);
            this.button = new PIXI.Graphics()
                .beginFill(0x0, 0.5)
                .drawRoundedRect(0, 0, 100, 100, 10)
                .endFill()
                .beginFill(0xffffff)
                .moveTo(36, 30)
                .lineTo(36, 70)
                .lineTo(70, 50);
            // Position the button
            this.button.x = (this.app.renderer.width - this.button.fixedWidth) / 2;
            this.button.y = (this.app.renderer.height - this.button.fixedHeight) / 2;
            // Enable interactivity on the button
            this.button.interactive = true;
            this.button.buttonMode = true;
            // Add to the stage
            this.app.stage.addChild(this.button);
            this.button.on("pointertap", function () {
                _this.button.destroy();
                var texture = PIXI.Texture.fromVideo("required/assets/testVideo.mp4");
                _this.videoSprite = new PIXI.Sprite(texture);
                _this.videoSprite.fixedWidth = _this.app.renderer.width;
                _this.videoSprite.fixedHeight = _this.app.renderer.height;
                _this.app.stage.addChild(_this.videoSprite);
            });
        }
        return Video;
    }());
    basics.Video = Video;
})(basics || (basics = {}));
var demos;
(function (demos) {
    var AlphaMask = (function () {
        function AlphaMask() {
            var _this = this;
            this.app = new PIXI.Application();
            this.app.stage.interactive = true;
            document.body.appendChild(this.app.view);
            this.bg = PIXI.Sprite.fromImage("required/assets/bkg.jpg");
            this.app.stage.addChild(this.bg);
            this.cells = PIXI.Sprite.fromImage("required/assets/cells.png");
            this.cells.scale.set(1.5);
            this.mask = PIXI.Sprite.fromImage("required/assets/flowerTop.png");
            this.mask.anchor.set(0.5);
            this.mask.x = 310;
            this.mask.y = 190;
            this.cells.mask = this.mask;
            this.app.stage.addChild(this.mask, this.cells);
            this.target = new PIXI.Point();
            this.reset();
            this.app.ticker.add(function (deltaTime) {
                _this.mask.position.x += (_this.target.x - _this.mask.x) * 0.1;
                _this.mask.position.y += (_this.target.y - _this.mask.y) * 0.1;
                if (Math.abs(_this.mask.x - _this.target.x) < 1) {
                    _this.reset();
                }
            });
        }
        AlphaMask.prototype.reset = function () {
            this.target.x = Math.floor(Math.random() * 550);
            this.target.y = Math.floor(Math.random() * 300);
        };
        return AlphaMask;
    }());
    demos.AlphaMask = AlphaMask;
    var AnimatedSpriteDemo = (function () {
        function AnimatedSpriteDemo() {
            var _this = this;
            this.app = new PIXI.Application();
            this.app.stop();
            document.body.appendChild(this.app.view);
            PIXI.loader
                .add("spritesheet", "required/assets/mc.json")
                .load(function () {
                var explosionTextures = [];
                var i;
                for (i = 0; i < 26; i++) {
                    var texture = PIXI.Texture.fromFrame("Explosion_Sequence_A " + (i + 1) + ".png");
                    explosionTextures.push(texture);
                }
                for (i = 0; i < 50; i++) {
                    var explosion = new PIXI.extras.AnimatedSprite(explosionTextures);
                    explosion.x = Math.random() * _this.app.renderer.width;
                    explosion.y = Math.random() * _this.app.renderer.height;
                    explosion.anchor.set(0.5);
                    explosion.rotation = Math.random() * Math.PI;
                    explosion.scale.set(0.75 + Math.random() * 0.5);
                    explosion.gotoAndPlay(Math.random() * 27);
                    _this.app.stage.addChild(explosion);
                }
                _this.app.start();
            });
        }
        return AnimatedSpriteDemo;
    }());
    demos.AnimatedSpriteDemo = AnimatedSpriteDemo;
    var Batch = (function () {
        function Batch() {
            var _this = this;
            this.app = new PIXI.Application();
            document.body.appendChild(this.app.view);
            this.sprites = new PIXI.particles.ParticleContainer(10000, {
                scale: true,
                position: true,
                rotation: true,
                uvs: true,
                alpha: true
            });
            this.app.stage.addChild(this.sprites);
            this.maggots = [];
            var totalSprites = this.app.renderer instanceof PIXI.WebGLRenderer ? 10000 : 100;
            var dudeTexture = PIXI.Texture.fromImage("required/assets/tinyMaggot.png");
            for (var i = 0; i < totalSprites; i++) {
                var dude = new Dude(dudeTexture);
                dude.tint = Math.random() * 0xE8D4CD;
                dude.anchor.set(0.5);
                dude.scale.set(0.8 + Math.random() * 0.3);
                dude.x = Math.random() * this.app.renderer.width;
                dude.y = Math.random() * this.app.renderer.height;
                dude.direction = Math.random() * Math.PI * 2;
                dude.turningSpeed = Math.random() - 0.8;
                dude.speed = (2 + Math.random() * 2) * 0.2;
                dude.offset = Math.random() * 100;
                this.maggots.push(dude);
                this.sprites.addChild(dude);
            }
            var dudeBoundsPadding = 100;
            this.dudeBounds = new PIXI.Rectangle(-dudeBoundsPadding, -dudeBoundsPadding, this.app.renderer.width + dudeBoundsPadding * 2, this.app.renderer.height + dudeBoundsPadding * 2);
            this.tick = 0;
            this.app.ticker.add(function () {
                for (var i = 0; i < _this.maggots.length; i++) {
                    var dude = _this.maggots[i];
                    dude.scale.y = 0.95 + Math.sin(_this.tick + dude.offset) * 0.05;
                    dude.direction += dude.turningSpeed * 0.01;
                    dude.x += Math.sin(dude.direction) * (dude.speed * dude.scale.y);
                    dude.y += Math.cos(dude.direction) * (dude.speed * dude.scale.y);
                    dude.rotation = -dude.direction + Math.PI;
                    // wrap the maggots
                    if (dude.x < _this.dudeBounds.x) {
                        dude.x += _this.dudeBounds.width;
                    }
                    else if (dude.x > _this.dudeBounds.x + _this.dudeBounds.width) {
                        dude.x -= _this.dudeBounds.width;
                    }
                    if (dude.y < _this.dudeBounds.y) {
                        dude.y += _this.dudeBounds.height;
                    }
                    else if (dude.y > _this.dudeBounds.y + _this.dudeBounds.height) {
                        dude.y -= _this.dudeBounds.height;
                    }
                }
                _this.tick += 0.1;
            });
        }
        return Batch;
    }());
    demos.Batch = Batch;
    var Dude = (function (_super) {
        __extends(Dude, _super);
        function Dude(texture) {
            var _this = _super.call(this, texture) || this;
            _this.direction = 0;
            _this.speed = 0;
            _this.turningSpeed = 0;
            _this.offset = 0;
            return _this;
        }
        return Dude;
    }(PIXI.Sprite));
    demos.Dude = Dude;
    var BlendModes = (function () {
        function BlendModes() {
            var _this = this;
            this.app = new PIXI.Application();
            document.body.appendChild(this.app.view);
            this.background = PIXI.Sprite.fromImage("required/assets/BGrotate.jpg");
            this.app.stage.addChild(this.background);
            this.dudeArray = [];
            var totalDudes = 20;
            var dudeTexture = PIXI.Texture.fromImage("required/assets/flowerTop.png");
            for (var i = 0; i < totalDudes; i++) {
                var dude = new Dude(dudeTexture);
                dude.anchor.set(0.5);
                dude.scale.set(0.8 + Math.random() * 0.3);
                dude.x = Math.floor(Math.random() * this.app.renderer.width);
                dude.y = Math.floor(Math.random() * this.app.renderer.height);
                dude.blendMode = PIXI.BLEND_MODES.ADD;
                dude.direction = Math.random() * Math.PI * 2;
                dude.turningSpeed = Math.random() - 0.8;
                dude.speed = 2 + Math.random() * 2;
                this.dudeArray.push(dude);
                this.app.stage.addChild(dude);
            }
            var dudeBoundsPadding = 100;
            this.dudeBounds = new PIXI.Rectangle(-dudeBoundsPadding, -dudeBoundsPadding, this.app.renderer.width + dudeBoundsPadding * 2, this.app.renderer.height + dudeBoundsPadding * 2);
            this.app.ticker.add(function () {
                for (var i = 0; i < _this.dudeArray.length; i++) {
                    var dude = _this.dudeArray[i];
                    dude.direction += dude.turningSpeed * 0.01;
                    dude.x += Math.sin(dude.direction) * dude.speed;
                    dude.y += Math.cos(dude.direction) * dude.speed;
                    dude.rotation = -dude.direction - Math.PI / 2;
                    // wrap the dudes by testing their bounds...
                    if (dude.x < _this.dudeBounds.x) {
                        dude.x += _this.dudeBounds.width;
                    }
                    else if (dude.x > _this.dudeBounds.x + _this.dudeBounds.width) {
                        dude.x -= _this.dudeBounds.width;
                    }
                    if (dude.y < _this.dudeBounds.y) {
                        dude.y += _this.dudeBounds.height;
                    }
                    else if (dude.y > _this.dudeBounds.y + _this.dudeBounds.height) {
                        dude.y -= _this.dudeBounds.height;
                    }
                }
            });
        }
        return BlendModes;
    }());
    demos.BlendModes = BlendModes;
    var CacheAsBitmap = (function () {
        function CacheAsBitmap() {
            var _this = this;
            this.app = new PIXI.Application();
            this.app.stage.interactive = true;
            document.body.appendChild(this.app.view);
            this.app.stop();
            this.aliens = [];
            var alienFrames = [
                "eggHead.png",
                "flowerTop.png",
                "helmlok.png",
                "skully.png"
            ];
            this.count = 0;
            this.alienContainer = new PIXI.Container();
            this.alienContainer.x = 400;
            this.alienContainer.y = 300;
            this.app.stage.addChild(this.alienContainer);
            PIXI.loader
                .add("spritesheet", "required/assets/monsters.json")
                .load(function () {
                for (var i = 0; i < 100; i++) {
                    var frameName = alienFrames[i % 4];
                    var alien = PIXI.Sprite.fromFrame(frameName);
                    alien.tint = Math.random() * 0xFFFFFF;
                    alien.x = Math.random() * 800 - 400;
                    alien.y = Math.random() * 600 - 300;
                    alien.anchor.x = 0.5;
                    alien.anchor.y = 0.5;
                    _this.aliens.push(alien);
                    _this.alienContainer.addChild(alien);
                }
                _this.app.start();
                _this.app.stage.on("pointerTap", function (event) {
                    _this.alienContainer.cacheAsBitmap = !_this.alienContainer.cacheAsBitmap;
                });
                _this.app.ticker.add(function () {
                    // let"s rotate the aliens a little bit
                    for (var i = 0; i < 100; i++) {
                        var alien = _this.aliens[i];
                        alien.rotation += 0.1;
                    }
                    _this.count += 0.01;
                    _this.alienContainer.scale.x = Math.sin(_this.count);
                    _this.alienContainer.scale.y = Math.sin(_this.count);
                    _this.alienContainer.rotation += 0.01;
                });
            });
        }
        return CacheAsBitmap;
    }());
    demos.CacheAsBitmap = CacheAsBitmap;
    var Dragging = (function () {
        function Dragging() {
            this.app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb });
            document.body.appendChild(this.app.view);
            var texture = PIXI.Texture.fromImage("required/assets/bunny.png");
            texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
            for (var i = 0; i < 10; i++) {
                this.createBunny(texture, Math.floor(Math.random() * this.app.renderer.width), Math.floor(Math.random() * this.app.renderer.height));
            }
        }
        Dragging.prototype.createBunny = function (texture, x, y) {
            var _this = this;
            var bunny = new PIXI.Sprite(texture);
            bunny.interactive = true;
            bunny.buttonMode = true;
            bunny.anchor.set(0.5);
            bunny.scale.set(3);
            bunny
                .on("pointerdown", function (event) {
                _this.data = event.data;
                bunny.alpha = 0.5;
                _this.dragging = true;
            })
                .on("pointerup", function (event) {
                _this.data = null;
                bunny.alpha = 0.5;
                _this.dragging = false;
            })
                .on("pointerupoutside", function (event) {
                _this.data = null;
                bunny.alpha = 0.5;
                _this.dragging = false;
            })
                .on("pointermove", function (event) {
                if (_this.dragging) {
                    var newPosition = _this.data.getLocalPosition(bunny);
                    bunny.x = newPosition.x;
                    bunny.y = newPosition.y;
                }
            });
            bunny.x = x;
            bunny.y = y;
            this.app.stage.addChild(bunny);
        };
        return Dragging;
    }());
    demos.Dragging = Dragging;
    var GraphicsDemo = (function () {
        function GraphicsDemo() {
            var _this = this;
            this.app = new PIXI.Application(800, 600, { antialias: true });
            this.app.stage.interactive = true;
            document.body.appendChild(this.app.view);
            var graphics = new PIXI.Graphics();
            graphics.beginFill(0xFF3300);
            graphics.lineStyle(10, 0xffd900, 1);
            graphics.moveTo(50, 50);
            graphics.lineTo(250, 50);
            graphics.lineTo(100, 100);
            graphics.lineTo(250, 220);
            graphics.lineTo(50, 220);
            graphics.lineTo(50, 50);
            graphics.endFill();
            graphics.lineStyle(10, 0xFF0000, 0.8);
            graphics.beginFill(0xFF700B, 1);
            graphics.moveTo(210, 300);
            graphics.lineTo(450, 320);
            graphics.lineTo(570, 350);
            graphics.quadraticCurveTo(600, 0, 480, 100);
            graphics.lineTo(330, 120);
            graphics.lineTo(410, 200);
            graphics.lineTo(210, 300);
            graphics.endFill();
            graphics.lineStyle(2, 0x0000FF, 1);
            graphics.drawRect(50, 250, 100, 100);
            graphics.lineStyle(0);
            graphics.beginFill(0xFFFF0B, 0.5);
            graphics.drawCircle(470, 200, 100);
            graphics.endFill();
            graphics.lineStyle(20, 0x33FF00);
            graphics.moveTo(30, 30);
            graphics.lineTo(600, 300);
            this.graphics = graphics;
            this.app.stage.addChild(this.graphics);
            this.thing = new PIXI.Graphics();
            this.thing.x = 800 / 2;
            this.thing.y = 600 / 2;
            this.app.stage.addChild(this.thing);
            this.count = 0;
            this.app.stage.on("pointertap", function () {
                _this.graphics.lineStyle(Math.random() * 30, Math.random() * 0xFFFFFF, 1);
                _this.graphics.moveTo(Math.random() * 800, Math.random() * 600);
                _this.graphics.bezierCurveTo(Math.random() * 800, Math.random() * 600, Math.random() * 800, Math.random() * 600, Math.random() * 800, Math.random() * 600);
            });
            this.app.ticker.add(function () {
                _this.count += 0.1;
                _this.thing.clear();
                _this.thing.lineStyle(10, 0xff0000, 1);
                _this.thing.beginFill(0xffFF00, 0.5);
                _this.thing.moveTo(-120 + Math.sin(_this.count) * 20, -100 + Math.cos(_this.count) * 20);
                _this.thing.lineTo(120 + Math.cos(_this.count) * 20, -100 + Math.sin(_this.count) * 20);
                _this.thing.lineTo(120 + Math.sin(_this.count) * 20, 100 + Math.cos(_this.count) * 20);
                _this.thing.lineTo(-120 + Math.cos(_this.count) * 20, 100 + Math.sin(_this.count) * 20);
                _this.thing.lineTo(-120 + Math.sin(_this.count) * 20, -100 + Math.cos(_this.count) * 20);
                _this.thing.rotation = _this.count * 0.1;
            });
        }
        return GraphicsDemo;
    }());
    demos.GraphicsDemo = GraphicsDemo;
    var Interactivity = (function () {
        function Interactivity() {
            this.app = new PIXI.Application();
            document.body.appendChild(this.app.view);
            var background = PIXI.Sprite.fromImage("required/assets/button_test_BG.jpg");
            background.fixedWidth = this.app.renderer.width;
            background.fixedHeight = this.app.renderer.height;
            this.background = background;
            this.app.stage.addChild(this.background);
            this.buttons = [];
            var buttonPositions = [
                175, 75,
                655, 75,
                410, 325,
                150, 465,
                685, 445
            ];
            var textureButton = PIXI.Texture.fromImage("../../_assets/button.png");
            var textureButtonDown = PIXI.Texture.fromImage("../../_assets/buttonDown.png");
            var textureButtonOver = PIXI.Texture.fromImage("../../_assets/buttonOver.png");
            for (var i = 0; i < 5; i++) {
                var button = new PIXI.Sprite(textureButton);
                button.anchor.set(0.5);
                button.x = buttonPositions[i * 2];
                button.y = buttonPositions[i * 2 + 1];
                button.interactive = true;
                button.buttonMode = true;
                button
                    .on("pointerdown", function () {
                    // blah
                })
                    .on("pointerup", function () {
                    // blah
                })
                    .on("pointerupoutside", function () {
                    // blah
                })
                    .on("pointerover", function () {
                    // blah
                })
                    .on("pointerout", function () {
                    // blah
                });
                this.app.stage.addChild(button);
                this.buttons.push(button);
            }
            this.buttons[0].scale.set(1.2);
            this.buttons[2].rotation = Math.PI / 10;
            this.buttons[3].scale.set(0.8);
            this.buttons[4].scale.set(0.8, 1.2);
            this.buttons[4].rotation = Math.PI;
        }
        return Interactivity;
    }());
    demos.Interactivity = Interactivity;
    var Masking = (function () {
        function Masking() {
            var _this = this;
            this.app = new PIXI.Application(800, 600, { antialias: true });
            this.app.stage.interactive = true;
            document.body.appendChild(this.app.view);
            this.bg = PIXI.Sprite.fromImage("required/assets/BGrotate.jpg");
            this.bg.anchor.set(0.5);
            this.bg.x = this.app.renderer.width / 2;
            this.bg.y = this.app.renderer.height / 2;
            this.app.stage.addChild(this.bg);
            this.container = new PIXI.Container();
            this.container.x = this.app.renderer.width / 2;
            this.container.y = this.app.renderer.height / 2;
            this.app.stage.addChild(this.container);
            this.bgFront = PIXI.Sprite.fromImage("required/assets/SceneRotate.jpg");
            this.bgFront.anchor.set(0.5);
            this.light2 = PIXI.Sprite.fromImage("required/assets/LightRotate2.png");
            this.light2.anchor.set(0.5);
            this.light1 = PIXI.Sprite.fromImage("required/assets/LightRotate1.png");
            this.light1.anchor.set(0.5);
            this.panda = PIXI.Sprite.fromImage("required/assets/panda.png");
            this.panda.anchor.set(0.5);
            this.container.addChild(this.bgFront, this.light2, this.light1, this.panda);
            this.app.stage.addChild(this.container);
            this.thing = new PIXI.Graphics();
            this.app.stage.addChild(this.thing);
            this.thing.x = this.app.renderer.width / 2;
            this.thing.y = this.app.renderer.height / 2;
            this.thing.lineStyle(0);
            this.container.mask = this.thing;
            this.count = 0;
            this.app.stage.on("pointertap", function () {
                if (!_this.container.mask) {
                    _this.container.mask = _this.thing;
                }
                else {
                    _this.container.mask = null;
                }
            });
            this.app.ticker.add(function () {
                _this.bg.rotation += 0.01;
                _this.bgFront.rotation -= 0.01;
                _this.light1.rotation += 0.02;
                _this.light2.rotation += 0.01;
                _this.panda.scale.x = 1 + Math.sin(_this.count) * 0.04;
                _this.panda.scale.y = 1 + Math.cos(_this.count) * 0.04;
                _this.count += 0.1;
                _this.thing.clear();
                _this.thing.beginFill(0x8bc5ff, 0.4);
                _this.thing.moveTo(-120 + Math.sin(_this.count) * 20, -100 + Math.cos(_this.count) * 20);
                _this.thing.lineTo(-320 + Math.cos(_this.count) * 20, 100 + Math.sin(_this.count) * 20);
                _this.thing.lineTo(120 + Math.cos(_this.count) * 20, -100 + Math.sin(_this.count) * 20);
                _this.thing.lineTo(120 + Math.sin(_this.count) * 20, 100 + Math.cos(_this.count) * 20);
                _this.thing.lineTo(-120 + Math.cos(_this.count) * 20, 100 + Math.sin(_this.count) * 20);
                _this.thing.lineTo(-120 + Math.sin(_this.count) * 20, -300 + Math.cos(_this.count) * 20);
                _this.thing.lineTo(-320 + Math.sin(_this.count) * 20, -100 + Math.cos(_this.count) * 20);
                _this.thing.rotation = _this.count * 0.1;
            });
        }
        return Masking;
    }());
    demos.Masking = Masking;
    var RenderTextureDemo = (function () {
        function RenderTextureDemo() {
            var _this = this;
            this.app = new PIXI.Application();
            document.body.appendChild(this.app.view);
            this.renderTexture = PIXI.RenderTexture.create(this.app.renderer.width, this.app.renderer.height);
            this.renderTexture2 = PIXI.RenderTexture.create(this.app.renderer.width, this.app.renderer.height);
            this.currentTexture = this.renderTexture;
            this.outputSprite = new PIXI.Sprite(this.currentTexture);
            this.outputSprite.x = 400;
            this.outputSprite.y = 300;
            this.outputSprite.anchor.set(0.5);
            this.app.stage.addChild(this.outputSprite);
            this.stuffContainer = new PIXI.Container();
            this.stuffContainer.x = 400;
            this.stuffContainer.y = 300;
            this.app.stage.addChild(this.stuffContainer);
            var fruits = [
                "required/assets/spinObj_01.png",
                "required/assets/spinObj_02.png",
                "required/assets/spinObj_03.png",
                "required/assets/spinObj_04.png",
                "required/assets/spinObj_05.png",
                "required/assets/spinObj_06.png",
                "required/assets/spinObj_07.png",
                "required/assets/spinObj_08.png"
            ];
            this.items = [];
            for (var i = 0; i < 20; i++) {
                var item = PIXI.Sprite.fromImage(fruits[i % fruits.length]);
                item.x = Math.random() * 400 - 200;
                item.y = Math.random() * 400 - 200;
                item.anchor.set(0.5);
                this.stuffContainer.addChild(item);
                this.items.push(item);
            }
            this.count = 0;
            this.app.ticker.add(function () {
                for (var i = 0; i < _this.items.length; i++) {
                    var item = _this.items[i];
                    item.rotation += 0.1;
                }
                _this.count += 0.01;
                var temp = _this.renderTexture;
                _this.renderTexture = _this.renderTexture2;
                _this.renderTexture2 = temp;
                _this.outputSprite.texture = _this.renderTexture;
                _this.stuffContainer.rotation -= 0.01;
                _this.outputSprite.scale.set(1 + Math.sin(_this.count) * 0.2);
                _this.app.renderer.render(_this.app.stage, _this.renderTexture2, false);
            });
        }
        return RenderTextureDemo;
    }());
    demos.RenderTextureDemo = RenderTextureDemo;
    var StripDemo = (function () {
        function StripDemo() {
            var _this = this;
            this.app = new PIXI.Application();
            document.body.appendChild(this.app.view);
            this.count = 0;
            var ropeLength = 918 / 20;
            this.points = [];
            for (var i = 0; i < 20; i++) {
                this.points.push(new PIXI.Point(i * ropeLength, 0));
            }
            this.strip = new PIXI.mesh.Rope(PIXI.Texture.fromImage("required/assets/snake.png"), this.points);
            this.strip.x = -459;
            this.snakeContainer = new PIXI.Container();
            this.snakeContainer.position.x = 400;
            this.snakeContainer.position.y = 300;
            this.snakeContainer.scale.set(800 / 1100);
            this.snakeContainer.addChild(this.strip);
            this.app.stage.addChild(this.snakeContainer);
            this.app.ticker.add(function () {
                _this.count += 0.1;
                for (var i = 0; i < _this.points.length; i++) {
                    _this.points[i].y = Math.sin((i * 0.5) + _this.count) * 30;
                    _this.points[i].x = i * ropeLength + Math.cos((i * 0.3) + _this.count) * 20;
                }
            });
        }
        return StripDemo;
    }());
    demos.StripDemo = StripDemo;
    var TextDemo = (function () {
        function TextDemo() {
            var _this = this;
            this.app = new PIXI.Application();
            document.body.appendChild(this.app.view);
            PIXI.loader
                .add("desyrel", "required/assets/desyrel.xml")
                .load(function () {
                _this.bitmapFontText = new PIXI.extras.BitmapText("bitmap fonts are\n now supported!", { font: "35px Desyrel", align: "right" });
                _this.bitmapFontText.x = _this.app.renderer.width - _this.bitmapFontText.textWidth - 20;
                _this.bitmapFontText.y = 20;
                _this.app.stage.addChild(_this.bitmapFontText);
            });
            this.background = PIXI.Sprite.fromImage("required/assets/textDemoBG.jpg");
            this.background.fixedWidth = this.app.renderer.width;
            this.background.fixedHeight = this.app.renderer.height;
            this.app.stage.addChild(this.background);
            this.textSample = new PIXI.Text("Pixi.js can has\n multiline text!", {
                fontFamily: "Snippet",
                fontSize: 35,
                fill: "white",
                align: "left"
            });
            this.textSample.position.set(20);
            this.spinningText = new PIXI.Text("I\"m fun!", {
                fontWeight: "bold",
                fontSize: 60,
                fontFamily: "Arial",
                fill: "#cc00ff",
                align: "center",
                stroke: "#FFFFFF",
                strokeThickness: 6
            });
            this.spinningText.anchor.set(0.5);
            this.spinningText.x = this.app.renderer.width / 2;
            this.spinningText.y = this.app.renderer.height / 2;
            this.countingText = new PIXI.Text("COUNT 4Elet: 0", {
                fontWeight: "bold",
                fontStyle: "italic",
                fontSize: 60,
                fontFamily: "Arvo",
                fill: "#3e1707",
                align: "center",
                stroke: "#a4410e",
                strokeThickness: 7
            });
            this.countingText.x = this.app.renderer.width / 2;
            this.countingText.y = 500;
            this.countingText.anchor.x = 0.5;
            this.app.stage.addChild(this.textSample, this.spinningText, this.countingText);
            this.count = 0;
            this.app.ticker.add(function () {
                _this.count += 0.05;
                _this.countingText.text = "COUNT 4Elet: " + Math.floor(_this.count);
                _this.spinningText.rotation += 0.03;
            });
        }
        return TextDemo;
    }());
    demos.TextDemo = TextDemo;
    var TextureRotate = (function () {
        function TextureRotate() {
            var _this = this;
            this.app = new PIXI.Application();
            document.body.appendChild(this.app.view);
            this.bol = false;
            PIXI.loader.add("flowerTop", "required/assets/flowerTop.png");
            PIXI.loader.load(function (loader, resources) {
                _this.texture = resources.flowerTop.texture;
                _this.init();
            });
        }
        TextureRotate.prototype.init = function () {
            var textures = [this.texture];
            var D8 = PIXI.GroupD8;
            for (var rotate = 1; rotate < 16; rotate++) {
                var h = D8.isSwapWidthHeight(rotate) ? this.texture.frame.width : this.texture.frame.height;
                var w = D8.isSwapWidthHeight(rotate) ? this.texture.frame.height : this.texture.frame.width;
                var frame = this.texture.frame;
                var crop = new PIXI.Rectangle(this.texture.frame.x, this.texture.frame.y, w, h);
                var trim = crop;
                var rotatedTexture = void 0;
                if (rotate % 2 === 0) {
                    rotatedTexture = new PIXI.Texture(this.texture.baseTexture, frame, crop, trim, rotate);
                }
                else {
                    rotatedTexture = new PIXI.Texture(this.texture.baseTexture, frame, crop, trim, rotate - 1);
                    rotatedTexture.rotate++;
                }
                textures.push(rotatedTexture);
            }
            var offsetX = this.app.renderer.width / 16 | 0;
            var offsetY = this.app.renderer.height / 8 | 0;
            var gridW = this.app.renderer.width / 4 | 0;
            var gridH = this.app.renderer.height / 5 | 0;
            for (var i = 0; i < 16; i++) {
                var dude = new PIXI.Sprite(textures[i < 8 ? i * 2 : (i - 8) * 2 + 1]);
                dude.scale.x = 0.5;
                dude.scale.y = 0.5;
                dude.x = offsetX + gridW * (i % 4);
                dude.y = offsetY + gridH * (i / 4 | 0);
                this.app.stage.addChild(dude);
                var text = new PIXI.Text("rotate = " + dude.texture.rotate, { fontFamily: "Courier New", fontSize: "12px", fill: "white", align: "left" });
                text.x = dude.x;
                text.y = dude.y - 20;
                this.app.stage.addChild(text);
            }
        };
        return TextureRotate;
    }());
    demos.TextureRotate = TextureRotate;
    var TextureSwap = (function () {
        function TextureSwap() {
            var _this = this;
            this.app = new PIXI.Application();
            document.body.appendChild(this.app.view);
            this.bol = false;
            this.texture = PIXI.Texture.fromImage("required/assets/flowerTop.png");
            this.secondTexture = PIXI.Texture.fromImage("required/assets/eggHead.png");
            this.dude = new PIXI.Sprite(this.texture);
            this.dude.anchor.set(0.5);
            this.dude.x = this.app.renderer.width / 2;
            this.dude.y = this.app.renderer.height / 2;
            this.dude.interactive = true;
            this.dude.buttonMode = true;
            this.app.stage.addChild(this.dude);
            this.dude.on("pointertap", function () {
                _this.bol = !_this.bol;
                if (_this.bol) {
                    _this.dude.texture = _this.secondTexture;
                }
                else {
                    _this.dude.texture = _this.texture;
                }
            });
            this.app.ticker.add(function () {
                _this.dude.rotation += 0.1;
            });
        }
        return TextureSwap;
    }());
    demos.TextureSwap = TextureSwap;
    var Tinting = (function () {
        function Tinting() {
            var _this = this;
            this.app = new PIXI.Application();
            document.body.appendChild(this.app.view);
            this.aliens = [];
            var totalDudes = 20;
            var dudeTexture = PIXI.Texture.fromImage("required/assets/eggHead.png");
            for (var i = 0; i < totalDudes; i++) {
                var dude = new Dude(dudeTexture);
                dude.anchor.set(0.5);
                dude.scale.set(0.8 + Math.random() * 0.3);
                dude.x = Math.random() * this.app.renderer.width;
                dude.y = Math.random() * this.app.renderer.height;
                dude.tint = Math.random() * 0xFFFFFF;
                dude.direction = Math.random() * Math.PI * 2;
                dude.turningSpeed = Math.random() - 0.8;
                dude.speed = 2 + Math.random() * 2;
                this.aliens.push(dude);
                this.app.stage.addChild(dude);
            }
            var dudeBoundsPadding = 100;
            var dudeBounds = new PIXI.Rectangle(-dudeBoundsPadding, -dudeBoundsPadding, this.app.renderer.width + dudeBoundsPadding * 2, this.app.renderer.height + dudeBoundsPadding * 2);
            this.app.ticker.add(function () {
                for (var i = 0; i < _this.aliens.length; i++) {
                    var dude = _this.aliens[i];
                    dude.direction += dude.turningSpeed * 0.01;
                    dude.x += Math.sin(dude.direction) * dude.speed;
                    dude.y += Math.cos(dude.direction) * dude.speed;
                    dude.rotation = -dude.direction - Math.PI / 2;
                    if (dude.x < dudeBounds.x) {
                        dude.x += dudeBounds.width;
                    }
                    else if (dude.x > dudeBounds.x + dudeBounds.width) {
                        dude.x -= dudeBounds.width;
                    }
                    if (dude.y < dudeBounds.y) {
                        dude.y += dudeBounds.height;
                    }
                    else if (dude.y > dudeBounds.y + dudeBounds.height) {
                        dude.y -= dudeBounds.height;
                    }
                }
            });
        }
        return Tinting;
    }());
    demos.Tinting = Tinting;
    var TransparentBackground = (function () {
        function TransparentBackground() {
            var _this = this;
            this.app = new PIXI.Application(800, 600, { transparent: true });
            document.body.appendChild(this.app.view);
            this.bunny = PIXI.Sprite.fromImage("required/assets/bunny.png");
            this.bunny.anchor.set(0.5);
            this.bunny.x = this.app.renderer.width / 2;
            this.bunny.y = this.app.renderer.height / 2;
            this.app.stage.addChild(this.bunny);
            this.app.ticker.add(function () {
                _this.bunny.rotation += 0.1;
            });
        }
        return TransparentBackground;
    }());
    demos.TransparentBackground = TransparentBackground;
})(demos || (demos = {}));
var filters;
(function (filters) {
    var BlurFilter = (function () {
        function BlurFilter() {
            var _this = this;
            this.app = new PIXI.Application(800, 600);
            document.body.appendChild(this.app.view);
            this.bg = PIXI.Sprite.fromImage("required/assets/depth_blur_BG.jpg");
            this.bg.fixedWidth = this.app.renderer.width;
            this.bg.fixedHeight = this.app.renderer.height;
            this.app.stage.addChild(this.bg);
            this.littleDudes = PIXI.Sprite.fromImage("required/assets/depth_blur_dudes.jpg");
            this.littleDudes.x = (this.app.renderer.width / 2) - 315;
            this.littleDudes.y = 200;
            this.app.stage.addChild(this.littleDudes);
            this.littleRobot = PIXI.Sprite.fromImage("required/assets/depth_blur_moby.jpg");
            this.littleRobot.x = (this.app.renderer.width / 2) - 200;
            this.littleRobot.y = 100;
            this.app.stage.addChild(this.littleRobot);
            this.blurFilter1 = new PIXI.filters.BlurFilter();
            this.blurFilter2 = new PIXI.filters.BlurFilter();
            this.littleDudes.filters = [this.blurFilter1];
            this.littleRobot.filters = [this.blurFilter2];
            this.count = 0;
            this.app.ticker.add(function () {
                _this.count += 0.005;
                var blurAmount = Math.cos(_this.count);
                var blurAmount2 = Math.sin(_this.count);
                _this.blurFilter1.blur = 20 * (blurAmount);
                _this.blurFilter2.blur = 20 * (blurAmount2);
            });
        }
        return BlurFilter;
    }());
    filters.BlurFilter = BlurFilter;
    var DisplacementMap = (function () {
        function DisplacementMap() {
            var _this = this;
            this.onPointerMove = function (eventData) {
                _this.ring.visible = true;
                _this.displacementSprite.x = eventData.data.global.x - 100;
                _this.displacementSprite.y = eventData.data.global.y - _this.displacementSprite.fixedHeight / 2;
                _this.ring.x = eventData.data.global.x - 25;
                _this.ring.y = eventData.data.global.y;
            };
            this.app = new PIXI.Application(800, 600);
            this.app.stage.interactive = true;
            document.body.appendChild(this.app.view);
            this.container = new PIXI.Container();
            this.app.stage.addChild(this.container);
            var padding = 100;
            var bounds = new PIXI.Rectangle(-padding, -padding, this.app.renderer.width + padding * 2, this.app.renderer.height + padding * 2);
            this.maggots = [];
            for (var i = 0; i < 20; i++) {
                var maggot = new DisplacementMapDude();
                maggot.anchor.set(0.5);
                this.container.addChild(maggot);
                maggot.direction = Math.random() * Math.PI * 2;
                maggot.speed = 1;
                maggot.turnSpeed = Math.random() - 0.8;
                maggot.position.x = Math.random() * bounds.width;
                maggot.position.y = Math.random() * bounds.height;
                maggot.scale.set(1 + Math.random() * 0.3);
                maggot.original = maggot.scale.clone();
                this.maggots.push(maggot);
            }
            this.displacementSprite = PIXI.Sprite.fromImage("required/assets/displace.png");
            var displacementFilter = new PIXI.filters.DisplacementFilter(this.displacementSprite);
            this.app.stage.addChild(this.displacementSprite);
            this.container.filters = [displacementFilter];
            displacementFilter.scale.x = 110;
            displacementFilter.scale.y = 110;
            this.ring = PIXI.Sprite.fromImage("required/assets/ring.png");
            this.ring.anchor.set(0.5);
            this.ring.visible = false;
            this.app.stage.addChild(this.ring);
            this.bg = PIXI.Sprite.fromImage("required/assets/bkg-grass.jpg");
            this.bg.fixedWidth = this.app.renderer.width;
            this.bg.fixedHeight = this.app.renderer.height;
            this.bg.alpha = 0.4;
            this.container.addChild(this.bg);
            this.count = 0;
            this.app.stage
                .on("mousemove", this.onPointerMove)
                .on("touchmove", this.onPointerMove);
            this.app.ticker.add(function () {
                _this.count += 0.05;
                for (var i = 0; i < _this.maggots.length; i++) {
                    var maggot = _this.maggots[i];
                    maggot.direction += maggot.turnSpeed * 0.01;
                    maggot.x += Math.sin(maggot.direction) * maggot.speed;
                    maggot.y += Math.cos(maggot.direction) * maggot.speed;
                    maggot.rotation = -maggot.direction - Math.PI / 2;
                    maggot.scale.x = maggot.original.x + Math.sin(_this.count) * 0.2;
                    if (maggot.x < bounds.x) {
                        maggot.x += bounds.width;
                    }
                    else if (maggot.x > bounds.x + bounds.width) {
                        maggot.x -= bounds.width;
                    }
                    if (maggot.y < bounds.y) {
                        maggot.y += bounds.height;
                    }
                    else if (maggot.y > bounds.y + bounds.height) {
                        maggot.y -= bounds.height;
                    }
                }
            });
        }
        return DisplacementMap;
    }());
    filters.DisplacementMap = DisplacementMap;
    var DisplacementMapDude = (function (_super) {
        __extends(DisplacementMapDude, _super);
        function DisplacementMapDude() {
            var _this = _super.call(this, PIXI.Texture.fromImage("../../_assets/maggot.png")) || this;
            _this.direction = 0;
            _this.speed = 0;
            _this.turnSpeed = 0;
            _this.original = new PIXI.Point();
            return _this;
        }
        return DisplacementMapDude;
    }(PIXI.Sprite));
    filters.DisplacementMapDude = DisplacementMapDude;
    var Filter = (function () {
        function Filter() {
            var _this = this;
            this.app = new PIXI.Application();
            this.app.stage.interactive = true;
            document.body.appendChild(this.app.view);
            this.bg = PIXI.Sprite.fromImage("required/assets/BGrotate.jpg");
            this.bg.anchor.set(0.5);
            this.bg.x = this.app.renderer.width / 2;
            this.bg.y = this.app.renderer.height / 2;
            this.filter = new PIXI.filters.ColorMatrixFilter();
            this.container = new PIXI.Container();
            this.container.position.x = this.app.renderer.width / 2;
            this.container.position.y = this.app.renderer.height / 2;
            this.app.stage.addChild(this.container);
            this.bgFront = PIXI.Sprite.fromImage("required/assets/SceneRotate.jpg");
            this.bgFront.anchor.set(0.5);
            this.container.addChild(this.bgFront);
            this.light2 = PIXI.Sprite.fromImage("required/assets/LightRotate2.png");
            this.light2.anchor.set(0.5);
            this.container.addChild(this.light2);
            this.light1 = PIXI.Sprite.fromImage("../../_assets/LightRotate1.png");
            this.light1.anchor.set(0.5);
            this.container.addChild(this.light1);
            this.panda = PIXI.Sprite.fromImage("required/assets/panda.png");
            this.panda.anchor.set(0.5);
            this.container.addChild(this.panda);
            this.app.stage.filters = [this.filter];
            this.count = 0;
            this.enabled = true;
            this.app.stage.on("pointertap", function () {
                _this.enabled = !_this.enabled;
                _this.app.stage.filters = _this.enabled ? [_this.filter] : null;
            });
            this.help = new PIXI.Text("Click or tap to turn filters on / off.", {
                fontFamily: "Arial",
                fontSize: 12,
                fontWeight: "bold",
                fill: "white"
            });
            this.help.y = this.app.renderer.height - 25;
            this.help.x = 10;
            this.app.stage.addChild(this.help);
            this.app.ticker.add(function (delta) {
                _this.bg.rotation += 0.01;
                _this.bgFront.rotation -= 0.01;
                _this.light1.rotation += 0.02;
                _this.light2.rotation += 0.01;
                _this.panda.scale.x = 1 + Math.sin(_this.count) * 0.04;
                _this.panda.scale.y = 1 + Math.cos(_this.count) * 0.04;
                _this.count += 0.1;
                var matrix = _this.filter.matrix;
                matrix[1] = Math.sin(_this.count) * 3;
                matrix[2] = Math.cos(_this.count);
                matrix[3] = Math.cos(_this.count) * 1.5;
                matrix[4] = Math.sin(_this.count / 3) * 2;
                matrix[5] = Math.sin(_this.count / 2);
                matrix[6] = Math.sin(_this.count / 4);
            });
        }
        return Filter;
    }());
    filters.Filter = Filter;
})(filters || (filters = {}));
