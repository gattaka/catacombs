namespace Catacombs {
    export class Gfx {

        private static ROOM_IMG_SIZE = 100;
        private static TOKEN_IMG_SIZE = 30;

        constructor(stage: PIXI.Container, proc: Proc) {

            // Mapa
            let mapCont = new PIXI.Container();
            stage.addChild(mapCont);
            mapCont.fixedWidth = Gfx.ROOM_IMG_SIZE * proc.map.sideSize;
            mapCont.fixedHeight = Gfx.ROOM_IMG_SIZE * proc.map.sideSize;
            mapCont.x = stage.fixedWidth / 2 - mapCont.fixedWidth / 2;
            mapCont.y = stage.fixedHeight / 2 - mapCont.fixedHeight / 2;

            EventBus.getInstance().registerConsumer(EventType.ROOM_DISCOVERED, (p: TupleEventPayload): boolean => {
                let room = proc.map.rooms.getValue(p.x, p.y);
                let sprite = new PIXI.Sprite(room.def.tex);
                sprite.anchor.set(0.5);
                sprite.rotation = room.rotation;
                sprite.x = Gfx.ROOM_IMG_SIZE * (p.x + 0.5);
                sprite.y = Gfx.ROOM_IMG_SIZE * (p.y + 0.5)
                mapCont.addChild(sprite);

                let monster = room.monsters[room.monsters.length - 1];
                if (monster) {
                    let sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + monster.def.name + '_token.png'));
                    mapCont.addChild(sprite);
                    sprite.x = Gfx.ROOM_IMG_SIZE * p.x + 10;
                    sprite.y = Gfx.ROOM_IMG_SIZE * p.y + 10;
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
                    } else {
                        let shape = new PIXI.Graphics();
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

            let activeHgl = new PIXI.Graphics();
            activeHgl.beginFill(0xffff00);
            let radius = Gfx.TOKEN_IMG_SIZE / 2 + 2
            activeHgl.drawCircle(0, 0, radius);
            activeHgl.pivot.set(-radius, -radius);
            rmenu.addChild(activeHgl);

            proc.players.forEach((player, i) => {
                let texture = PIXI.Texture.fromImage('images/player' + i + '.png');
                let token = new PIXI.Sprite(texture);
                stage.addChild(token);
                token.x = stage.fixedWidth / 2 - Gfx.TOKEN_IMG_SIZE / 2;
                token.y = stage.fixedHeight / 2 - Gfx.TOKEN_IMG_SIZE / 2;
                let playerMenuIcon = new PIXI.Sprite(texture);
                playerMenuIcon.interactive = true;
                playerMenuIcon.on("click", () => {
                    proc.players.forEach((p) => p.active = false);
                    player.active = true;
                    activeHgl.y = playerMenuIcon.y - 2;
                });
                rmenu.addChild(playerMenuIcon);
                playerMenuIcon.x = 10;
                playerMenuIcon.y = 10 + i * (Gfx.TOKEN_IMG_SIZE + 20);

                if (i == 0) {
                    player.active = true;
                    activeHgl.x = playerMenuIcon.x - 2;
                    activeHgl.y = playerMenuIcon.y - 2;
                }

                let invetoryUI = new PIXI.Container();
                rmenu.addChild(invetoryUI);
                invetoryUI.x = playerMenuIcon.x + Gfx.TOKEN_IMG_SIZE + 10;
                invetoryUI.y = playerMenuIcon.y;

                EventBus.getInstance().registerConsumer(EventType.PLAYER_MOVE, (p: PlayerMovePayload): boolean => {
                    if (i != p.playerId)
                        return;
                    token.x += (p.x - player.mapx) * Gfx.ROOM_IMG_SIZE;
                    token.y += (p.y - player.mapy) * Gfx.ROOM_IMG_SIZE;
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
                            let text = new PIXI.Text(item.amount + "", { fontFamily: 'Arial', fontSize: 24, fill: 0xff1010 });
                            invetoryUI.addChild(text);
                            text.x = lastX;
                            text.y = 2;
                            lastX += text.width;
                        }
                        let sprite = new PIXI.Sprite(PIXI.Texture.fromImage('images/' + item.name + '_token.png'));
                        invetoryUI.addChild(sprite);
                        sprite.x = lastX;
                        lastX += Gfx.TOKEN_IMG_SIZE + 15;
                    }
                });

            })
        }
    }
}