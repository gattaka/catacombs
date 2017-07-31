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
            // Sprites v místnosti (monstra, hráči, truhly)
            this.roomSprites = new Catacombs.Array2D();
            // Sprite/Pozadí samotné místnosti
            this.roomCellSprites = new Catacombs.Array2D();
            this.playerRoomSpriteById = new Array();
            this.monsterRoomSpriteById = new Array();
            this.treasureRoomSpriteById = new Array();
            this.playerEquipment = new Array();
            this.mapCont = new PIXI.Container();
            this.mapTokensCont = new PIXI.Container();
            this.tweenBounces = new Array();
            this.monsterChooseMarks = new Array();
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
                    var sprite_1 = new RoomSprite(monster.def.file + '_token.png', roomSprites.length);
                    _this.monsterRoomSpriteById[monster.id] = sprite_1;
                    roomSprites.push(sprite_1);
                    _this.initMonsterSprite(monster);
                }
                if (room.treasure && !room.treasure.def.canPick) {
                    var sprite_2 = new RoomSprite(room.treasure.def.file + '.png', roomSprites.length);
                    _this.treasureRoomSpriteById[room.treasure.id] = sprite_2;
                    roomSprites.push(sprite_2);
                }
                self.drawRoomTokens(p.x, p.y);
                return false;
            });
            for (var mapy = 0; mapy < proc.map.sideSize; mapy++) {
                for (var mapx = 0; mapx < proc.map.sideSize; mapx++) {
                    var x = mapx * Gfx.ROOM_IMG_SIZE;
                    var y = mapy * Gfx.ROOM_IMG_SIZE;
                    var cont = new PIXI.Container();
                    cont.x = x;
                    cont.y = y;
                    if (mapx == proc.map.center && mapy == proc.map.center) {
                        var room = proc.map.rooms.getValue(mapx, mapy);
                        var sprite = new PIXI.Sprite(room.def.tex);
                        cont.addChild(sprite);
                    }
                    else {
                        var shape = new PIXI.Graphics();
                        shape.beginFill(0x222222);
                        shape.lineStyle(1, 0x000000);
                        shape.drawRect(1, 1, Gfx.ROOM_IMG_SIZE - 2, Gfx.ROOM_IMG_SIZE - 2);
                        cont.addChild(shape);
                    }
                    self.roomCellSprites.setValue(mapx, mapy, cont);
                    self.mapCont.addChild(cont);
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
            Object.keys(Catacombs.EquipmentDef.defsByType).forEach(function (type, i) {
                var def = Catacombs.EquipmentDef.defsByType[type];
                var token = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + def.file + '.png'));
                token.x = 10;
                token.y = lmenuLastY + 10;
                lmenuLastY = token.y + Gfx.UI_TOKEN_IMG_SIZE;
                lmenu.addChild(token);
                var buyBtn = self.createBtn("Koupit za " + def.price + "c", 0xd29e36, lmenu.fixedWidth - 30 - Gfx.UI_TOKEN_IMG_SIZE, 30, function () {
                    var activePlayer = self.controls.activePlayer;
                    if (!self.controls.activeKeeper) {
                        var player = proc.players[activePlayer];
                        if (player.treasureSum >= def.price && !player.treasure[Catacombs.EquipmentType[def.type]] && def.availableInstances > 0) {
                            player.buy(def);
                        }
                    }
                });
                buyBtn.x = token.x + 10 + Gfx.UI_TOKEN_IMG_SIZE;
                buyBtn.y = token.y + Gfx.UI_TOKEN_IMG_SIZE / 2 - buyBtn.getBounds().height / 2;
                lmenu.addChild(buyBtn);
            });
            // Ceník
            Object.keys(Catacombs.TreasureDef.defsByType).forEach(function (type, i) {
                var def = Catacombs.TreasureDef.defsByType[type];
                if (!def.canBuy)
                    return;
                var token = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + def.file + '.png'));
                token.x = 10;
                token.y = lmenuLastY + 10;
                lmenuLastY = token.y + Gfx.UI_TOKEN_IMG_SIZE;
                lmenu.addChild(token);
                var text = new PIXI.Text(" = " + def.price + "c", { fontFamily: Gfx.FONT, fontSize: 34 + "px", fill: 0xd29e36 });
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
                if (logTexts.length + 1 > logBox.fixedHeight / (logFontSizePX + 10)) {
                    var oldText = logTexts.shift();
                    if (oldText)
                        logBox.removeChild(oldText);
                }
                var text = new PIXI.Text("- " + p.payload, { fontFamily: Gfx.FONT, fontSize: logFontSizePX + "px", fill: 0xd29e36 });
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
            var mapCenter = self.proc.map.center;
            var centerRoomSprites = new Array();
            self.roomSprites.setValue(mapCenter, mapCenter, centerRoomSprites);
            // player icons
            proc.players.forEach(function (player, i) {
                var playerRoomSprite = new RoomSprite('player' + i + '_token.png', centerRoomSprites.length);
                playerRoomSprite.interactive = false;
                playerRoomSprite.buttonMode = true;
                // na plochu bude přidáno jednotně mimo tento cykl
                centerRoomSprites.push(playerRoomSprite);
                self.playerRoomSpriteById[i] = playerRoomSprite;
                var playerMenuIcon = new PIXI.Sprite(PIXI.Texture.fromImage('images/player' + i + '.png'));
                playerMenuIcon.anchor.set(0.5, 0.5);
                rmenu.addChild(playerMenuIcon);
                playerMenuIcon.x = 10 + Gfx.UI_TOKEN_IMG_SIZE / 2;
                playerMenuIcon.y = 10 + 2 * i * (Gfx.UI_TOKEN_IMG_SIZE + 20) + Gfx.UI_TOKEN_IMG_SIZE / 2;
                Catacombs.EventBus.getInstance().registerConsumer(Catacombs.EventType.PLAYER_ACTIVATE, function (p) {
                    if (i != p.payload)
                        return;
                    _this.bounce([playerRoomSprite, playerMenuIcon]);
                    _this.enableMonstersToBeHit(player.mapx, player.mapy);
                    _this.removeMonsterChooseMarks();
                    // TODO pokud má hráč lockpicks, může procházet mřížemi
                    _this.enableRoomsForTravel(player.mapx, player.mapy, false, true);
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
                var equipmentUI = new PIXI.Container();
                self.playerEquipment[player.id] = equipmentUI;
                rmenu.addChild(equipmentUI);
                equipmentUI.x = healthUI.x + (healthUI.getBounds().width) * 3 + 10;
                equipmentUI.y = healthUI.y;
                var treasureUI = new PIXI.Container();
                rmenu.addChild(treasureUI);
                treasureUI.x = playerMenuIcon.x + Gfx.UI_TOKEN_IMG_SIZE / 2 + 10;
                treasureUI.y = playerMenuIcon.y + Gfx.UI_TOKEN_IMG_SIZE / 2 + 10;
                playerRoomSprite.on("mouseover", function () {
                    playerRoomSprite.scale.set(1.5, 1.5);
                });
                playerRoomSprite.on("mouseout", function () {
                    playerRoomSprite.scale.set(1, 1);
                });
                playerRoomSprite.on("click", function () {
                    // Nestvůra útočí na daného hráče
                    self.hitPlayer(player, playerRoomSprite, healthUI, playerMenuIcon);
                });
                Catacombs.EventBus.getInstance().registerConsumer(Catacombs.EventType.PLAYER_MOVE, function (p) {
                    if (i != p.playerId)
                        return;
                    var sprite = self.playerRoomSpriteById[p.playerId];
                    self.moveSprite(sprite, p.fromX, p.fromY, p.toX, p.toY);
                    self.enableMonstersToBeHit(p.toX, p.toY);
                    // TODO pokud má hráč lockpicks, může procházet mřížemi
                    self.enableRoomsForTravel(p.toX, p.toY, false, true);
                    return false;
                });
                Catacombs.EventBus.getInstance().registerConsumer(Catacombs.EventType.ROOM_ITEM_OBTAINED, function (p) {
                    if (i != p.playerId)
                        return;
                    var sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + p.item.file + '.png'));
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
                    // Treasure inv
                    treasureUI.removeChildren();
                    var lastX = 0;
                    for (var key in player.treasure) {
                        var item = player.treasure[key];
                        if (item.amount <= 0)
                            continue;
                        var sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + item.def.file + '.png'));
                        treasureUI.addChild(sprite);
                        sprite.x = lastX;
                        sprite.y = 0;
                        if (item.amount > 1) {
                            var text = new PIXI.Text(item.amount + "x", { stroke: 0x0, strokeThickness: 4, fontFamily: Gfx.FONT, fontWeight: 'bold', fontSize: 24, fill: 0xd29e36 });
                            text.anchor.set(0, 1);
                            treasureUI.addChild(text);
                            text.x = lastX;
                            text.y = Gfx.UI_TOKEN_IMG_SIZE + 5; // TODO tohle by mělo vycházet i bez toho +5
                        }
                        lastX += Gfx.UI_TOKEN_IMG_SIZE * 0.75;
                    }
                    // Equipment inv
                    equipmentUI.removeChildren();
                    lastX = 0;
                    for (var key in player.equipment) {
                        var item = player.equipment[key];
                        var sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + item.file + '.png'));
                        equipmentUI.addChild(sprite);
                        sprite.x = lastX;
                        sprite.y = 0;
                        lastX += Gfx.UI_TOKEN_IMG_SIZE + 5;
                    }
                });
            });
            // aby se přidali tokeny hráčů
            self.drawRoomTokens(mapCenter, mapCenter);
            Catacombs.EventBus.getInstance().registerConsumer(Catacombs.EventType.MONSTER_MOVE, function (p) {
                self.deactivatePlayerRoomSprites();
                var sprite = self.monsterRoomSpriteById[p.monsterId];
                self.moveSprite(sprite, p.fromX, p.fromY, p.toX, p.toY);
                self.enablePlayersToBeHit(p.toX, p.toY);
                // netvoři nemohou prcházet mřížemi a nemohou objevovat místnosti
                self.enableRoomsForTravel(p.toX, p.toY, false, false);
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
                self.proc.monsters.forEach(function (monster) {
                    var sprite = self.monsterRoomSpriteById[monster.id];
                    sprite.interactive = true;
                    sprite.buttonMode = true;
                    var text = new PIXI.Text("?", { fontFamily: Gfx.FONT, fontSize: 25 + "px", fill: 0xffffff });
                    sprite.parent.addChild(text);
                    text.anchor.set(0.5, 0.5);
                    text.x = sprite.x;
                    text.y = sprite.y - Gfx.MAP_TOKEN_IMG_SIZE;
                    toBounce.push(text);
                    _this.monsterChooseMarks.push(text);
                });
                _this.bounce(toBounce);
                _this.deactivatePlayerRoomSprites();
                return false;
            });
        }
        Gfx.prototype.bounceStop = function () {
            this.tweenBounces.forEach(function (t) {
                createjs.Tween.removeTweens(t.scale);
                t.scale.set(1, 1);
            });
            this.tweenBounces = [];
        };
        Gfx.prototype.bounce = function (sprites) {
            var _this = this;
            this.bounceStop();
            sprites.forEach(function (s, i) {
                _this.tweenBounces[i] = s;
                s.scale.set(1, 1);
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
        Gfx.prototype.initMonsterSprite = function (monster) {
            var _this = this;
            var sprite = this.monsterRoomSpriteById[monster.id];
            var onClick = function () {
                if (_this.controls.activeKeeper) {
                    _this.chooseMonster(monster, sprite);
                }
                else {
                    _this.hitMonster(monster, sprite);
                }
            };
            sprite.on('click', onClick);
            sprite.on("mouseover", function () {
                sprite.scale.set(1.5, 1.5);
            });
            sprite.on("mouseout", function () {
                sprite.scale.set(1, 1);
            });
            sprite.buttonMode = true;
        };
        Gfx.prototype.createBtn = function (caption, color, width, height, onClick) {
            var btn = new PIXI.Container();
            btn.interactive = true;
            btn.buttonMode = true;
            btn.on("click", onClick);
            btn.on("mouseover", function () { btn.alpha = 0.7; });
            btn.on("mouseout", function () { btn.alpha = 1; });
            var text = new PIXI.Text(caption, { fontFamily: Gfx.FONT, fontSize: height - 10 + "px", fill: color });
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
        Gfx.prototype.unregisterSpriteFromRoom = function (sprite, fromX, fromY) {
            var fromRoomSprites = this.roomSprites.getValue(fromX, fromY);
            // vytáhni sprite z pořadníku staré místnosti a sniž pořadí všech sprites, 
            // co byly v pořadí za ním (budou se posouvat na jeho místo)
            fromRoomSprites.splice(sprite.roomPos, 1);
            for (var i = sprite.roomPos; i < fromRoomSprites.length; i++) {
                fromRoomSprites[i].roomPos--;
            }
        };
        Gfx.prototype.registerSpriteToRoom = function (sprite, toX, toY) {
            // zapiš sprite na konec pořadníku nové místnosti
            var toRoomSprites = this.roomSprites.getValue(toX, toY);
            sprite.roomPos = toRoomSprites.length;
            toRoomSprites.push(sprite);
        };
        Gfx.prototype.moveSprite = function (sprite, fromX, fromY, toX, toY) {
            this.unregisterSpriteFromRoom(sprite, fromX, fromY);
            this.registerSpriteToRoom(sprite, toX, toY);
            // překresli s animací sprites v místnostech
            this.drawRoomTokens(fromX, fromY);
            this.drawRoomTokens(toX, toY);
        };
        Gfx.prototype.deactivateMonsterRoomSprites = function () {
            this.monsterRoomSpriteById.forEach(function (monster) {
                monster.interactive = false;
                monster.scale.set(1, 1);
            });
        };
        Gfx.prototype.deactivatePlayerRoomSprites = function () {
            this.playerRoomSpriteById.forEach(function (player) {
                player.interactive = false;
                player.scale.set(1, 1);
            });
        };
        Gfx.prototype.deactivateRooms = function () {
            this.roomCellSprites.forEach(function (cont) {
                if (cont.children.length > 1)
                    cont.removeChildAt(1);
            });
        };
        Gfx.prototype.enableRoomsForTravel = function (mapx, mapy, ignoreBars, canExplore) {
            var _this = this;
            this.deactivateRooms();
            // TODO podmínka dostupnosti (zeď, mříž bez paklíče...)?
            // x, y, fromMask, toMask
            var directions = [
                [-1, 0, 1, 4],
                [1, 0, 4, 1],
                [0, -1, 8, 2],
                [0, 1, 2, 8]
            ];
            directions.forEach(function (direction) {
                var movement = new Catacombs.Movement(direction[2], direction[3], mapx, mapy, mapx + direction[0], mapy + direction[1]);
                var roomCellSprite = _this.roomCellSprites.getValue(movement.toX, movement.toY);
                if (!_this.proc.map.canTravel(movement, ignoreBars, canExplore))
                    return;
                var shape = new PIXI.Graphics();
                var drawBorder = function (color) {
                    shape.clear();
                    shape.beginFill(color, 0.2);
                    shape.drawRect(0, 0, Gfx.ROOM_IMG_SIZE, Gfx.ROOM_IMG_SIZE);
                };
                var drawDefaultBorder = function () {
                    drawBorder(0x11aa00);
                };
                drawDefaultBorder();
                roomCellSprite.addChild(shape);
                roomCellSprite.interactive = true;
                roomCellSprite.buttonMode = true;
                roomCellSprite.on("mouseover", function () {
                    drawBorder(0xaabb00);
                });
                roomCellSprite.on("mouseout", function () {
                    drawDefaultBorder();
                });
                roomCellSprite.on("click", function () {
                    _this.controls.move(movement);
                });
            });
        };
        Gfx.prototype.chooseMonster = function (monster, sprite) {
            // vybírám netvora v tahu keepera
            this.controls.activeMonster = monster.id;
            this.bounceStop();
            this.bounce([sprite]);
            this.deactivateMonsterRoomSprites();
            this.enablePlayersToBeHit(monster.mapx, monster.mapy);
            this.removeMonsterChooseMarks();
            // netvoři nemohou prcházet mřížemi a nemohou objevovat místnosti
            this.enableRoomsForTravel(monster.mapx, monster.mapy, false, false);
        };
        Gfx.prototype.removeMonsterChooseMarks = function () {
            this.monsterChooseMarks.forEach(function (m) {
                m.parent.removeChild(m);
            });
            this.monsterChooseMarks = [];
        };
        Gfx.prototype.enableMonstersToBeHit = function (mapx, mapy) {
            var _this = this;
            // Umožni útočit na netvory ve stejné místnosti
            this.deactivateMonsterRoomSprites();
            var room = this.proc.map.rooms.getValue(mapx, mapy);
            room.monsters.forEach(function (monster) {
                if (!monster)
                    return;
                var monsterUI = _this.monsterRoomSpriteById[monster.id];
                monsterUI.interactive = true;
            });
        };
        /**
         * Útok na netvora
         */
        Gfx.prototype.hitMonster = function (monster, monsterRoomSprite) {
            var currentPlayer = this.proc.players[this.controls.activePlayer];
            // útok je daný aktuálním útočníkem -- ten může útočit i z jiné mísnosti, 
            // než je cílový netvor
            var deployedAttack = currentPlayer.attack;
            // a k tom útokem všech hráčů v místnosti, kde je netvor, na kterého útočím
            var monsterRoom = this.proc.map.rooms.getValue(monster.mapx, monster.mapy);
            monsterRoom.players.forEach(function (p) {
                if (p != currentPlayer)
                    deployedAttack += p.attack;
            });
            if (deployedAttack > monster.def.defense) {
                this.animateObjectFadeAway(monsterRoomSprite, monsterRoomSprite.x, monsterRoomSprite.y);
                this.unregisterSpriteFromRoom(monsterRoomSprite, monster.mapx, monster.mapy);
                this.drawRoomTokens(monster.mapx, monster.mapy);
                this.deactivateMonsterRoomSprites();
                delete this.monsterRoomSpriteById[monster.id];
                this.proc.killMonster(monster);
                this.controls.next();
            }
            else {
                this.createFadeText("NEÚČINNÉ", monsterRoomSprite.x, monsterRoomSprite.y);
            }
        };
        Gfx.prototype.enablePlayersToBeHit = function (mapx, mapy) {
            var _this = this;
            // Umožni útočit na živé hráče ve stejné místnosti
            this.deactivatePlayerRoomSprites();
            var room = this.proc.map.rooms.getValue(mapx, mapy);
            room.players.forEach(function (player) {
                if (player.health == 0)
                    return;
                var playerUI = _this.playerRoomSpriteById[player.id];
                playerUI.interactive = true;
            });
        };
        Gfx.prototype.hitPlayer = function (player, playerRoomSprite, healthUI, playerMenuIcon) {
            var currentMonster = this.proc.monsters[this.controls.activeMonster];
            if (currentMonster.def.attack > player.defense) {
                this.createFadeSprite('images/life_token.png', playerRoomSprite.x, playerRoomSprite.y);
                this.deactivatePlayerRoomSprites();
                player.health--;
                healthUI.removeChildAt(healthUI.children.length - 1);
                if (player.health == 0) {
                    playerRoomSprite.texture = PIXI.Texture.fromImage('images/player' + player.id + '_tomb_token.png');
                    playerMenuIcon.texture = PIXI.Texture.fromImage('images/player' + player.id + '_tomb.png');
                }
                this.controls.next();
            }
            else {
                this.createFadeText("NEÚČINNÉ", playerRoomSprite.x, playerRoomSprite.y);
            }
        };
        Gfx.prototype.createFadeText = function (message, x, y) {
            var text = new PIXI.Text(message, { fontFamily: Gfx.FONT, fontSize: 25 + "px", fill: 0xffffff });
            this.createFadeAwayObject(text, x, y);
            this.mapCont.addChild(text);
        };
        Gfx.prototype.createFadeSprite = function (spriteName, x, y) {
            var sprite = new PIXI.Sprite(PIXI.Texture.fromImage(spriteName));
            this.createFadeAwayObject(sprite, x, y);
            this.mapCont.addChild(sprite);
        };
        Gfx.prototype.createFadeAwayObject = function (obj, x, y) {
            var self = this;
            obj.x = x;
            obj.y = y - Gfx.MAP_TOKEN_IMG_SIZE;
            obj.anchor.set(0.5, 0.5);
            this.animateObjectFadeAway(obj, x, obj.y);
        };
        Gfx.prototype.animateObjectFadeAway = function (obj, x, y) {
            var self = this;
            createjs.Tween.get(obj).to({
                y: y - 50
            }, 800).call(function () {
                obj.parent.removeChild(obj);
            });
            createjs.Tween.get(obj).wait(300).to({
                alpha: 0
            }, 200);
        };
        return Gfx;
    }());
    Gfx.ROOM_IMG_SIZE = 100;
    Gfx.MAP_TOKEN_IMG_SIZE = 30;
    Gfx.UI_TOKEN_IMG_SIZE = 60;
    Gfx.FONT = 'Tahoma';
    Catacombs.Gfx = Gfx;
})(Catacombs || (Catacombs = {}));
