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
    var RoomSprite = (function (_super) {
        __extends(RoomSprite, _super);
        function RoomSprite(texture, roomPos) {
            var _this = _super.call(this, PIXI.Texture.fromImage('images/' + texture)) || this;
            _this.roomPos = roomPos;
            return _this;
        }
        return RoomSprite;
    }(PIXI.Sprite));
    var Gfx = (function () {
        function Gfx(stage, controls, proc) {
            var _this = this;
            this.controls = controls;
            this.proc = proc;
            this.roomSprites = new Catacombs.Array2D();
            this.playerTokenById = new Array();
            this.monsterTokenById = new Array();
            this.treasureTokenById = new Array();
            this.questionMarks = new Array();
            this.mapCont = new PIXI.Container();
            this.mapTokensCont = new PIXI.Container();
            var self = this;
            // Mapa
            stage.addChild(self.mapCont);
            stage.addChild(self.mapTokensCont);
            self.mapCont.fixedWidth = self.mapTokensCont.fixedWidth = Gfx.ROOM_IMG_SIZE * proc.map.sideSize;
            self.mapCont.fixedHeight = self.mapTokensCont.fixedHeight = Gfx.ROOM_IMG_SIZE * proc.map.sideSize;
            self.mapCont.x = self.mapTokensCont.x = stage.fixedWidth / 2 - self.mapCont.fixedWidth / 2;
            self.mapCont.y = self.mapTokensCont.y = stage.fixedHeight / 2 - self.mapCont.fixedHeight / 2;
            Catacombs.EventBus.getInstance().registerConsumer(Catacombs.EventType.ROOM_DISCOVERED, function (p) {
                var room = proc.map.rooms.getValue(p.x, p.y);
                var sprite = new PIXI.Sprite(room.def.tex);
                sprite.anchor.set(0.5);
                sprite.rotation = room.rotation;
                sprite.x = Gfx.ROOM_IMG_SIZE * (p.x + 0.5);
                sprite.y = Gfx.ROOM_IMG_SIZE * (p.y + 0.5);
                self.mapCont.addChild(sprite);
                sprite.alpha = 0;
                createjs.Tween.get(sprite)
                    .to({
                    alpha: 1
                }, 200);
                var roomSprites = new Array();
                self.roomSprites.setValue(p.x, p.y, roomSprites);
                for (var _i = 0, _a = room.monsters; _i < _a.length; _i++) {
                    var monster = _a[_i];
                    if (!monster)
                        continue;
                    var sprite_1 = new RoomSprite(monster.def.name + '_token.png', roomSprites.length);
                    _this.monsterTokenById[monster.id] = sprite_1;
                    roomSprites.push(sprite_1);
                }
                if (room.treasure && !room.treasure.def.canPick) {
                    var sprite_2 = new RoomSprite(room.treasure.def.name + '.png', roomSprites.length);
                    _this.treasureTokenById[room.treasure.id] = sprite_2;
                    roomSprites.push(sprite_2);
                }
                self.drawRoomTokens(p.x, p.y);
                return false;
            });
            for (var mapy = 0; mapy < proc.map.sideSize; mapy++) {
                for (var mapx = 0; mapx < proc.map.sideSize; mapx++) {
                    var x = mapy * Gfx.ROOM_IMG_SIZE;
                    var y = mapx * Gfx.ROOM_IMG_SIZE;
                    if (mapx == proc.map.center && mapy == proc.map.center) {
                        var room = proc.map.rooms.getValue(mapx, mapy);
                        var sprite = new PIXI.Sprite(room.def.tex);
                        sprite.x = x;
                        sprite.y = y;
                        self.mapCont.addChild(sprite);
                    }
                    else {
                        var shape = new PIXI.Graphics();
                        shape.beginFill(0x222222);
                        shape.lineStyle(1, 0x000000);
                        shape.drawRect(1, 1, Gfx.ROOM_IMG_SIZE - 2, Gfx.ROOM_IMG_SIZE - 2);
                        self.mapCont.addChild(shape);
                        shape.x = x;
                        shape.y = y;
                    }
                }
            }
            // Menu
            var createMenu = function () {
                var menu = new PIXI.Container();
                menu.fixedWidth = stage.fixedWidth / 2 - 20 - self.mapCont.fixedWidth / 2;
                menu.fixedHeight = stage.fixedHeight - 20;
                var shape = new PIXI.Graphics();
                shape.beginFill(0x222222);
                shape.lineStyle(1, 0x000000);
                shape.drawRect(1, 1, menu.fixedWidth, menu.fixedHeight);
                menu.addChild(shape);
                return menu;
            };
            // lmenu
            var lmenu = createMenu();
            stage.addChild(lmenu);
            lmenu.x = 10;
            lmenu.y = 10;
            var lmenuLastY = 0;
            // Obchod
            Object.keys(Catacombs.EquipmentDef.defsByName).forEach(function (name, i) {
                var def = Catacombs.EquipmentDef.defsByName[name];
                var token = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + name + '_token.png'));
                token.x = 10;
                token.y = lmenuLastY + 10;
                lmenuLastY = token.y + Gfx.UI_TOKEN_IMG_SIZE;
                lmenu.addChild(token);
                var buyBtn = self.createBtn("Koupit za " + def.price + "c", 0xd29e36, lmenu.fixedWidth - 30 - Gfx.UI_TOKEN_IMG_SIZE, 30, function () {
                    var activePlayer = self.controls.activePlayer;
                    if (!self.controls.activeKeeper) {
                    }
                });
                buyBtn.x = token.x + 10 + Gfx.UI_TOKEN_IMG_SIZE;
                buyBtn.y = token.y + Gfx.UI_TOKEN_IMG_SIZE / 2 - buyBtn.getBounds().height / 2;
                lmenu.addChild(buyBtn);
            });
            // Ceník
            Object.keys(Catacombs.TreasureDef.defsByName).forEach(function (name, i) {
                var def = Catacombs.TreasureDef.defsByName[name];
                if (!def.canBuy)
                    return;
                var token = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + name + '.png'));
                token.x = 10;
                token.y = lmenuLastY + 10;
                lmenuLastY = token.y + Gfx.UI_TOKEN_IMG_SIZE;
                lmenu.addChild(token);
                var text = new PIXI.Text(" = " + def.price + "c", { fontFamily: 'Arial', fontSize: 34 + "px", fill: 0xd29e36 });
                text.anchor.set(0, 0.5);
                text.x = token.x + Gfx.UI_TOKEN_IMG_SIZE + 10;
                text.y = token.y + Gfx.UI_TOKEN_IMG_SIZE / 2;
                lmenu.addChild(text);
            });
            // Log
            var logFontSizePX = 20;
            var logBox = new PIXI.Container();
            logBox.x = 10;
            logBox.y = lmenuLastY + 10;
            logBox.fixedWidth = lmenu.fixedWidth - 20;
            logBox.fixedHeight = lmenu.fixedHeight - 10 - logBox.y;
            var logBoxBgr = new PIXI.Graphics();
            logBoxBgr.beginFill(0x0);
            logBoxBgr.drawRect(0, 0, logBox.fixedWidth, logBox.fixedHeight);
            logBox.addChild(logBoxBgr);
            lmenu.addChild(logBox);
            var logTexts = new Array();
            Catacombs.EventBus.getInstance().registerConsumer(Catacombs.EventType.LOG, function (p) {
                if (logTexts.length > logBox.fixedHeight / logFontSizePX) {
                    var oldText = logTexts.shift();
                    if (oldText)
                        logBox.removeChild(oldText);
                }
                var text = new PIXI.Text("- " + p.payload, { fontFamily: 'Arial', fontSize: logFontSizePX + "px", fill: 0xd29e36 });
                logTexts.forEach(function (t) { return t.y -= text.getBounds().height + 5; });
                logTexts.push(text);
                text.anchor.set(0, 1);
                text.x = 5;
                text.y = logBox.fixedHeight - 5;
                logBox.addChild(text);
                return false;
            });
            // rmenu
            var rmenu = createMenu();
            stage.addChild(rmenu);
            rmenu.x = stage.fixedWidth - 10 - rmenu.fixedWidth;
            rmenu.y = 10;
            var tweenBounces = new Array();
            var bounceStop = function () {
                tweenBounces.forEach(function (t) {
                    createjs.Tween.removeTweens(t.scale);
                    t.scale.set(1, 1);
                });
                tweenBounces = [];
            };
            var bounce = function (sprites) {
                bounceStop();
                sprites.forEach(function (s, i) {
                    tweenBounces[i] = s;
                    createjs.Tween.get(s.scale, { loop: true })
                        .to({
                        x: 1.3,
                        y: 1.3
                    }, 200).to({
                        x: 1,
                        y: 1
                    }, 200);
                });
            };
            var mapCenter = self.proc.map.center;
            var centerRoomSprites = new Array();
            self.roomSprites.setValue(mapCenter, mapCenter, centerRoomSprites);
            // player icons
            proc.players.forEach(function (player, i) {
                var token = new RoomSprite('player' + i + '_token.png', centerRoomSprites.length);
                token.interactive = false;
                token.buttonMode = true;
                // na plochu bude přidáno jednotně mimo tento cykl
                centerRoomSprites.push(token);
                self.playerTokenById[i] = token;
                var playerMenuIcon = new PIXI.Sprite(PIXI.Texture.fromImage('images/player' + i + '.png'));
                playerMenuIcon.anchor.set(0.5, 0.5);
                rmenu.addChild(playerMenuIcon);
                playerMenuIcon.x = 10 + Gfx.UI_TOKEN_IMG_SIZE / 2;
                playerMenuIcon.y = 10 + 2 * i * (Gfx.UI_TOKEN_IMG_SIZE + 20) + Gfx.UI_TOKEN_IMG_SIZE / 2;
                Catacombs.EventBus.getInstance().registerConsumer(Catacombs.EventType.PLAYER_ACTIVATE, function (p) {
                    if (i != p.payload)
                        return;
                    self.questionMarks.forEach(function (q) { self.mapTokensCont.removeChild(q); });
                    self.questionMarks = [];
                    bounce([token, playerMenuIcon]);
                    self.deactivateMonsterTokens();
                });
                var healthUI = new PIXI.Container();
                rmenu.addChild(healthUI);
                healthUI.x = playerMenuIcon.x + Gfx.UI_TOKEN_IMG_SIZE / 2 + 10;
                healthUI.y = playerMenuIcon.y - Gfx.UI_TOKEN_IMG_SIZE / 2;
                for (var h = 0; h < player.health; h++) {
                    var sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/life.png'));
                    healthUI.addChild(sprite);
                    sprite.x = h * Gfx.UI_TOKEN_IMG_SIZE / 2;
                }
                var invetoryUI = new PIXI.Container();
                rmenu.addChild(invetoryUI);
                invetoryUI.x = playerMenuIcon.x + Gfx.UI_TOKEN_IMG_SIZE / 2 + 10;
                invetoryUI.y = playerMenuIcon.y + Gfx.UI_TOKEN_IMG_SIZE / 2 + 10;
                token.on("mouseover", function () {
                    token.scale.set(1.5, 1.5);
                });
                token.on("mouseout", function () {
                    token.scale.set(1, 1);
                });
                token.on("click", function () {
                    // Nestvůra útočí na daného hráče
                    var sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/life_token.png'));
                    self.mapCont.addChild(sprite);
                    sprite.x = token.x;
                    sprite.y = token.y;
                    sprite.anchor.set(0.5, 0.5);
                    self.deactivatePlayerTokens();
                    createjs.Tween.get(sprite).to({
                        y: token.y - 100
                    }, 500).call(function () {
                        self.mapCont.removeChild(sprite);
                    });
                    createjs.Tween.get(sprite).wait(300).to({
                        alpha: 0
                    }, 200);
                    player.health--;
                    healthUI.removeChildAt(healthUI.children.length - 1);
                });
                Catacombs.EventBus.getInstance().registerConsumer(Catacombs.EventType.PLAYER_MOVE, function (p) {
                    if (i != p.playerId)
                        return;
                    var sprite = self.playerTokenById[p.playerId];
                    self.moveSprite(sprite, p.fromX, p.fromY, p.toX, p.toY);
                    return false;
                });
                Catacombs.EventBus.getInstance().registerConsumer(Catacombs.EventType.ROOM_ITEM_OBTAINED, function (p) {
                    if (i != p.playerId)
                        return;
                    var sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + p.item.name + '.png'));
                    stage.addChild(sprite);
                    sprite.x = self.mapCont.x + Gfx.ROOM_IMG_SIZE * (p.room.mapx + 0.5);
                    sprite.y = self.mapCont.y + Gfx.ROOM_IMG_SIZE * (p.room.mapy + 0.5);
                    createjs.Tween.get(sprite)
                        .to({
                        x: rmenu.x,
                        y: rmenu.y + playerMenuIcon.y
                    }, 300).call(function () {
                        stage.removeChild(sprite);
                        Catacombs.EventBus.getInstance().fireEvent(new Catacombs.NumberEventPayload(Catacombs.EventType.INV_UPDATE, p.playerId));
                    });
                    return false;
                });
                Catacombs.EventBus.getInstance().registerConsumer(Catacombs.EventType.INV_UPDATE, function (p) {
                    if (i != p.payload)
                        return;
                    invetoryUI.removeChildren();
                    var lastX = 0;
                    for (var key in player.inventory) {
                        var item = player.inventory[key];
                        if (item.amount <= 0)
                            continue;
                        if (item.amount > 1) {
                            var text = new PIXI.Text(item.amount + "", { fontFamily: 'Arial', fontWeight: 'bold', fontSize: 24, fill: 0xffff10 });
                            invetoryUI.addChild(text);
                            text.x = lastX;
                            text.y = 1;
                            lastX += text.width;
                        }
                        var sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + item.name + '.png'));
                        invetoryUI.addChild(sprite);
                        sprite.x = lastX;
                        lastX += Gfx.UI_TOKEN_IMG_SIZE + 15;
                    }
                });
            });
            // aby se přidali tokeny hráčů
            self.drawRoomTokens(mapCenter, mapCenter);
            Catacombs.EventBus.getInstance().registerConsumer(Catacombs.EventType.MONSTER_MOVE, function (p) {
                self.deactivatePlayerTokens();
                var sprite = self.monsterTokenById[p.monsterId];
                self.moveSprite(sprite, p.fromX, p.fromY, p.toX, p.toY);
                return false;
            });
            // dungeon keeper icon
            var texture = PIXI.Texture.fromImage('images/keeper.png');
            var keeperIcon = new PIXI.Sprite(texture);
            keeperIcon.anchor.set(0.5, 0.5);
            rmenu.addChild(keeperIcon);
            keeperIcon.x = 10 + Gfx.UI_TOKEN_IMG_SIZE / 2;
            keeperIcon.y = 10 + 2 * proc.players.length * (Gfx.UI_TOKEN_IMG_SIZE + 20) + Gfx.UI_TOKEN_IMG_SIZE / 2;
            // Přeskočit tah btn
            var skipBtn = self.createBtn("Přeskočit tah (mezerník)", 0xd29e36, rmenu.fixedWidth, 30, function () { self.controls.next(); });
            skipBtn.x = 10;
            skipBtn.y = keeperIcon.y + Gfx.UI_TOKEN_IMG_SIZE * 2;
            rmenu.addChild(skipBtn);
            Catacombs.EventBus.getInstance().registerConsumer(Catacombs.EventType.KEEPER_ACTIVATE, function (p) {
                var toBounce = [keeperIcon];
                self.monsterTokenById.forEach(function (sprite, i) {
                    toBounce.push(sprite);
                    var text = new PIXI.Text("?", { fontFamily: 'Arial', fontWeight: 'bold', fontSize: 24, fill: 0xffff10 });
                    text.anchor.set(0.5, 0.5);
                    text.x = sprite.x;
                    text.y = sprite.y;
                    self.mapTokensCont.addChild(text);
                    toBounce.push(text);
                    self.questionMarks.push(text);
                    var onClick = function () {
                        self.controls.activeMonster = i;
                        sprite.interactive = false;
                        bounceStop();
                        self.questionMarks.forEach(function (q) { self.mapTokensCont.removeChild(q); });
                        self.questionMarks = [];
                        bounce([sprite]);
                        var room = self.proc.map.rooms.getValue(self.proc.monsters[i].mapx, self.proc.monsters[i].mapy);
                        room.players.forEach(function (player) {
                            var playerUI = self.playerTokenById[player.id];
                            playerUI.interactive = true;
                        });
                    };
                    sprite.interactive = true;
                    sprite.on('click', onClick);
                    text.interactive = true;
                    text.on('click', onClick);
                    sprite.buttonMode = true;
                    text.buttonMode = true;
                });
                bounce(toBounce);
                return false;
            });
        }
        Gfx.prototype.createBtn = function (caption, color, width, height, onClick) {
            var btn = new PIXI.Container();
            btn.interactive = true;
            btn.buttonMode = true;
            btn.on("click", onClick);
            btn.on("mouseover", function () { btn.alpha = 0.7; });
            btn.on("mouseout", function () { btn.alpha = 1; });
            var text = new PIXI.Text(caption, { fontFamily: 'Arial', fontSize: height - 10 + "px", fill: color });
            text.anchor.set(0.5, 0);
            text.x = width / 2;
            text.y = 5;
            var bgr = new PIXI.Graphics();
            bgr.beginFill(color, 0.3);
            bgr.lineStyle(2, color);
            bgr.drawRoundedRect(0, 0, width - 20, text.height + 10, 5);
            btn.addChild(bgr);
            btn.addChild(text);
            return btn;
        };
        Gfx.prototype.drawRoomTokens = function (x, y) {
            var _this = this;
            this.roomSprites.getValue(x, y).forEach(function (sprite, i) {
                var newX = 2.5 + (i % 3) * (Gfx.MAP_TOKEN_IMG_SIZE + 2.5) + x * Gfx.ROOM_IMG_SIZE + Gfx.MAP_TOKEN_IMG_SIZE / 2;
                var newY = 2.5 + Math.floor(i / 3) * (Gfx.MAP_TOKEN_IMG_SIZE + 2.5) + y * Gfx.ROOM_IMG_SIZE + Gfx.MAP_TOKEN_IMG_SIZE / 2;
                if (sprite.parent) {
                    createjs.Tween.get(sprite)
                        .to({
                        x: newX,
                        y: newY
                    }, 200);
                }
                else {
                    sprite.anchor.set(0.5);
                    sprite.x = newX;
                    sprite.y = newY;
                    _this.mapTokensCont.addChild(sprite);
                }
            });
        };
        Gfx.prototype.moveSprite = function (sprite, fromX, fromY, toX, toY) {
            var fromRoomSprites = this.roomSprites.getValue(fromX, fromY);
            // vytáhni sprite z pořadníku staré místnosti a sniž pořadí všech sprites, 
            // co byly v pořadí za ním (budou se posouvat na jeho místo)
            fromRoomSprites.splice(sprite.roomPos, 1);
            for (var i = sprite.roomPos; i < fromRoomSprites.length; i++) {
                fromRoomSprites[i].roomPos--;
            }
            // zapiš sprite na konec pořadníku nové místnosti
            var toRoomSprites = this.roomSprites.getValue(toX, toY);
            sprite.roomPos = toRoomSprites.length;
            toRoomSprites.push(sprite);
            // překresli s animací sprites v místnostech
            this.drawRoomTokens(fromX, fromY);
            this.drawRoomTokens(toX, toY);
        };
        Gfx.prototype.deactivateMonsterTokens = function () {
            this.monsterTokenById.forEach(function (monster) {
                monster.interactive = false;
                monster.scale.set(1, 1);
            });
        };
        Gfx.prototype.deactivatePlayerTokens = function () {
            this.playerTokenById.forEach(function (player) {
                player.interactive = false;
                player.scale.set(1, 1);
            });
        };
        return Gfx;
    }());
    Gfx.ROOM_IMG_SIZE = 100;
    Gfx.MAP_TOKEN_IMG_SIZE = 30;
    Gfx.UI_TOKEN_IMG_SIZE = 60;
    Catacombs.Gfx = Gfx;
})(Catacombs || (Catacombs = {}));
