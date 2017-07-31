namespace Catacombs {

    class RoomSprite extends PIXI.Sprite {
        constructor(texture: string, public roomPos: number) {
            super(PIXI.Texture.fromImage('images/' + texture))
        }
    }

    export class Gfx {

        private static ROOM_IMG_SIZE = 100;
        private static MAP_TOKEN_IMG_SIZE = 30;
        private static UI_TOKEN_IMG_SIZE = 60;
        private static FONT = 'Tahoma';

        // Sprites v místnosti (monstra, hráči, truhly)
        private roomSprites = new Array2D<Array<RoomSprite>>();

        // Sprite/Pozadí samotné místnosti
        private roomCellSprites = new Array2D<PIXI.Container>();

        private playerRoomSpriteById = new Array<RoomSprite>();
        private monsterRoomSpriteById = new Array<RoomSprite>();
        private treasureRoomSpriteById = new Array<RoomSprite>();

        private playerEquipment = new Array<PIXI.Container>();

        private mapCont = new PIXI.Container();
        private mapTokensCont = new PIXI.Container();

        private tweenBounces = new Array<PIXI.DisplayObject>();
        private monsterChooseMarks = new Array<PIXI.Text>();

        constructor(stage: PIXI.Container, private controls: Controls, private proc: Proc) {
            let self = this;

            // Mapa
            stage.addChild(self.mapCont);
            stage.addChild(self.mapTokensCont);
            self.mapCont.fixedWidth = self.mapTokensCont.fixedWidth = Gfx.ROOM_IMG_SIZE * proc.map.sideSize;
            self.mapCont.fixedHeight = self.mapTokensCont.fixedHeight = Gfx.ROOM_IMG_SIZE * proc.map.sideSize;
            self.mapCont.x = self.mapTokensCont.x = stage.fixedWidth / 2 - self.mapCont.fixedWidth / 2;
            self.mapCont.y = self.mapTokensCont.y = stage.fixedHeight / 2 - self.mapCont.fixedHeight / 2;

            EventBus.getInstance().registerConsumer(EventType.ROOM_REVEALED, (p: TupleEventPayload): boolean => {
                let cont = new PIXI.Container();
                cont.x = Gfx.ROOM_IMG_SIZE * p.x;
                cont.y = Gfx.ROOM_IMG_SIZE * p.y;
                self.mapCont.addChild(cont);
                self.roomCellSprites.setValue(p.x, p.y, cont);

                let room = proc.map.rooms.getValue(p.x, p.y);
                let sprite = new PIXI.Sprite(room.def.tex);
                sprite.anchor.set(0.5);
                sprite.rotation = room.rotation;
                sprite.x = Gfx.ROOM_IMG_SIZE * 0.5;
                sprite.y = Gfx.ROOM_IMG_SIZE * 0.5;
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

            for (let mapy = 0; mapy < proc.map.sideSize; mapy++) {
                for (let mapx = 0; mapx < proc.map.sideSize; mapx++) {
                    let x = mapx * Gfx.ROOM_IMG_SIZE;
                    let y = mapy * Gfx.ROOM_IMG_SIZE;
                    let cont = new PIXI.Container();
                    cont.x = x;
                    cont.y = y;
                    if (mapx == proc.map.center && mapy == proc.map.center) {
                        let room = proc.map.rooms.getValue(mapx, mapy);
                        let sprite = new PIXI.Sprite(room.def.tex);
                        cont.addChild(sprite);
                    } else {
                        let shape = new PIXI.Graphics();
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
                lmenuLastY = token.y + Gfx.UI_TOKEN_IMG_SIZE;
                lmenu.addChild(token);
                let buyBtn = self.createBtn("Koupit za " + def.price + "c", 0xd29e36, lmenu.fixedWidth - 30 - Gfx.UI_TOKEN_IMG_SIZE, 30, () => {
                    let activePlayer = self.controls.activePlayer;
                    if (!self.controls.activeKeeper) {
                        let player = proc.players[activePlayer];
                        if (player.treasureSum >= def.price && !player.treasure[EquipmentType[def.type]] && def.availableInstances > 0) {
                            player.buy(def);
                        }
                    }
                });
                buyBtn.x = token.x + 10 + Gfx.UI_TOKEN_IMG_SIZE;
                buyBtn.y = token.y + Gfx.UI_TOKEN_IMG_SIZE / 2 - buyBtn.getBounds().height / 2;
                lmenu.addChild(buyBtn);
            });

            // Ceník
            Object.keys(TreasureDef.defsByType).forEach((type, i) => {
                let def = TreasureDef.defsByType[type];
                if (!def.canBuy)
                    return;

                let token = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + def.file + '.png'));
                token.x = 10;
                token.y = lmenuLastY + 10;
                lmenuLastY = token.y + Gfx.UI_TOKEN_IMG_SIZE;
                lmenu.addChild(token);

                let text = new PIXI.Text(" = " + def.price + "c", { fontFamily: Gfx.FONT, fontSize: 34 + "px", fill: 0xd29e36 });
                text.anchor.set(0, 0.5);
                text.x = token.x + Gfx.UI_TOKEN_IMG_SIZE + 10;
                text.y = token.y + Gfx.UI_TOKEN_IMG_SIZE / 2;
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
                playerMenuIcon.x = 10 + Gfx.UI_TOKEN_IMG_SIZE / 2;
                playerMenuIcon.y = 10 + 2 * i * (Gfx.UI_TOKEN_IMG_SIZE + 20) + Gfx.UI_TOKEN_IMG_SIZE / 2;

                EventBus.getInstance().registerConsumer(EventType.PLAYER_ACTIVATE, (p: NumberEventPayload): boolean => {
                    if (i != p.payload)
                        return;
                    this.bounce([playerRoomSprite, playerMenuIcon]);
                    this.enableMonstersToBeHit(player.mapx, player.mapy);
                    this.removeMonsterChooseMarks();
                    // TODO pokud má hráč lockpicks, může procházet mřížemi
                    this.enableRoomsForTravel(player.mapx, player.mapy, false, true);
                });

                let healthUI = new PIXI.Container();
                rmenu.addChild(healthUI);
                healthUI.x = playerMenuIcon.x + Gfx.UI_TOKEN_IMG_SIZE / 2 + 10;
                healthUI.y = playerMenuIcon.y - Gfx.UI_TOKEN_IMG_SIZE / 2;
                for (let h = 0; h < player.health; h++) {
                    let sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/life.png'));
                    healthUI.addChild(sprite);
                    sprite.x = h * Gfx.UI_TOKEN_IMG_SIZE / 2
                }

                let equipmentUI = new PIXI.Container();
                self.playerEquipment[player.id] = equipmentUI;
                rmenu.addChild(equipmentUI);
                equipmentUI.x = healthUI.x + (healthUI.getBounds().width) * 3 + 10;
                equipmentUI.y = healthUI.y;

                let treasureUI = new PIXI.Container();
                rmenu.addChild(treasureUI);
                treasureUI.x = playerMenuIcon.x + Gfx.UI_TOKEN_IMG_SIZE / 2 + 10;
                treasureUI.y = playerMenuIcon.y + Gfx.UI_TOKEN_IMG_SIZE / 2 + 10;

                playerRoomSprite.on("mouseover", () => {
                    playerRoomSprite.scale.set(1.5, 1.5);
                });
                playerRoomSprite.on("mouseout", () => {
                    playerRoomSprite.scale.set(1, 1);
                });
                playerRoomSprite.on("click", () => {
                    // Nestvůra útočí na daného hráče
                    self.hitPlayer(player, playerRoomSprite, healthUI, playerMenuIcon);
                });

                EventBus.getInstance().registerConsumer(EventType.PLAYER_MOVE, (p: PlayerMovePayload): boolean => {
                    if (i != p.playerId)
                        return;
                    let sprite = self.playerRoomSpriteById[p.playerId];
                    self.moveSprite(sprite, p.fromX, p.fromY, p.toX, p.toY);
                    self.enableMonstersToBeHit(p.toX, p.toY);
                    // TODO pokud má hráč lockpicks, může procházet mřížemi
                    self.enableRoomsForTravel(p.toX, p.toY, false, true);
                    return false;
                });

                EventBus.getInstance().registerConsumer(EventType.ROOM_ITEM_OBTAINED, (p: RoomItemObtainedPayload): boolean => {
                    if (i != p.playerId)
                        return;
                    let sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + p.item.file + '.png'));
                    stage.addChild(sprite);
                    sprite.x = self.mapCont.x + Gfx.ROOM_IMG_SIZE * (p.room.mapx + 0.5);
                    sprite.y = self.mapCont.y + Gfx.ROOM_IMG_SIZE * (p.room.mapy + 0.5);
                    createjs.Tween.get(sprite)
                        .to({
                            x: rmenu.x,
                            y: rmenu.y + playerMenuIcon.y
                        }, 300).call(function () {
                            stage.removeChild(sprite);
                            EventBus.getInstance().fireEvent(new NumberEventPayload(EventType.INV_UPDATE, p.playerId));
                        });
                    return false;
                });

                EventBus.getInstance().registerConsumer(EventType.INV_UPDATE, (p: NumberEventPayload): boolean => {
                    if (i != p.payload)
                        return;
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
                            text.y = Gfx.UI_TOKEN_IMG_SIZE + 5; // TODO tohle by mělo vycházet i bez toho +5
                        }
                        lastX += Gfx.UI_TOKEN_IMG_SIZE * 0.75;
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
                        lastX += Gfx.UI_TOKEN_IMG_SIZE + 5;
                    }
                });
            });

            // aby se přidali tokeny hráčů
            self.drawRoomTokens(mapCenter, mapCenter);

            EventBus.getInstance().registerConsumer(EventType.MONSTER_MOVE, (p: MonsterMovePayload): boolean => {
                self.deactivatePlayerRoomSprites();
                let sprite = self.monsterRoomSpriteById[p.monsterId];
                self.moveSprite(sprite, p.fromX, p.fromY, p.toX, p.toY);
                self.enablePlayersToBeHit(p.toX, p.toY);
                // netvoři nemohou prcházet mřížemi a nemohou objevovat místnosti
                self.enableRoomsForTravel(p.toX, p.toY, false, false);
                return false;
            });

            // dungeon keeper icon
            let texture = PIXI.Texture.fromImage('images/keeper.png');
            let keeperIcon = new PIXI.Sprite(texture);
            keeperIcon.anchor.set(0.5, 0.5);
            rmenu.addChild(keeperIcon);
            keeperIcon.x = 10 + Gfx.UI_TOKEN_IMG_SIZE / 2;
            keeperIcon.y = 10 + 2 * proc.players.length * (Gfx.UI_TOKEN_IMG_SIZE + 20) + Gfx.UI_TOKEN_IMG_SIZE / 2;

            // Přeskočit tah btn
            let skipBtn = self.createBtn("Přeskočit tah (mezerník)", 0xd29e36, rmenu.fixedWidth, 30, () => { self.controls.next() });
            skipBtn.x = 10;
            skipBtn.y = keeperIcon.y + Gfx.UI_TOKEN_IMG_SIZE * 2;
            rmenu.addChild(skipBtn);

            EventBus.getInstance().registerConsumer(EventType.KEEPER_ACTIVATE, (p: SimpleEventPayload): boolean => {
                let toBounce = [keeperIcon];
                self.proc.monsters.forEach((monster) => {
                    let sprite = self.monsterRoomSpriteById[monster.id];
                    sprite.interactive = true;
                    sprite.buttonMode = true;
                    let text = new PIXI.Text("?", { fontFamily: Gfx.FONT, fontSize: 25 + "px", fill: 0xffffff });
                    sprite.parent.addChild(text);
                    text.anchor.set(0.5, 0.5);
                    text.x = sprite.x;
                    text.y = sprite.y - Gfx.MAP_TOKEN_IMG_SIZE;
                    toBounce.push(text);
                    this.monsterChooseMarks.push(text);
                    this.deactivateRooms();
                });
                this.bounce(toBounce);
                this.deactivatePlayerRoomSprites();
                return false;
            });

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
                if (this.controls.activeKeeper) {
                    this.chooseMonster(monster, sprite);
                } else {
                    this.hitMonster(monster, sprite);
                }
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
            this.roomSprites.getValue(x, y).forEach((sprite, i) => {
                let newX = 2.5 + (i % 3) * (Gfx.MAP_TOKEN_IMG_SIZE + 2.5) + x * Gfx.ROOM_IMG_SIZE + Gfx.MAP_TOKEN_IMG_SIZE / 2;
                let newY = 2.5 + Math.floor(i / 3) * (Gfx.MAP_TOKEN_IMG_SIZE + 2.5) + y * Gfx.ROOM_IMG_SIZE + Gfx.MAP_TOKEN_IMG_SIZE / 2;
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

        private deactivateMonsterRoomSprites() {
            this.monsterRoomSpriteById.forEach((monster) => {
                monster.interactive = false;
                monster.scale.set(1, 1);
            });
        }

        private deactivatePlayerRoomSprites() {
            this.playerRoomSpriteById.forEach((player) => {
                player.interactive = false;
                player.scale.set(1, 1);
            });
        }

        private deactivateRooms() {
            this.roomCellSprites.forEach((cont: PIXI.Container) => {
                if (cont.children.length > 1)
                    cont.removeChildAt(1);
                cont.interactive = false;
                cont.buttonMode = false;
            });
        }

        private enableRoomsForTravel(mapx: number, mapy: number, ignoreBars: boolean, canExplore: boolean) {
            this.deactivateRooms();
            let directions = [
                [-1, 0, 0b0001, 0b0100],
                [1, 0, 0b0100, 0b0001],
                [0, -1, 0b1000, 0b0010],
                [0, 1, 0b0010, 0b1000]
            ];
            directions.forEach((direction) => {
                let movement = new Movement(direction[2], direction[3], mapx, mapy, mapx + direction[0], mapy + direction[1]);
                let roomCellSprite = this.roomCellSprites.getValue(movement.toX, movement.toY);

                if (!this.proc.map.canTravel(movement, ignoreBars, canExplore))
                    return;
                let shape = new PIXI.Graphics();
                let drawFill = (color) => {
                    shape.clear();
                    shape.beginFill(color, 0.2);
                    shape.drawRect(0, 0, Gfx.ROOM_IMG_SIZE, Gfx.ROOM_IMG_SIZE);
                }
                let drawDefaultFill = () => {
                    drawFill(0x11aa00);
                }
                drawDefaultFill();
                roomCellSprite.addChild(shape);
                shape.interactive = true;
                shape.buttonMode = true;
                shape.on("mouseover", () => {
                    drawFill(0xaabb00);
                });
                shape.on("mouseout", () => {
                    drawDefaultFill();
                });
                shape.on("click", () => {
                    this.controls.move(movement);
                });
            });
        }

        private chooseMonster(monster: Monster, sprite: RoomSprite) {
            // vybírám netvora v tahu keepera
            this.controls.activeMonster = monster.id;
            this.bounceStop();
            this.bounce([sprite]);
            this.deactivateMonsterRoomSprites();
            this.enablePlayersToBeHit(monster.mapx, monster.mapy);
            this.removeMonsterChooseMarks();
            // netvoři nemohou procházet mřížemi a nemohou objevovat místnosti
            this.enableRoomsForTravel(monster.mapx, monster.mapy, false, false);
        }

        private removeMonsterChooseMarks() {
            this.monsterChooseMarks.forEach((m) => {
                m.parent.removeChild(m);
            });
            this.monsterChooseMarks = [];
        }

        private enableMonstersToBeHit(mapx: number, mapy: number) {
            // Umožni útočit na netvory ve stejné místnosti
            this.deactivateMonsterRoomSprites();
            let room = this.proc.map.rooms.getValue(mapx, mapy);
            room.monsters.forEach((monster) => {
                if (!monster)
                    return;
                let monsterUI = this.monsterRoomSpriteById[monster.id];
                monsterUI.interactive = true;
            });
        }

        /**
         * Útok na netvora
         */
        private hitMonster(monster: Monster, monsterRoomSprite: RoomSprite) {
            let currentPlayer = this.proc.players[this.controls.activePlayer];
            // útok je daný aktuálním útočníkem -- ten může útočit i z jiné mísnosti, 
            // než je cílový netvor
            let deployedAttack = currentPlayer.attack;
            // a k tom útokem všech hráčů v místnosti, kde je netvor, na kterého útočím
            let monsterRoom = this.proc.map.rooms.getValue(monster.mapx, monster.mapy);
            monsterRoom.players.forEach((p) => {
                if (p != currentPlayer)
                    deployedAttack += p.attack;
            })

            if (deployedAttack > monster.def.defense) {
                this.animateObjectFadeAway(monsterRoomSprite, monsterRoomSprite.x, monsterRoomSprite.y);
                this.unregisterSpriteFromRoom(monsterRoomSprite, monster.mapx, monster.mapy);
                this.drawRoomTokens(monster.mapx, monster.mapy);
                this.deactivateMonsterRoomSprites();
                delete this.monsterRoomSpriteById[monster.id];
                this.proc.killMonster(monster);
                this.controls.next();
            } else {
                this.createFadeText("NEÚČINNÉ", monsterRoomSprite.x, monsterRoomSprite.y);
            }
        }

        private enablePlayersToBeHit(mapx: number, mapy: number) {
            // Umožni útočit na živé hráče ve stejné místnosti
            this.deactivatePlayerRoomSprites();
            let room = this.proc.map.rooms.getValue(mapx, mapy);
            room.players.forEach((player) => {
                if (player.health == 0)
                    return;
                let playerUI = this.playerRoomSpriteById[player.id];
                playerUI.interactive = true;
            });
        }

        private hitPlayer(player: Player, playerRoomSprite: RoomSprite, healthUI: PIXI.Container, playerMenuIcon: PIXI.Sprite) {
            let currentMonster = this.proc.monsters[this.controls.activeMonster];
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
            } else {
                this.createFadeText("NEÚČINNÉ", playerRoomSprite.x, playerRoomSprite.y);
            }
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
            obj.y = y - Gfx.MAP_TOKEN_IMG_SIZE;
            obj.anchor.set(0.5, 0.5);
            this.animateObjectFadeAway(obj, x, obj.y);
        }

        private animateObjectFadeAway(obj: PIXI.Sprite, x: number, y: number) {
            let self = this;
            createjs.Tween.get(obj).to({
                y: y - 50
            }, 800).call(() => {
                obj.parent.removeChild(obj);
            });
            createjs.Tween.get(obj).wait(300).to({
                alpha: 0
            }, 200);
        }

    }
}