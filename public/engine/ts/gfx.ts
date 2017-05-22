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

        private roomSprites = new Array2D<Array<RoomSprite>>();

        private playerTokenById = new Array<RoomSprite>();
        private monsterTokenById = new Array<RoomSprite>();
        private treasureTokenById = new Array<RoomSprite>();

        private questionMarks = new Array<PIXI.Text>();

        private mapCont = new PIXI.Container();
        private mapTokensCont = new PIXI.Container();

        constructor(stage: PIXI.Container, private controls: Controls, private proc: Proc) {
            let self = this;

            // Mapa
            stage.addChild(self.mapCont);
            stage.addChild(self.mapTokensCont);
            self.mapCont.fixedWidth = self.mapTokensCont.fixedWidth = Gfx.ROOM_IMG_SIZE * proc.map.sideSize;
            self.mapCont.fixedHeight = self.mapTokensCont.fixedHeight = Gfx.ROOM_IMG_SIZE * proc.map.sideSize;
            self.mapCont.x = self.mapTokensCont.x = stage.fixedWidth / 2 - self.mapCont.fixedWidth / 2;
            self.mapCont.y = self.mapTokensCont.y = stage.fixedHeight / 2 - self.mapCont.fixedHeight / 2;

            EventBus.getInstance().registerConsumer(EventType.ROOM_DISCOVERED, (p: TupleEventPayload): boolean => {
                let room = proc.map.rooms.getValue(p.x, p.y);
                let sprite = new PIXI.Sprite(room.def.tex);
                sprite.anchor.set(0.5);
                sprite.rotation = room.rotation;
                sprite.x = Gfx.ROOM_IMG_SIZE * (p.x + 0.5);
                sprite.y = Gfx.ROOM_IMG_SIZE * (p.y + 0.5)
                self.mapCont.addChild(sprite);

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
                    let sprite = new RoomSprite(monster.def.name + '_token.png', roomSprites.length);
                    this.monsterTokenById[monster.id] = sprite;
                    roomSprites.push(sprite);
                }
                if (room.treasure && !room.treasure.def.canPick) {
                    let sprite = new RoomSprite(room.treasure.def.name + '.png', roomSprites.length);
                    this.treasureTokenById[room.treasure.id] = sprite;
                    roomSprites.push(sprite);
                }
                self.drawRoomTokens(p.x, p.y);
                return false;
            });

            for (let mapy = 0; mapy < proc.map.sideSize; mapy++) {
                for (let mapx = 0; mapx < proc.map.sideSize; mapx++) {
                    let x = mapy * Gfx.ROOM_IMG_SIZE;
                    let y = mapx * Gfx.ROOM_IMG_SIZE;
                    if (mapx == proc.map.center && mapy == proc.map.center) {
                        let room = proc.map.rooms.getValue(mapx, mapy);
                        let sprite = new PIXI.Sprite(room.def.tex);
                        sprite.x = x;
                        sprite.y = y;
                        self.mapCont.addChild(sprite);
                    } else {
                        let shape = new PIXI.Graphics();
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
            Object.keys(EquipmentDef.defsByName).forEach((name, i) => {
                let def = EquipmentDef.defsByName[name];
                let token = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + name + '_token.png'));
                token.x = 10;
                token.y = lmenuLastY + 10;
                lmenuLastY = token.y + Gfx.UI_TOKEN_IMG_SIZE;
                lmenu.addChild(token);
                let buyBtn = self.createBtn("Koupit za " + def.price + "c", 0xd29e36, lmenu.fixedWidth - 30 - Gfx.UI_TOKEN_IMG_SIZE, 30, () => {
                    let activePlayer = self.controls.activePlayer;
                    if (!self.controls.activeKeeper) {

                    }
                });
                buyBtn.x = token.x + 10 + Gfx.UI_TOKEN_IMG_SIZE;
                buyBtn.y = token.y + Gfx.UI_TOKEN_IMG_SIZE / 2 - buyBtn.getBounds().height / 2;
                lmenu.addChild(buyBtn);
            });

            // Ceník
            Object.keys(TreasureDef.defsByName).forEach((name, i) => {
                let def = TreasureDef.defsByName[name];
                if (!def.canBuy)
                    return;

                let token = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + name + '.png'));
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

            let tweenBounces = new Array<PIXI.DisplayObject>();
            let bounceStop = () => {
                tweenBounces.forEach((t) => {
                    createjs.Tween.removeTweens(t.scale);
                    t.scale.set(1, 1);
                })
                tweenBounces = [];
            }
            let bounce = (sprites: Array<PIXI.Sprite>) => {
                bounceStop();
                sprites.forEach((s, i) => {
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
            }

            let mapCenter = self.proc.map.center;
            let centerRoomSprites = new Array<RoomSprite>()
            self.roomSprites.setValue(mapCenter, mapCenter, centerRoomSprites);

            // player icons
            proc.players.forEach((player, i) => {
                let token = new RoomSprite('player' + i + '_token.png', centerRoomSprites.length);
                token.interactive = false;
                token.buttonMode = true;
                // na plochu bude přidáno jednotně mimo tento cykl
                centerRoomSprites.push(token);
                self.playerTokenById[i] = token;

                let playerMenuIcon = new PIXI.Sprite(PIXI.Texture.fromImage('images/player' + i + '.png'));
                playerMenuIcon.anchor.set(0.5, 0.5);
                rmenu.addChild(playerMenuIcon);
                playerMenuIcon.x = 10 + Gfx.UI_TOKEN_IMG_SIZE / 2;
                playerMenuIcon.y = 10 + 2 * i * (Gfx.UI_TOKEN_IMG_SIZE + 20) + Gfx.UI_TOKEN_IMG_SIZE / 2;

                EventBus.getInstance().registerConsumer(EventType.PLAYER_ACTIVATE, (p: NumberEventPayload): boolean => {
                    if (i != p.payload)
                        return;
                    self.questionMarks.forEach((q) => { self.mapTokensCont.removeChild(q) });
                    self.questionMarks = [];
                    bounce([token, playerMenuIcon]);
                    self.deactivateMonsterTokens()
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

                let invetoryUI = new PIXI.Container();
                rmenu.addChild(invetoryUI);
                invetoryUI.x = playerMenuIcon.x + Gfx.UI_TOKEN_IMG_SIZE / 2 + 10;
                invetoryUI.y = playerMenuIcon.y + Gfx.UI_TOKEN_IMG_SIZE / 2 + 10;

                token.on("mouseover", () => {
                    token.scale.set(1.5, 1.5);
                });
                token.on("mouseout", () => {
                    token.scale.set(1, 1);
                });
                token.on("click", () => {
                    // Nestvůra útočí na daného hráče
                    let sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/life_token.png'));
                    self.mapCont.addChild(sprite);
                    sprite.x = token.x;
                    sprite.y = token.y;
                    sprite.anchor.set(0.5, 0.5);
                    self.deactivatePlayerTokens();
                    createjs.Tween.get(sprite).to({
                        y: token.y - 100
                    }, 500).call(() => {
                        self.mapCont.removeChild(sprite);
                    });
                    createjs.Tween.get(sprite).wait(300).to({
                        alpha: 0
                    }, 200);
                    player.health--;
                    healthUI.removeChildAt(healthUI.children.length - 1);
                    if (player.health == 0) {
                        token.texture = PIXI.Texture.fromImage('images/player' + i + '_tomb_token.png');
                        playerMenuIcon.texture = PIXI.Texture.fromImage('images/player' + i + '_tomb.png');
                    }
                });

                EventBus.getInstance().registerConsumer(EventType.PLAYER_MOVE, (p: PlayerMovePayload): boolean => {
                    if (i != p.playerId)
                        return;
                    let sprite = self.playerTokenById[p.playerId];
                    self.moveSprite(sprite, p.fromX, p.fromY, p.toX, p.toY);
                    return false;
                });

                EventBus.getInstance().registerConsumer(EventType.ROOM_ITEM_OBTAINED, (p: RoomItemObtainedPayload): boolean => {
                    if (i != p.playerId)
                        return;
                    let sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + p.item.name + '.png'));
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
                    invetoryUI.removeChildren();
                    let lastX = 0;
                    for (let key in player.inventory) {
                        let item = player.inventory[key];
                        if (item.amount <= 0)
                            continue;
                        let sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + item.name + '.png'));
                        invetoryUI.addChild(sprite);
                        sprite.x = lastX;
                        sprite.y = 0;
                        if (item.amount > 1) {
                            let text = new PIXI.Text(item.amount + "x",
                                { stroke: 0x0, strokeThickness: 4, fontFamily: Gfx.FONT, fontWeight: 'bold', fontSize: 24, fill: 0xd29e36 });
                            text.anchor.set(0, 1);
                            invetoryUI.addChild(text);
                            text.x = lastX;
                            text.y = Gfx.UI_TOKEN_IMG_SIZE + 5; // TODO tohle by mělo vycházet i bez toho +5
                        }
                        lastX += Gfx.UI_TOKEN_IMG_SIZE * 0.75;
                    }
                });
            });

            // aby se přidali tokeny hráčů
            self.drawRoomTokens(mapCenter, mapCenter);

            EventBus.getInstance().registerConsumer(EventType.MONSTER_MOVE, (p: MonsterMovePayload): boolean => {
                self.deactivatePlayerTokens();
                let sprite = self.monsterTokenById[p.monsterId];
                self.moveSprite(sprite, p.fromX, p.fromY, p.toX, p.toY);
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
                self.monsterTokenById.forEach((sprite, i) => {
                    toBounce.push(sprite);
                    let text = new PIXI.Text("?", { fontFamily: Gfx.FONT, fontWeight: 'bold', fontSize: 24, fill: 0xffff10 });
                    text.anchor.set(0.5, 0.5);
                    text.x = sprite.x;
                    text.y = sprite.y;
                    self.mapTokensCont.addChild(text);
                    toBounce.push(text);
                    self.questionMarks.push(text);
                    let onClick = () => {
                        self.controls.activeMonster = i;
                        sprite.interactive = false;
                        bounceStop();
                        self.questionMarks.forEach((q) => { self.mapTokensCont.removeChild(q) });
                        self.questionMarks = [];
                        bounce([sprite]);

                        // Umožni útočit na živé hráče ve stejné místnosti
                        let room = self.proc.map.rooms.getValue(self.proc.monsters[i].mapx, self.proc.monsters[i].mapy);
                        room.players.forEach((player) => {
                            if (player.health == 0)
                                return;
                            let playerUI = self.playerTokenById[player.id];
                            playerUI.interactive = true;
                        })
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

        private moveSprite(sprite: RoomSprite, fromX: number, fromY: number, toX: number, toY: number) {
            let fromRoomSprites = this.roomSprites.getValue(fromX, fromY);
            // vytáhni sprite z pořadníku staré místnosti a sniž pořadí všech sprites, 
            // co byly v pořadí za ním (budou se posouvat na jeho místo)
            fromRoomSprites.splice(sprite.roomPos, 1);
            for (let i = sprite.roomPos; i < fromRoomSprites.length; i++) {
                fromRoomSprites[i].roomPos--;
            }
            // zapiš sprite na konec pořadníku nové místnosti
            let toRoomSprites = this.roomSprites.getValue(toX, toY);
            sprite.roomPos = toRoomSprites.length;
            toRoomSprites.push(sprite);
            // překresli s animací sprites v místnostech
            this.drawRoomTokens(fromX, fromY);
            this.drawRoomTokens(toX, toY);
        }

        private deactivateMonsterTokens() {
            this.monsterTokenById.forEach((monster) => {
                monster.interactive = false;
                monster.scale.set(1, 1);
            });
        }
        private deactivatePlayerTokens() {
            this.playerTokenById.forEach((player) => {
                player.interactive = false;
                player.scale.set(1, 1);
            });
        }
    }
}