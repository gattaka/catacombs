namespace Catacombs {

    class RoomSprite extends PIXI.Sprite {
        constructor(texture: string, public roomPos: number) {
            super(PIXI.Texture.fromImage('images/' + texture))
        }
    }

    export class Gfx {

        private static FONT = 'Tahoma';

        // Sprites v místnosti (monstra, hráči, truhly)
        private roomSprites = new Array2D<Array<RoomSprite>>();

        // Sprite/Pozadí samotné místnosti
        private roomCellContainers = new Array2D<PIXI.Container>();

        private playerRoomSpriteById = new Array<RoomSprite>();
        private monsterRoomSpriteById = new Array<RoomSprite>();
        private treasureRoomSpriteById = new Array<RoomSprite>();

        private playerEquipment = new Array<PIXI.Container>();

        private mapCont = new PIXI.Container();
        private mapTokensCont = new PIXI.Container();

        private tweenBounces = new Array<PIXI.DisplayObject>();

        private getRoomImgSize() {
            // return Game.getInstance().getRatio() * 100;
            return 100;
        }

        private getMapTokenImgSize() {
            // return Game.getInstance().getRatio() * 30;
            return 30;
        }

        private getUITokenImgSize() {
            // return Game.getInstance().getRatio() * 60;
            return 60;
        }

        constructor(stage: PIXI.Container, private proc: Proc) {
            let self = this;

            // Mapa
            stage.addChild(self.mapCont);
            stage.addChild(self.mapTokensCont);
            self.mapCont.fixedWidth = self.mapTokensCont.fixedWidth = self.getRoomImgSize() * proc.map.sideSize;
            self.mapCont.fixedHeight = self.mapTokensCont.fixedHeight = self.getRoomImgSize() * proc.map.sideSize;
            self.mapCont.x = self.mapTokensCont.x = stage.fixedWidth / 2 - self.mapCont.fixedWidth / 2;
            self.mapCont.y = self.mapTokensCont.y = stage.fixedHeight / 2 - self.mapCont.fixedHeight / 2;

            EventBus.getInstance().registerConsumer(EventType.ROOM_REVEALED, (p: TupleEventPayload): boolean => {
                // odstraň shape/gfx s předchozí blank-room -- sice není vidět, ale je na ní 
                // stále clicklister, který dělá nepořádek v možnostech pohybu postav 
                let oldCont = self.roomCellContainers.getValue(p.x, p.y);
                if (oldCont) oldCont.parent.removeChild(oldCont);

                let cont = new PIXI.Container();
                cont.x = self.getRoomImgSize() * p.x;
                cont.y = self.getRoomImgSize() * p.y;
                self.mapCont.addChild(cont);
                self.roomCellContainers.setValue(p.x, p.y, cont);

                let room = proc.map.rooms.getValue(p.x, p.y);
                let sprite = new PIXI.Sprite(room.def.tex);
                sprite.anchor.set(0.5);
                sprite.rotation = room.rotation;
                sprite.x = self.getRoomImgSize() * 0.5;
                sprite.y = self.getRoomImgSize() * 0.5;
                cont.addChild(sprite);

                sprite.alpha = 0;
                createjs.Tween.get(sprite)
                    .to({
                        alpha: 1
                    }, 200);

                let roomSprites = new Array<RoomSprite>();
                self.roomSprites.setValue(p.x, p.y, roomSprites);
                for (let monster of room.monsters) {
                    if (!monster)
                        continue;
                    let sprite = new RoomSprite(monster.def.file + '_token.png', roomSprites.length);
                    this.monsterRoomSpriteById[monster.id] = sprite;
                    roomSprites.push(sprite);
                    this.initMonsterSprite(monster);
                }
                if (room.treasure && !room.treasure.def.canPick) {
                    let sprite = new RoomSprite(room.treasure.def.file + '.png', roomSprites.length);
                    this.treasureRoomSpriteById[room.treasure.id] = sprite;
                    roomSprites.push(sprite);
                }
                self.drawRoomTokens(p.x, p.y);
                return false;
            });

            let center = Math.floor(proc.map.sideSize / 2);
            for (let mapy = 0; mapy < proc.map.sideSize; mapy++) {
                for (let mapx = 0; mapx < proc.map.sideSize; mapx++) {
                    let x = mapx * self.getRoomImgSize();
                    let y = mapy * self.getRoomImgSize();
                    let cont = new PIXI.Container();
                    cont.x = x;
                    cont.y = y;
                    if (mapx == proc.map.center && mapy == proc.map.center) {
                        let room = proc.map.rooms.getValue(mapx, mapy);
                        let sprite = new PIXI.Sprite(room.def.tex);
                        cont.addChild(sprite);
                    } else {
                        let shape = new PIXI.Graphics();
                        let cx = Math.abs(mapx - center);
                        let cy = Math.abs(mapy - center);
                        let distance = Math.max(cx, cy);
                        switch (distance) {
                            case 0:
                            case 1:
                            case 2:
                                shape.beginFill(0x223322);
                                break;
                            case 3:
                                shape.beginFill(0x333322);
                                break;
                            case 4:
                                shape.beginFill(0x332222);
                                break;
                        }
                        shape.lineStyle(1, 0x000000);
                        shape.drawRect(1, 1, self.getRoomImgSize() - 2, self.getRoomImgSize() - 2);
                        cont.addChild(shape);
                    }
                    self.roomCellContainers.setValue(mapx, mapy, cont);
                    self.mapCont.addChild(cont);
                }
            }

            // Menu
            let createMenu = (): PIXI.Container => {
                let menu = new PIXI.Container();
                menu.fixedWidth = stage.fixedWidth / 2 - 20 - self.mapCont.fixedWidth / 2;
                menu.fixedHeight = stage.fixedHeight - 20;
                let shape = new PIXI.Graphics();
                shape.beginFill(0x222222);
                shape.lineStyle(1, 0x000000);
                shape.drawRect(1, 1, menu.fixedWidth, menu.fixedHeight);
                menu.addChild(shape);
                return menu;
            }

            // lmenu
            let lmenu = createMenu();
            stage.addChild(lmenu);
            lmenu.x = 10;
            lmenu.y = 10;
            let lmenuLastY = 0;

            // Obchod
            Object.keys(EquipmentDef.defsByType).forEach((type, i) => {
                let def = EquipmentDef.defsByType[type];
                let token = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + def.file + '.png'));
                token.x = 10;
                token.y = lmenuLastY + 10;
                lmenuLastY = token.y + self.getUITokenImgSize();
                lmenu.addChild(token);
                let buyBtn = self.createBtn("Koupit za " + def.price + "c", 0xd29e36, lmenu.fixedWidth - 30 - self.getUITokenImgSize(), 30, () => {
                    let activePlayer = self.proc.getActivePlayer();
                    if (!self.proc.isActiveKeeper()) {
                        let player = proc.players[activePlayer];
                        if (player.buy(def) && def.type == EquipmentType.LOCKPICK) {
                            // Pokud má hráč lockpick, může procházet mřížemi
                            self.enableRoomsForTravel(player.mapx, player.mapy, player.lockpick, true);
                        }
                    }
                });
                buyBtn.x = token.x + 10 + self.getUITokenImgSize();
                buyBtn.y = token.y + self.getUITokenImgSize() / 2 - buyBtn.getBounds().height / 2;
                lmenu.addChild(buyBtn);
            });

            // Ceník
            Object.keys(TreasureDef.defsByType).forEach((type, i) => {
                let def = TreasureDef.defsByType[type];
                if (!def.canBuy)
                    return;

                let itemsInCol = 2;
                let col = Math.floor(i / itemsInCol);
                let row = i % itemsInCol;
                if (row == 0 && col != 0)
                    lmenuLastY -= itemsInCol * (10 + self.getUITokenImgSize());

                let token = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + def.file + '.png'));
                token.x = 10 + col * lmenu.fixedWidth / 2;
                token.y = lmenuLastY + 10;
                lmenuLastY = token.y + self.getUITokenImgSize();
                lmenu.addChild(token);

                let text = new PIXI.Text(" = " + def.price + "c", { fontFamily: Gfx.FONT, fontSize: 34 + "px", fill: 0xd29e36 });
                text.anchor.set(0, 0.5);
                text.x = token.x + self.getUITokenImgSize() + 10;
                text.y = token.y + self.getUITokenImgSize() / 2;
                lmenu.addChild(text);
            });

            // Log
            let logFontSizePX = 20;
            let logBox = new PIXI.Container();
            logBox.x = 10;
            logBox.y = lmenuLastY + 10;
            logBox.fixedWidth = lmenu.fixedWidth - 20;
            logBox.fixedHeight = lmenu.fixedHeight - 10 - logBox.y
            let logBoxBgr = new PIXI.Graphics();
            logBoxBgr.beginFill(0x0);
            logBoxBgr.drawRect(0, 0, logBox.fixedWidth, logBox.fixedHeight);
            logBox.addChild(logBoxBgr);
            lmenu.addChild(logBox);
            let logTexts = new Array<PIXI.Text>();
            EventBus.getInstance().registerConsumer(EventType.LOG, (p: StringEventPayload): boolean => {
                if (logTexts.length + 1 > logBox.fixedHeight / (logFontSizePX + 10)) {
                    let oldText = logTexts.shift();
                    if (oldText)
                        logBox.removeChild(oldText);
                }
                let text = new PIXI.Text("- " + p.payload, { fontFamily: Gfx.FONT, fontSize: logFontSizePX + "px", fill: 0xd29e36 });
                logTexts.forEach(t => t.y -= text.getBounds().height + 5);
                logTexts.push(text);
                text.anchor.set(0, 1);
                text.x = 5;
                text.y = logBox.fixedHeight - 5;
                logBox.addChild(text);
                return false;
            });

            // rmenu
            let rmenu = createMenu();
            stage.addChild(rmenu);
            rmenu.x = stage.fixedWidth - 10 - rmenu.fixedWidth;
            rmenu.y = 10;

            let mapCenter = self.proc.map.center;
            let centerRoomSprites = new Array<RoomSprite>()
            self.roomSprites.setValue(mapCenter, mapCenter, centerRoomSprites);

            // player icons
            proc.players.forEach((player, i) => {
                let playerRoomSprite = new RoomSprite('player' + i + '_token.png', centerRoomSprites.length);
                playerRoomSprite.interactive = false;
                playerRoomSprite.buttonMode = true;
                // na plochu bude přidáno jednotně mimo tento cykl
                centerRoomSprites.push(playerRoomSprite);
                self.playerRoomSpriteById[i] = playerRoomSprite;

                let playerMenuIcon = new PIXI.Sprite(PIXI.Texture.fromImage('images/player' + i + '.png'));
                playerMenuIcon.anchor.set(0.5, 0.5);
                rmenu.addChild(playerMenuIcon);
                playerMenuIcon.x = 10 + self.getUITokenImgSize() / 2;
                playerMenuIcon.y = 10 + 2 * i * (self.getUITokenImgSize() + 20) + self.getUITokenImgSize() / 2;

                EventBus.getInstance().registerConsumer(EventType.PLAYER_ACTIVATE, (p: NumberEventPayload): boolean => {
                    if (i != p.payload)
                        return;
                    self.prepareUIForNext();
                    self.bounce([playerRoomSprite, playerMenuIcon]);
                    self.enableMonstersToBeHit(player.mapx, player.mapy);
                    // Pokud má hráč lockpick, může procházet mřížemi
                    self.enableRoomsForTravel(player.mapx, player.mapy, player.lockpick, true);
                });

                let healthUI = new PIXI.Container();
                rmenu.addChild(healthUI);
                healthUI.x = playerMenuIcon.x + self.getUITokenImgSize() / 2 + 10;
                healthUI.y = playerMenuIcon.y - self.getUITokenImgSize() / 2;
                let populateHealthUI = () => {
                    for (let h = 0; h < player.health; h++) {
                        let sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/life.png'));
                        healthUI.addChild(sprite);
                        sprite.x = h * self.getUITokenImgSize() / 2;
                    }
                }
                populateHealthUI();

                let equipmentUI = new PIXI.Container();
                self.playerEquipment[player.id] = equipmentUI;
                rmenu.addChild(equipmentUI);
                equipmentUI.x = healthUI.x + (player.health + 1) * self.getUITokenImgSize() / 2 + 10;
                equipmentUI.y = healthUI.y;

                let treasureUI = new PIXI.Container();
                rmenu.addChild(treasureUI);
                treasureUI.x = playerMenuIcon.x + self.getUITokenImgSize() / 2 + 10;
                treasureUI.y = playerMenuIcon.y + self.getUITokenImgSize() / 2 + 10;

                playerRoomSprite.on("mouseover", () => {
                    playerRoomSprite.scale.set(1.5, 1.5);
                });
                playerRoomSprite.on("mouseout", () => {
                    playerRoomSprite.scale.set(1, 1);
                });
                playerRoomSprite.on("click", () => {
                    // Nestvůra útočí na daného hráče
                    self.proc.attackPlayer(player, self.proc.getActiveMonster());
                });

                EventBus.getInstance().registerConsumer(EventType.PLAYER_HIT, (p: PlayerHitPayload): boolean => {
                    if (i != p.playerId)
                        return;
                    if (p.success) {
                        self.createFadeSprite('images/life_token.png', playerRoomSprite.x, playerRoomSprite.y);
                        healthUI.removeChildAt(healthUI.children.length - 1);
                        if (p.death) {
                            playerRoomSprite.texture = PIXI.Texture.fromImage('images/player' + player.id + '_tomb_token.png');
                            playerMenuIcon.texture = PIXI.Texture.fromImage('images/player' + player.id + '_tomb.png');
                        }
                    } else {
                        self.createFadeText("NEÚČINNÉ", playerRoomSprite.x, playerRoomSprite.y);
                    }
                });

                EventBus.getInstance().registerConsumer(EventType.PLAYER_MOVE, (p: PlayerMovePayload): boolean => {
                    if (i != p.playerId)
                        return;
                    self.prepareUIForNext();
                    let sprite = self.playerRoomSpriteById[p.playerId];
                    self.moveSprite(sprite, p.fromX, p.fromY, p.toX, p.toY);
                    self.bounce([playerRoomSprite, playerMenuIcon]);
                    self.enableMonstersToBeHit(p.toX, p.toY);
                    // Pokud má hráč lockpick, může procházet mřížemi
                    self.enableRoomsForTravel(p.toX, p.toY, player.lockpick, true);
                    return false;
                });

                EventBus.getInstance().registerConsumer(EventType.ROOM_ITEM_OBTAINED, (p: RoomItemObtainedPayload): boolean => {
                    if (i != p.playerId)
                        return;
                    let sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + p.item.file + '.png'));
                    stage.addChild(sprite);
                    sprite.x = self.mapCont.x + self.getRoomImgSize() * (p.room.mapx + 0.5);
                    sprite.y = self.mapCont.y + self.getRoomImgSize() * (p.room.mapy + 0.5);
                    createjs.Tween.get(sprite)
                        .to({
                            x: rmenu.x,
                            y: rmenu.y + playerMenuIcon.y
                        }, 300).call(() => {
                            stage.removeChild(sprite);
                            EventBus.getInstance().fireEvent(new NumberEventPayload(EventType.PLAYER_BAR_UPDATE, p.playerId));
                        });
                    return false;
                });

                EventBus.getInstance().registerConsumer(EventType.PLAYER_BAR_UPDATE, (p: NumberEventPayload): boolean => {
                    if (i != p.payload)
                        return;

                    // Health bar
                    healthUI.removeChildren();
                    populateHealthUI();

                    // Treasure inv
                    treasureUI.removeChildren();
                    let lastX = 0;
                    for (let key in player.treasure) {
                        let item = player.treasure[key];
                        if (item.amount <= 0)
                            continue;
                        let sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + item.def.file + '.png'));
                        treasureUI.addChild(sprite);
                        sprite.x = lastX;
                        sprite.y = 0;
                        if (item.amount > 1) {
                            let text = new PIXI.Text(item.amount + "x",
                                { stroke: 0x0, strokeThickness: 4, fontFamily: Gfx.FONT, fontWeight: 'bold', fontSize: 24, fill: 0xd29e36 });
                            text.anchor.set(0, 1);
                            treasureUI.addChild(text);
                            text.x = lastX;
                            text.y = self.getUITokenImgSize() + 5; // TODO tohle by mělo vycházet i bez toho +5
                        }
                        lastX += self.getUITokenImgSize() * 0.75;
                    }

                    // Equipment inv
                    equipmentUI.removeChildren();
                    lastX = 0;
                    for (let key in player.equipment) {
                        let item = player.equipment[key];
                        let sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + item.file + '.png'));
                        equipmentUI.addChild(sprite);
                        sprite.x = lastX;
                        sprite.y = 0;
                        lastX += self.getUITokenImgSize() + 5;
                    }
                });
            });

            // aby se přidali tokeny hráčů
            self.drawRoomTokens(mapCenter, mapCenter);

            // dungeon keeper icon
            let texture = PIXI.Texture.fromImage('images/keeper.png');
            let keeperIcon = new PIXI.Sprite(texture);
            keeperIcon.anchor.set(0.5, 0.5);
            rmenu.addChild(keeperIcon);
            keeperIcon.x = 10 + self.getUITokenImgSize() / 2;
            keeperIcon.y = 10 + 2 * proc.players.length * (self.getUITokenImgSize() + 20) + self.getUITokenImgSize() / 2;

            // let soulsUI = new PIXI.Container();
            // rmenu.addChild(soulsUI);
            // soulsUI.x = keeperIcon.x + self.getUITokenImgSize() / 2 + 10;
            // soulsUI.y = keeperIcon.y - self.getUITokenImgSize() / 2;
            // let populateSoulsUI = () => {
            //     for (let h = 0; h < self.proc.souls; h++) {
            //         let sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/soul.png'));
            //         soulsUI.addChild(sprite);
            //         sprite.x = h * self.getUITokenImgSize() / 2;
            //     }
            // }
            // populateSoulsUI();

            EventBus.getInstance().registerConsumer(EventType.MONSTER_MOVE, (p: MonsterMovePayload): boolean => {
                this.prepareUIForNext();
                let sprite = self.monsterRoomSpriteById[p.monsterId];
                self.bounce([sprite, keeperIcon]);
                self.moveSprite(sprite, p.fromX, p.fromY, p.toX, p.toY);
                self.enablePlayersToBeHit(p.toX, p.toY);
                // netvoři nemohou procházet mřížemi a nemohou objevovat místnosti
                self.enableRoomsForTravel(p.toX, p.toY, false, false);
                return false;
            });

            EventBus.getInstance().registerConsumer(EventType.MONSTER_ACTIVATE, (p: NumberEventPayload): boolean => {
                self.prepareUIForNext();
                let monster: Monster = self.proc.monsters[p.payload];
                let sprite: RoomSprite = self.monsterRoomSpriteById[p.payload];
                if (monster.def.type == MonsterType.ZOMBIE && monster.stunned) {
                    monster.stunned = false;
                    let monsterUI = self.monsterRoomSpriteById[monster.id];
                    monsterUI.alpha = 1;
                    self.createFadeText("OŽIVEN", monsterUI.x, monsterUI.y);
                    self.proc.next();
                } else {
                    self.bounce([sprite, keeperIcon]);
                    self.enablePlayersToBeHit(monster.mapx, monster.mapy);
                    // netvoři nemohou procházet mřížemi a nemohou objevovat místnosti
                    self.enableRoomsForTravel(monster.mapx, monster.mapy, false, false);
                }
                return false;
            });

            // Přeskočit tah btn
            let skipBtn = self.createBtn("Přeskočit tah", 0xd29e36, rmenu.fixedWidth, 30, () => {
                self.proc.next();
            });
            skipBtn.x = 10;
            skipBtn.y = keeperIcon.y + self.getUITokenImgSize() * 2;
            rmenu.addChild(skipBtn);
        }

        private bounceStop() {
            this.tweenBounces.forEach((t) => {
                createjs.Tween.removeTweens(t.scale);
                t.scale.set(1, 1);
            })
            this.tweenBounces = [];
        }

        private bounce(sprites: Array<PIXI.Sprite>) {
            this.bounceStop();
            sprites.forEach((s, i) => {
                this.tweenBounces[i] = s;
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
        }

        private initMonsterSprite(monster: Monster) {
            let sprite = this.monsterRoomSpriteById[monster.id]
            let onClick = () => {
                this.attackMonster(monster, sprite);
            };
            sprite.on('click', onClick);
            sprite.on("mouseover", () => {
                sprite.scale.set(1.5, 1.5);
            });
            sprite.on("mouseout", () => {
                sprite.scale.set(1, 1);
            });
            sprite.buttonMode = true;
        }

        private createBtn(caption: string, color: number, width: number, height: number, onClick: Function): PIXI.Container {
            let btn = new PIXI.Container();
            btn.interactive = true;
            btn.buttonMode = true;
            btn.on("click", onClick);
            btn.on("mouseover", () => { btn.alpha = 0.7; })
            btn.on("mouseout", () => { btn.alpha = 1; })

            let text = new PIXI.Text(caption, { fontFamily: Gfx.FONT, fontSize: height - 10 + "px", fill: color });
            text.anchor.set(0.5, 0);
            text.x = width / 2;
            text.y = 5;
            let bgr = new PIXI.Graphics();
            bgr.beginFill(color, 0.3);
            bgr.lineStyle(2, color);
            bgr.drawRoundedRect(0, 0, width - 20, text.height + 10, 5);
            btn.addChild(bgr);
            btn.addChild(text);
            return btn;
        }

        private drawRoomTokens(x: number, y: number) {
            let self = this;
            this.roomSprites.getValue(x, y).forEach((sprite, i) => {
                let newX = 2.5 + (i % 3) * (self.getMapTokenImgSize() + 2.5) + x * self.getRoomImgSize() + self.getMapTokenImgSize() / 2;
                let newY = 2.5 + Math.floor(i / 3) * (self.getMapTokenImgSize() + 2.5) + y * self.getRoomImgSize() + self.getMapTokenImgSize() / 2;
                if (sprite.parent) {
                    createjs.Tween.get(sprite)
                        .to({
                            x: newX,
                            y: newY
                        }, 200);
                } else {
                    sprite.anchor.set(0.5);
                    sprite.x = newX;
                    sprite.y = newY;
                    this.mapTokensCont.addChild(sprite);
                }
            });
        }

        private unregisterSpriteFromRoom(sprite: RoomSprite, fromX: number, fromY: number) {
            let fromRoomSprites = this.roomSprites.getValue(fromX, fromY);
            // vytáhni sprite z pořadníku staré místnosti a sniž pořadí všech sprites, 
            // co byly v pořadí za ním (budou se posouvat na jeho místo)
            fromRoomSprites.splice(sprite.roomPos, 1);
            for (let i = sprite.roomPos; i < fromRoomSprites.length; i++) {
                fromRoomSprites[i].roomPos--;
            }
        }

        private registerSpriteToRoom(sprite: RoomSprite, toX: number, toY: number) {
            // zapiš sprite na konec pořadníku nové místnosti
            let toRoomSprites = this.roomSprites.getValue(toX, toY);
            sprite.roomPos = toRoomSprites.length;
            toRoomSprites.push(sprite);
        }

        private moveSprite(sprite: RoomSprite, fromX: number, fromY: number, toX: number, toY: number) {
            this.unregisterSpriteFromRoom(sprite, fromX, fromY);
            this.registerSpriteToRoom(sprite, toX, toY);
            // překresli s animací sprites v místnostech
            this.drawRoomTokens(fromX, fromY);
            this.drawRoomTokens(toX, toY);
        }

        private enableRoomsForTravel(mapx: number, mapy: number, lockpick: boolean, canExplore: boolean) {
            let self = this;
            this.disableRoomsForTravel();
            let directions = [
                [0, -1, 0b1000, 0b0010], // N
                [1, 0, 0b0100, 0b0001], // E
                [0, 1, 0b0010, 0b1000], // S
                [-1, 0, 0b0001, 0b0100] // W
            ];
            directions.forEach((direction) => {
                let movement = new Movement(direction[2], direction[3], mapx, mapy, mapx + direction[0], mapy + direction[1]);
                let roomCellContainer = this.roomCellContainers.getValue(movement.toX, movement.toY);

                if (!this.proc.map.canTravel(movement, lockpick, canExplore))
                    return;
                let shape = new PIXI.Graphics();
                let drawFill = (color) => {
                    shape.clear();
                    shape.beginFill(color, 0.2);
                    shape.drawRect(0, 0, self.getRoomImgSize(), self.getRoomImgSize());
                }
                let drawDefaultFill = () => {
                    drawFill(0x11aa00);
                }
                drawDefaultFill();
                roomCellContainer.addChild(shape);
                shape.interactive = true;
                shape.buttonMode = true;
                shape.on("mouseover", () => {
                    drawFill(0xaabb00);
                });
                shape.on("mouseout", () => {
                    drawDefaultFill();
                });
                shape.on("click", () => {
                    this.proc.move(movement);
                });
            });
        }

        private disableRoomsForTravel() {
            this.roomCellContainers.forEach((cont: PIXI.Container) => {
                if (cont.children.length > 1) {
                    cont.removeChildAt(1);
                }
            });
        }

        private enableMonstersToBeHit(mapx: number, mapy: number) {
            // Umožni útočit na netvory ve stejné místnosti
            this.disableMonstersToBeHit();
            let room = this.proc.map.rooms.getValue(mapx, mapy);
            room.monsters.forEach((monster) => {
                if (!monster || (monster.def.type == MonsterType.ZOMBIE && monster.stunned))
                    return;
                let monsterUI = this.monsterRoomSpriteById[monster.id];
                monsterUI.interactive = true;
            });
        }

        private disableMonstersToBeHit() {
            this.monsterRoomSpriteById.forEach((monster) => {
                monster.interactive = false;
                monster.scale.set(1, 1);
            });
        }

        /**
         * Útok na netvora
         */
        private attackMonster(monster: Monster, monsterRoomSprite: RoomSprite) {
            let result = this.proc.attackMonster(monster);
            if (result.success) {
                // Zombie se dá trvale zabít až když je +2 útok, 
                // jinak se jenom omráčí a v další tahu ji může keeper znovu oživit
                if (result.death) {
                    this.animateObjectFadeAway(monsterRoomSprite, monsterRoomSprite.x, monsterRoomSprite.y);
                    this.unregisterSpriteFromRoom(monsterRoomSprite, monster.mapx, monster.mapy);
                    this.drawRoomTokens(monster.mapx, monster.mapy);
                    delete this.monsterRoomSpriteById[monster.id];
                } else {
                    let monsterUI = this.monsterRoomSpriteById[monster.id];
                    monsterUI.alpha = 0.5;
                    this.createFadeText("OMRÁČEN", monsterUI.x, monsterUI.y);
                }
                monsterRoomSprite.interactive = false;
            } else {
                this.createFadeText("NEÚČINNÉ", monsterRoomSprite.x, monsterRoomSprite.y);
            }
        }

        private enablePlayersToBeHit(mapx: number, mapy: number) {
            // Umožni útočit na živé hráče ve stejné místnosti
            this.disablePlayersToBeHit();
            let room = this.proc.map.rooms.getValue(mapx, mapy);
            room.players.forEach((player) => {
                if (player.health == 0)
                    return;
                let playerUI = this.playerRoomSpriteById[player.id];
                playerUI.interactive = true;
            });
        }

        private disablePlayersToBeHit() {
            this.playerRoomSpriteById.forEach((player) => {
                player.interactive = false;
                player.scale.set(1, 1);
            });
        }

        private prepareUIForNext() {
            this.bounceStop();
            this.disableMonstersToBeHit();
            this.disablePlayersToBeHit();
            this.disableRoomsForTravel();
        }

        private createFadeText(message: string, x: number, y: number) {
            let text = new PIXI.Text(message, { fontFamily: Gfx.FONT, fontSize: 25 + "px", fill: 0xffffff });
            this.createFadeAwayObject(text, x, y);
            this.mapCont.addChild(text);
        }

        private createFadeSprite(spriteName: string, x: number, y: number) {
            let sprite = new PIXI.Sprite(PIXI.Texture.fromImage(spriteName));
            this.createFadeAwayObject(sprite, x, y);
            this.mapCont.addChild(sprite);
        }

        private createFadeAwayObject(obj: PIXI.Sprite, x: number, y: number) {
            let self = this;
            obj.x = x;
            obj.y = y - self.getMapTokenImgSize();
            obj.anchor.set(0.5, 0.5);
            this.animateObjectFadeAway(obj, x, obj.y);
        }

        private animateObjectFadeAway(obj: PIXI.Sprite, x: number, y: number) {
            let self = this;
            createjs.Tween.get(obj).to({
                y: y - 50
            }, 800).call(() => {
                // TODO tady to z neznámého důvodu jednou spadlo na obj.parent = null ...
                if (obj.parent)
                    obj.parent.removeChild(obj);
                else console.log("obj.parent je null!");
            });
            createjs.Tween.get(obj).wait(300).to({
                alpha: 0
            }, 200);
        }

    }
}