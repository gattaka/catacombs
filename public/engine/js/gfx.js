var Catacombs;
(function (Catacombs) {
    var Gfx = (function () {
        function Gfx(stage, controls, proc) {
            var _this = this;
            this.controls = controls;
            this.proc = proc;
            this.roomSprites = new Catacombs.Array2D();
            this.players = new Array();
            this.monsters = new Array();
            this.treasures = new Array();
            this.questionMarks = new Array();
            var self = this;
            // Mapa
            var mapCont = new PIXI.Container();
            var mapTokensCont = new PIXI.Container();
            stage.addChild(mapCont);
            stage.addChild(mapTokensCont);
            mapCont.fixedWidth = mapTokensCont.fixedWidth = Gfx.ROOM_IMG_SIZE * proc.map.sideSize;
            mapCont.fixedHeight = mapTokensCont.fixedHeight = Gfx.ROOM_IMG_SIZE * proc.map.sideSize;
            mapCont.x = mapTokensCont.x = stage.fixedWidth / 2 - mapCont.fixedWidth / 2;
            mapCont.y = mapTokensCont.y = stage.fixedHeight / 2 - mapCont.fixedHeight / 2;
            Catacombs.EventBus.getInstance().registerConsumer(Catacombs.EventType.ROOM_DISCOVERED, function (p) {
                var room = proc.map.rooms.getValue(p.x, p.y);
                var sprite = new PIXI.Sprite(room.def.tex);
                sprite.anchor.set(0.5);
                sprite.rotation = room.rotation;
                sprite.x = Gfx.ROOM_IMG_SIZE * (p.x + 0.5);
                sprite.y = Gfx.ROOM_IMG_SIZE * (p.y + 0.5);
                mapCont.addChild(sprite);
                sprite.alpha = 0;
                createjs.Tween.get(sprite)
                    .to({
                    alpha: 1
                }, 200);
                var roomSprites = new Array();
                self.roomSprites.setValue(p.x, p.y, roomSprites);
                var mCounter = 0;
                for (var _i = 0, _a = room.monsters; _i < _a.length; _i++) {
                    var monster = _a[_i];
                    if (!monster)
                        continue;
                    var sprite_1 = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + monster.def.name + '_token.png'));
                    sprite_1.anchor.set(0.5);
                    mapTokensCont.addChild(sprite_1);
                    _this.monsters[monster.id] = sprite_1;
                    var pos = Object.keys(room.monsters).length - 1 - mCounter;
                    sprite_1.x = 2.5 + (pos % 3) * (Gfx.MAP_TOKEN_IMG_SIZE + 2.5) + p.x * Gfx.ROOM_IMG_SIZE + Gfx.MAP_TOKEN_IMG_SIZE / 2;
                    sprite_1.y = 2.5 + Math.floor(pos / 3) * (Gfx.MAP_TOKEN_IMG_SIZE + 2.5) + p.y * Gfx.ROOM_IMG_SIZE + Gfx.MAP_TOKEN_IMG_SIZE / 2;
                    mCounter++;
                }
                if (room.treasure && !room.treasure.def.canPick) {
                    var sprite_2 = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + room.treasure.def.name + '.png'));
                    sprite_2.anchor.set(0.5);
                    mapTokensCont.addChild(sprite_2);
                    _this.treasures[room.treasure.id] = sprite_2;
                    var pos = Object.keys(room.monsters).length;
                    sprite_2.x = 2.5 + (pos % 3) * (Gfx.MAP_TOKEN_IMG_SIZE + 2.5) + p.x * Gfx.ROOM_IMG_SIZE + Gfx.MAP_TOKEN_IMG_SIZE / 2;
                    sprite_2.y = 2.5 + Math.floor(pos / 3) * (Gfx.MAP_TOKEN_IMG_SIZE + 2.5) + p.y * Gfx.ROOM_IMG_SIZE + Gfx.MAP_TOKEN_IMG_SIZE / 2;
                }
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
                        mapCont.addChild(sprite);
                    }
                    else {
                        var shape = new PIXI.Graphics();
                        shape.beginFill(0x222222);
                        shape.lineStyle(1, 0x000000);
                        shape.drawRect(1, 1, Gfx.ROOM_IMG_SIZE - 2, Gfx.ROOM_IMG_SIZE - 2);
                        mapCont.addChild(shape);
                        shape.x = x;
                        shape.y = y;
                    }
                }
            }
            // Menu
            var createMenu = function () {
                var menu = new PIXI.Container();
                menu.fixedWidth = stage.fixedWidth / 2 - 20 - mapCont.fixedWidth / 2;
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
            Object.keys(Catacombs.EquipmentDef.defsByName).forEach(function (name, i) {
                var def = Catacombs.EquipmentDef.defsByName[name];
                var token = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + name + '_token.png'));
                token.x = 10;
                token.y = 10 + i * (Gfx.UI_TOKEN_IMG_SIZE + 10);
                lmenuLastY = token.y;
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
            Object.keys(Catacombs.TreasureDef.defsByName).forEach(function (name, i) {
                var def = Catacombs.TreasureDef.defsByName[name];
                if (!def.canBuy)
                    return;
                var token = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + name + '.png'));
                token.x = 10;
                token.y = lmenuLastY + Gfx.UI_TOKEN_IMG_SIZE + 20 + i * (Gfx.UI_TOKEN_IMG_SIZE + 10);
                lmenu.addChild(token);
                var text = new PIXI.Text(" = " + def.price + "c", { fontFamily: 'Arial', fontSize: 34 + "px", fill: 0xd29e36 });
                text.anchor.set(0, 0.5);
                text.x = token.x + Gfx.UI_TOKEN_IMG_SIZE + 10;
                text.y = token.y + Gfx.UI_TOKEN_IMG_SIZE / 2;
                lmenu.addChild(text);
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
            // player icons
            proc.players.forEach(function (player, i) {
                var token = new PIXI.Sprite(PIXI.Texture.fromImage('images/player' + i + '_token.png'));
                mapTokensCont.addChild(token);
                token.anchor.set(0.5, 0.5);
                token.interactive = false;
                token.buttonMode = true;
                self.players[i] = token;
                token.x = 2.5 + (i % 3) * (Gfx.MAP_TOKEN_IMG_SIZE + 2.5) + player.mapx * Gfx.ROOM_IMG_SIZE + Gfx.MAP_TOKEN_IMG_SIZE / 2;
                token.y = 2.5 + Math.floor(i / 3) * (Gfx.MAP_TOKEN_IMG_SIZE + 2.5) + player.mapy * Gfx.ROOM_IMG_SIZE + Gfx.MAP_TOKEN_IMG_SIZE / 2;
                var playerMenuIcon = new PIXI.Sprite(PIXI.Texture.fromImage('images/player' + i + '.png'));
                playerMenuIcon.anchor.set(0.5, 0.5);
                rmenu.addChild(playerMenuIcon);
                playerMenuIcon.x = 10 + Gfx.UI_TOKEN_IMG_SIZE / 2;
                playerMenuIcon.y = 10 + 2 * i * (Gfx.UI_TOKEN_IMG_SIZE + 20) + Gfx.UI_TOKEN_IMG_SIZE / 2;
                Catacombs.EventBus.getInstance().registerConsumer(Catacombs.EventType.PLAYER_ACTIVATE, function (p) {
                    if (i != p.payload)
                        return;
                    self.questionMarks.forEach(function (q) { mapTokensCont.removeChild(q); });
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
                    mapCont.addChild(sprite);
                    sprite.x = token.x;
                    sprite.y = token.y;
                    sprite.anchor.set(0.5, 0.5);
                    self.deactivatePlayerTokens();
                    createjs.Tween.get(sprite).to({
                        y: token.y - 100
                    }, 500).call(function () {
                        mapCont.removeChild(sprite);
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
                    var room = self.proc.map.rooms.getValue(p.toX, p.toY);
                    var pos = Object.keys(room.monsters).length + Object.keys(room.players).length + (room.treasure && !room.treasure.def.canPick ? 1 : 0) - 1;
                    var newX = 2.5 + (pos % 3) * (Gfx.MAP_TOKEN_IMG_SIZE + 2.5) + p.toX * Gfx.ROOM_IMG_SIZE + Gfx.MAP_TOKEN_IMG_SIZE / 2;
                    var newY = 2.5 + Math.floor(pos / 3) * (Gfx.MAP_TOKEN_IMG_SIZE + 2.5) + p.toY * Gfx.ROOM_IMG_SIZE + Gfx.MAP_TOKEN_IMG_SIZE / 2;
                    createjs.Tween.get(token)
                        .to({
                        x: newX,
                        y: newY
                    }, 200);
                });
                Catacombs.EventBus.getInstance().registerConsumer(Catacombs.EventType.ROOM_ITEM_OBTAINED, function (p) {
                    if (i != p.playerId)
                        return;
                    var sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + p.item.name + '.png'));
                    stage.addChild(sprite);
                    sprite.x = mapCont.x + Gfx.ROOM_IMG_SIZE * (p.room.mapx + 0.5);
                    sprite.y = mapCont.y + Gfx.ROOM_IMG_SIZE * (p.room.mapy + 0.5);
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
            Catacombs.EventBus.getInstance().registerConsumer(Catacombs.EventType.MONSTER_MOVE, function (p) {
                self.deactivatePlayerTokens();
                var token = self.monsters[p.monsterId];
                var monster = self.proc.monsters[p.monsterId];
                var room = self.proc.map.rooms.getValue(p.toX, p.toY);
                var pos = Object.keys(room.monsters).length + Object.keys(room.players).length + (room.treasure ? 1 : 0) - 1;
                var newX = 2.5 + (pos % 3) * (Gfx.MAP_TOKEN_IMG_SIZE + 2.5) + p.toX * Gfx.ROOM_IMG_SIZE + Gfx.MAP_TOKEN_IMG_SIZE / 2;
                var newY = 2.5 + Math.floor(pos / 3) * (Gfx.MAP_TOKEN_IMG_SIZE + 2.5) + p.toY * Gfx.ROOM_IMG_SIZE + Gfx.MAP_TOKEN_IMG_SIZE / 2;
                createjs.Tween.get(token)
                    .to({
                    x: newX,
                    y: newY
                }, 200);
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
                self.monsters.forEach(function (sprite, i) {
                    toBounce.push(sprite);
                    var text = new PIXI.Text("?", { fontFamily: 'Arial', fontWeight: 'bold', fontSize: 24, fill: 0xffff10 });
                    text.anchor.set(0.5, 0.5);
                    text.x = sprite.x;
                    text.y = sprite.y;
                    mapTokensCont.addChild(text);
                    toBounce.push(text);
                    self.questionMarks.push(text);
                    var onClick = function () {
                        self.controls.activeMonster = i;
                        sprite.interactive = false;
                        bounceStop();
                        self.questionMarks.forEach(function (q) { mapTokensCont.removeChild(q); });
                        self.questionMarks = [];
                        bounce([sprite]);
                        var room = self.proc.map.rooms.getValue(self.proc.monsters[i].mapx, self.proc.monsters[i].mapy);
                        room.players.forEach(function (player) {
                            var playerUI = self.players[player.id];
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
        Gfx.prototype.deactivateMonsterTokens = function () {
            this.monsters.forEach(function (monster) {
                monster.interactive = false;
                monster.scale.set(1, 1);
            });
        };
        Gfx.prototype.deactivatePlayerTokens = function () {
            this.players.forEach(function (player) {
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
