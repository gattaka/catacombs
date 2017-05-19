namespace Catacombs {
    export class Gfx {

        private static ROOM_IMG_SIZE = 100;
        private static TOKEN_IMG_SIZE = 30;

        private rooms = new Array2D<PIXI.Container>();
        private players = new Array2D<PIXI.Sprite>();
        private monsters = new Array<PIXI.Sprite>();
        private questionMarks = new Array<PIXI.Text>();

        constructor(stage: PIXI.Container, private controls: Controls, private proc: Proc) {
            let self = this;

            // Mapa
            let mapCont = new PIXI.Container();
            let creaturesCont = new PIXI.Container();
            stage.addChild(mapCont);
            stage.addChild(creaturesCont);
            mapCont.fixedWidth = creaturesCont.fixedWidth = Gfx.ROOM_IMG_SIZE * proc.map.sideSize;
            mapCont.fixedHeight = creaturesCont.fixedHeight = Gfx.ROOM_IMG_SIZE * proc.map.sideSize;
            mapCont.x = creaturesCont.x = stage.fixedWidth / 2 - mapCont.fixedWidth / 2;
            mapCont.y = creaturesCont.y = stage.fixedHeight / 2 - mapCont.fixedHeight / 2;

            EventBus.getInstance().registerConsumer(EventType.ROOM_DISCOVERED, (p: TupleEventPayload): boolean => {
                let room = proc.map.rooms.getValue(p.x, p.y);
                let sprite = new PIXI.Sprite(room.def.tex);
                sprite.anchor.set(0.5);
                sprite.rotation = room.rotation;
                sprite.x = Gfx.ROOM_IMG_SIZE * (p.x + 0.5);
                sprite.y = Gfx.ROOM_IMG_SIZE * (p.y + 0.5)
                mapCont.addChild(sprite);

                sprite.alpha = 0;
                createjs.Tween.get(sprite)
                    .to({
                        alpha: 1
                    }, 200);

                let mCounter = 0;
                for (let monster of room.monsters) {
                    if (!monster)
                        continue;
                    let sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + monster.def.name + '_token.png'));
                    sprite.anchor.set(0.5);
                    creaturesCont.addChild(sprite);
                    this.monsters[monster.creatureId] = sprite;
                    let room = self.proc.map.rooms.getValue(p.x, p.y);
                    let pos = Object.keys(room.monsters).length + Object.keys(room.players).length - 1 - mCounter;
                    sprite.x = 2.5 + (pos % 3) * (Gfx.TOKEN_IMG_SIZE + 2.5) + p.x * Gfx.ROOM_IMG_SIZE + Gfx.TOKEN_IMG_SIZE / 2;
                    sprite.y = 2.5 + Math.floor(pos / 3) * (Gfx.TOKEN_IMG_SIZE + 2.5) + p.y * Gfx.ROOM_IMG_SIZE + Gfx.TOKEN_IMG_SIZE / 2;
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

            for (let mapy = 0; mapy < proc.map.sideSize; mapy++) {
                for (let mapx = 0; mapx < proc.map.sideSize; mapx++) {
                    let x = mapy * Gfx.ROOM_IMG_SIZE;
                    let y = mapx * Gfx.ROOM_IMG_SIZE;
                    if (mapx == proc.map.center && mapy == proc.map.center) {
                        let room = proc.map.rooms.getValue(mapx, mapy);
                        let sprite = new PIXI.Sprite(room.def.tex);
                        sprite.x = x;
                        sprite.y = y;
                        mapCont.addChild(sprite);
                        this.rooms.setValue(mapx, mapy, sprite);
                    } else {
                        let shape = new PIXI.Graphics();
                        shape.beginFill(0x222222);
                        shape.lineStyle(1, 0x000000);
                        shape.drawRect(1, 1, Gfx.ROOM_IMG_SIZE - 2, Gfx.ROOM_IMG_SIZE - 2);
                        mapCont.addChild(shape);
                        shape.x = x;
                        shape.y = y;
                        this.rooms.setValue(mapx, mapy, shape);
                    }
                }
            }

            // Menu
            let createMenu = (): PIXI.Container => {
                let menu = new PIXI.Container();
                menu.fixedWidth = stage.fixedWidth / 2 - 20 - mapCont.fixedWidth / 2;
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

            // players (adventurers) icons
            proc.players.forEach((player, i) => {
                let texture = PIXI.Texture.fromImage('images/player' + i + '.png');
                let token = new PIXI.Sprite(texture);
                creaturesCont.addChild(token);
                token.anchor.set(0.5, 0.5);
                self.players[i] = token;
                token.x = 2.5 + (i % 3) * (Gfx.TOKEN_IMG_SIZE + 2.5) + player.mapx * Gfx.ROOM_IMG_SIZE + Gfx.TOKEN_IMG_SIZE / 2;
                token.y = 2.5 + Math.floor(i / 3) * (Gfx.TOKEN_IMG_SIZE + 2.5) + player.mapy * Gfx.ROOM_IMG_SIZE + Gfx.TOKEN_IMG_SIZE / 2;
                let playerMenuIcon = new PIXI.Sprite(texture);
                playerMenuIcon.anchor.set(0.5, 0.5);
                rmenu.addChild(playerMenuIcon);
                playerMenuIcon.x = 10 + Gfx.TOKEN_IMG_SIZE / 2;
                playerMenuIcon.y = 10 + 2 * i * (Gfx.TOKEN_IMG_SIZE + 20) + Gfx.TOKEN_IMG_SIZE / 2;

                EventBus.getInstance().registerConsumer(EventType.PLAYER_ACTIVATE, (p: NumberEventPayload): boolean => {
                    if (i != p.payload)
                        return;
                    self.questionMarks.forEach((q) => { creaturesCont.removeChild(q) });
                    self.questionMarks = [];
                    bounce([token, playerMenuIcon]);
                });

                let healthUI = new PIXI.Container();
                rmenu.addChild(healthUI);
                healthUI.x = playerMenuIcon.x + Gfx.TOKEN_IMG_SIZE / 2 + 10;
                healthUI.y = playerMenuIcon.y - Gfx.TOKEN_IMG_SIZE / 2;
                for (let h = 0; h < player.health; h++) {
                    let sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/life.png'));
                    healthUI.addChild(sprite);
                    sprite.x = h * Gfx.TOKEN_IMG_SIZE / 2
                }

                let invetoryUI = new PIXI.Container();
                rmenu.addChild(invetoryUI);
                invetoryUI.x = playerMenuIcon.x + Gfx.TOKEN_IMG_SIZE / 2 + 10;
                invetoryUI.y = playerMenuIcon.y + Gfx.TOKEN_IMG_SIZE / 2 + 10;

                EventBus.getInstance().registerConsumer(EventType.PLAYER_MOVE, (p: PlayerMovePayload): boolean => {
                    if (i != p.playerId)
                        return;
                    let room = self.proc.map.rooms.getValue(p.toX, p.toY);
                    let pos = Object.keys(room.monsters).length + Object.keys(room.players).length - 1;
                    let newX = 2.5 + (pos % 3) * (Gfx.TOKEN_IMG_SIZE + 2.5) + p.toX * Gfx.ROOM_IMG_SIZE + Gfx.TOKEN_IMG_SIZE / 2;
                    let newY = 2.5 + Math.floor(pos / 3) * (Gfx.TOKEN_IMG_SIZE + 2.5) + p.toY * Gfx.ROOM_IMG_SIZE + Gfx.TOKEN_IMG_SIZE / 2;
                    createjs.Tween.get(token)
                        .to({
                            x: newX,
                            y: newY
                        }, 200);
                });

                EventBus.getInstance().registerConsumer(EventType.ROOM_ITEM_OBTAINED, (p: RoomItemObtainedPayload): boolean => {
                    if (i != p.playerId)
                        return;
                    let sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + p.item.name + '_token.png'));
                    stage.addChild(sprite);
                    sprite.x = mapCont.x + Gfx.ROOM_IMG_SIZE * (p.room.mapx + 0.5);
                    sprite.y = mapCont.y + Gfx.ROOM_IMG_SIZE * (p.room.mapy + 0.5);
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
                        if (item.amount > 1) {
                            let text = new PIXI.Text(item.amount + "", { fontFamily: 'Arial', fontWeight: 'bold', fontSize: 24, fill: 0xffff10 });
                            invetoryUI.addChild(text);
                            text.x = lastX;
                            text.y = 1;
                            lastX += text.width;
                        }
                        let sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + item.name + '_token.png'));
                        invetoryUI.addChild(sprite);
                        sprite.x = lastX;
                        lastX += Gfx.TOKEN_IMG_SIZE + 15;
                    }
                });
            })

            EventBus.getInstance().registerConsumer(EventType.MONSTER_MOVE, (p: MonsterMovePayload): boolean => {
                let token = self.monsters[p.monsterId];
                let monster = self.proc.monsters[p.monsterId];
                let room = self.proc.map.rooms.getValue(p.toX, p.toY);
                let pos = Object.keys(room.monsters).length + Object.keys(room.players).length - 1;
                let newX = 2.5 + (pos % 3) * (Gfx.TOKEN_IMG_SIZE + 2.5) + p.toX * Gfx.ROOM_IMG_SIZE + Gfx.TOKEN_IMG_SIZE / 2;
                let newY = 2.5 + Math.floor(pos / 3) * (Gfx.TOKEN_IMG_SIZE + 2.5) + p.toY * Gfx.ROOM_IMG_SIZE + Gfx.TOKEN_IMG_SIZE / 2;
                createjs.Tween.get(token)
                    .to({
                        x: newX,
                        y: newY
                    }, 200);
                return false;
            });

            // dungeon keeper icon
            let texture = PIXI.Texture.fromImage('images/keeper_token.png');
            let keeperIcon = new PIXI.Sprite(texture);
            keeperIcon.anchor.set(0.5, 0.5);
            rmenu.addChild(keeperIcon);
            keeperIcon.x = 10 + Gfx.TOKEN_IMG_SIZE / 2;
            keeperIcon.y = 10 + 2 * proc.players.length * (Gfx.TOKEN_IMG_SIZE + 20) + Gfx.TOKEN_IMG_SIZE / 2;

            let skip = new PIXI.Text("Přeskočit tah (mezerník)", { fontFamily: 'Arial', fontSize: 24, fill: 0xffff10 });
            rmenu.addChild(skip);
            skip.anchor.set(0.5, 0.5);
            skip.x = rmenu.fixedWidth / 2;
            skip.y = rmenu.fixedHeight / 2;
            skip.interactive = true;
            skip.buttonMode = true;
            skip.on("click", () => { self.controls.next() });

            EventBus.getInstance().registerConsumer(EventType.KEEPER_ACTIVATE, (p: SimpleEventPayload): boolean => {
                let toBounce = [keeperIcon];
                self.monsters.forEach((sprite, i) => {
                    toBounce.push(sprite);
                    let text = new PIXI.Text("?", { fontFamily: 'Arial', fontWeight: 'bold', fontSize: 24, fill: 0xffff10 });
                    text.anchor.set(0.5, 0.5);
                    text.x = sprite.x;
                    text.y = sprite.y;
                    creaturesCont.addChild(text);
                    toBounce.push(text);
                    self.questionMarks.push(text);
                    let onClick = () => {
                        self.controls.activeMonster = i;
                        sprite.interactive = false;
                        bounceStop();
                        self.questionMarks.forEach((q) => { creaturesCont.removeChild(q) });
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
    }
}