namespace Catacombs {

    class InventoryItem {
        constructor(
            public key: string,
            public sprite: PIXI.Sprite,
            public amount = 1
        ) { }
    }

    export class Player {
        private static playersCount = 0;
        public static create(map: Map): Player {
            if (Player.playersCount > 4)
                return null;
            let player = new Player(new PIXI.Sprite(PIXI.Texture.fromImage('images/player' + Player.playersCount + '.png')), map, Player.playersCount);
            Player.playersCount++;
            return player;
        }

        public health: number;
        public treasure: number;
        public inventory: { [key: string]: InventoryItem } = {};
        public invetoryUI = new PIXI.Container();
        public mapx: number;
        public mapy: number;
        // je na tahu?
        public active = false;

        private constructor(public token: PIXI.Sprite, private map: Map, public playerID: number) {
            this.mapx = map.center;
            this.mapy = map.center;
            this.map.rooms.getValue(this.mapx, this.mapy).players[this.playerID] = this;

            Keyboard.on(37, () => { this.left(); });
            Keyboard.on(65, () => { this.left(); });
            Keyboard.on(38, () => { this.up(); });
            Keyboard.on(87, () => { this.up(); });
            Keyboard.on(39, () => { this.right(); });
            Keyboard.on(68, () => { this.right(); });
            Keyboard.on(40, () => { this.down(); });
            Keyboard.on(83, () => { this.down(); });
        }

        takeItem(item: Item) {
            let invItem = this.inventory[item.definition.key];
            if (invItem) {
                invItem.amount++;
            } else {
                let itemDef = item.definition;
                invItem = new InventoryItem(item.definition.key, new PIXI.Sprite(itemDef.tokenTexture));
                this.inventory[item.definition.key] = invItem;
            }
            this.updateInventoryUI();
        }

        useItem(key: string) {
            let item = this.inventory[key];
            item.amount--;
            this.updateInventoryUI();
        }

        updateInventoryUI() {
            this.invetoryUI.removeChildren();
            let lastX = 0;
            for (let key in this.inventory) {
                let item = this.inventory[key];
                if (item.amount <= 0)
                    continue;
                if (item.amount > 1) {
                    let text = new PIXI.Text(item.amount + "", { fontFamily: 'Arial', fontSize: 24, fill: 0xff1010 });
                    this.invetoryUI.addChild(text);
                    text.x = lastX;
                    text.y = 2;
                    lastX += text.width;
                }
                this.invetoryUI.addChild(item.sprite);
                item.sprite.x = lastX;
                lastX += Game.TOKEN_IMG_SIZE + 15;
            }
        }

        move(sideFrom: number, sideTo: number) {
            if (!this.active)
                return;

            // můžu se posunout tímto směrem z aktuální místnosti?
            let room = this.map.rooms.getValue(this.mapx, this.mapy);
            if (!(sideFrom & room.rotatedExits)) {
                return;
            }

            // můžu se posunout tímto směrem do další místnosti (pokud je objevená)?
            let tmapx = this.mapx;
            let tmapy = this.mapy;
            switch (sideTo) {
                // přicházím zleva
                case 0b0001: tmapx = this.mapx + 1; break;
                // přicházím zprava
                case 0b0100: tmapx = this.mapx - 1; break;
                // přicházím shora
                case 0b1000: tmapy = this.mapy + 1; break;
                // přicházím zdola
                case 0b0010: tmapy = this.mapy - 1; break;
            }
            if (tmapx < 0 || tmapx >= this.map.sideSize || tmapy < 0 || tmapy >= this.map.sideSize)
                return;
            room = this.map.rooms.getValue(tmapx, tmapy);
            if (!room) {
                room = this.map.revealMapPiece(tmapx, tmapy, sideTo);
            } else {
                if (!(sideTo & room.rotatedExits)) {
                    return;
                }
            }
            this.token.x += (tmapx - this.mapx) * Game.ROOM_IMG_SIZE;
            this.token.y += (tmapy - this.mapy) * Game.ROOM_IMG_SIZE;
            let oldRoom = this.map.rooms.getValue(this.mapx, this.mapy);
            if (oldRoom)
                oldRoom.players[this.playerID] = null;
            room.players[this.playerID] = this;
            this.mapx = tmapx;
            this.mapy = tmapy;
            let player = this;
            room.items.splice(0, room.items.length).forEach((i: Item) => {
                player.takeItem(i);
                i.sprite.parent.removeChild(i.sprite);
            });
        }

        up() { this.move(0b1000, 0b0010); }
        down() { this.move(0b0010, 0b1000); }
        left() { this.move(0b0001, 0b0100); }
        right() { this.move(0b0100, 0b0001); }
    }

}