var Catacombs;
(function (Catacombs) {
    var Gfx = (function () {
        function Gfx(stage, controls, proc) {
            var _this = this;
            this.controls = controls;
            this.proc = proc;
            this.monsterSprites = new Array();
            this.questionMarks = new Array();
            var self = this;
            // Mapa
            var mapCont = new PIXI.Container();
            stage.addChild(mapCont);
            mapCont.fixedWidth = Gfx.ROOM_IMG_SIZE * proc.map.sideSize;
            mapCont.fixedHeight = Gfx.ROOM_IMG_SIZE * proc.map.sideSize;
            mapCont.x = stage.fixedWidth / 2 - mapCont.fixedWidth / 2;
            mapCont.y = stage.fixedHeight / 2 - mapCont.fixedHeight / 2;
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
                var mCounter = 0;
                for (var _i = 0, _a = room.monsters; _i < _a.length; _i++) {
                    var monster = _a[_i];
                    if (!monster)
                        continue;
                    var sprite_1 = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + monster.def.name + '_token.png'));
                    sprite_1.anchor.set(0.5);
                    mapCont.addChild(sprite_1);
                    _this.monsterSprites[monster.creatureId] = sprite_1;
                    sprite_1.x = Gfx.ROOM_IMG_SIZE * p.x + 10 + Gfx.TOKEN_IMG_SIZE / 2 + mCounter * (Gfx.TOKEN_IMG_SIZE + 10);
                    sprite_1.y = Gfx.ROOM_IMG_SIZE * p.y + 10 + Gfx.TOKEN_IMG_SIZE / 2;
                    mCounter++;
                }
                // let item = room.items[room.items.length - 1];
                // if (item) {
                //     let sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + item.def.name + '_token.png'));
                //     mapCont.addChild(sprite);
                //     sprite.x = Gfx.ROOM_IMG_SIZE * (p.x + 1) - 10 - Gfx.TOKEN_IMG_SIZE;
                //     sprite.y = Gfx.ROOM_IMG_SIZE * p.y + 10;
                // }
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
            // players (adventurers) icons
            proc.players.forEach(function (player, i) {
                var texture = PIXI.Texture.fromImage('images/player' + i + '.png');
                var token = new PIXI.Sprite(texture);
                mapCont.addChild(token);
                token.anchor.set(0.5, 0.5);
                token.x = mapCont.fixedWidth / 2;
                token.y = mapCont.fixedHeight / 2;
                var playerMenuIcon = new PIXI.Sprite(texture);
                playerMenuIcon.anchor.set(0.5, 0.5);
                rmenu.addChild(playerMenuIcon);
                playerMenuIcon.x = 10 + Gfx.TOKEN_IMG_SIZE / 2;
                playerMenuIcon.y = 10 + 2 * i * (Gfx.TOKEN_IMG_SIZE + 20) + Gfx.TOKEN_IMG_SIZE / 2;
                Catacombs.EventBus.getInstance().registerConsumer(Catacombs.EventType.PLAYER_ACTIVATE, function (p) {
                    if (i != p.payload)
                        return;
                    // to foreground
                    mapCont.removeChild(token);
                    mapCont.addChild(token);
                    self.questionMarks.forEach(function (q) { mapCont.removeChild(q); });
                    self.questionMarks = [];
                    bounce([token, playerMenuIcon]);
                });
                var healthUI = new PIXI.Container();
                rmenu.addChild(healthUI);
                healthUI.x = playerMenuIcon.x + Gfx.TOKEN_IMG_SIZE / 2 + 10;
                healthUI.y = playerMenuIcon.y - Gfx.TOKEN_IMG_SIZE / 2;
                for (var h = 0; h < player.health; h++) {
                    var sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/life.png'));
                    healthUI.addChild(sprite);
                    sprite.x = h * Gfx.TOKEN_IMG_SIZE / 2;
                }
                var invetoryUI = new PIXI.Container();
                rmenu.addChild(invetoryUI);
                invetoryUI.x = playerMenuIcon.x + Gfx.TOKEN_IMG_SIZE / 2 + 10;
                invetoryUI.y = playerMenuIcon.y + Gfx.TOKEN_IMG_SIZE / 2 + 10;
                Catacombs.EventBus.getInstance().registerConsumer(Catacombs.EventType.PLAYER_MOVE, function (p) {
                    if (i != p.playerId)
                        return;
                    // to foreground
                    mapCont.removeChild(token);
                    mapCont.addChild(token);
                    var newX = token.x + (p.x - player.mapx) * Gfx.ROOM_IMG_SIZE;
                    var newY = token.y + (p.y - player.mapy) * Gfx.ROOM_IMG_SIZE;
                    createjs.Tween.get(token)
                        .to({
                        x: newX,
                        y: newY
                    }, 200);
                });
                Catacombs.EventBus.getInstance().registerConsumer(Catacombs.EventType.ROOM_ITEM_OBTAINED, function (p) {
                    if (i != p.playerId)
                        return;
                    var sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + p.item.name + '_token.png'));
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
                        var sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + item.name + '_token.png'));
                        invetoryUI.addChild(sprite);
                        sprite.x = lastX;
                        lastX += Gfx.TOKEN_IMG_SIZE + 15;
                    }
                });
            });
            Catacombs.EventBus.getInstance().registerConsumer(Catacombs.EventType.MONSTER_MOVE, function (p) {
                var token = self.monsterSprites[p.monsterId];
                // to foreground
                mapCont.removeChild(token);
                mapCont.addChild(token);
                var monster = self.proc.monsters[p.monsterId];
                var newX = token.x + (p.x - monster.mapx) * Gfx.ROOM_IMG_SIZE;
                var newY = token.y + (p.y - monster.mapy) * Gfx.ROOM_IMG_SIZE;
                createjs.Tween.get(token)
                    .to({
                    x: newX,
                    y: newY
                }, 200);
                return false;
            });
            // dungeon keeper icon
            var texture = PIXI.Texture.fromImage('images/keeper_token.png');
            var keeperIcon = new PIXI.Sprite(texture);
            keeperIcon.anchor.set(0.5, 0.5);
            rmenu.addChild(keeperIcon);
            keeperIcon.x = 10 + Gfx.TOKEN_IMG_SIZE / 2;
            keeperIcon.y = 10 + 2 * proc.players.length * (Gfx.TOKEN_IMG_SIZE + 20) + Gfx.TOKEN_IMG_SIZE / 2;
            var skip = new PIXI.Text("Přeskočit tah (mezerník)", { fontFamily: 'Arial', fontSize: 24, fill: 0xffff10 });
            rmenu.addChild(skip);
            skip.anchor.set(0.5, 0.5);
            skip.x = rmenu.fixedWidth / 2;
            skip.y = rmenu.fixedHeight / 2;
            skip.interactive = true;
            skip.buttonMode = true;
            skip.on("click", function () { self.controls.next(); });
            Catacombs.EventBus.getInstance().registerConsumer(Catacombs.EventType.KEEPER_ACTIVATE, function (p) {
                var toBounce = [keeperIcon];
                self.monsterSprites.forEach(function (sprite, i) {
                    toBounce.push(sprite);
                    var text = new PIXI.Text("?", { fontFamily: 'Arial', fontWeight: 'bold', fontSize: 24, fill: 0xffff10 });
                    text.anchor.set(0.5, 0.5);
                    text.x = sprite.x;
                    text.y = sprite.y;
                    mapCont.addChild(text);
                    toBounce.push(text);
                    self.questionMarks.push(text);
                    var onClick = function () {
                        self.controls.activeMonster = i;
                        sprite.interactive = false;
                        bounceStop();
                        self.questionMarks.forEach(function (q) { mapCont.removeChild(q); });
                        self.questionMarks = [];
                        bounce([sprite]);
                    };
                    sprite.interactive = true;
                    sprite.on('click', onClick);
                    text.interactive = true;
                    text.on('click', onClick);
                    sprite.buttonMode = true;
                    sprite.defaultCursor = 'pointer';
                    text.buttonMode = true;
                    text.defaultCursor = 'pointer';
                });
                bounce(toBounce);
                return false;
            });
        }
        return Gfx;
    }());
    Gfx.ROOM_IMG_SIZE = 100;
    Gfx.TOKEN_IMG_SIZE = 30;
    Catacombs.Gfx = Gfx;
})(Catacombs || (Catacombs = {}));
