var Catacombs;
(function (Catacombs) {
    var InventoryItem = (function () {
        function InventoryItem(key, sprite, amount) {
            if (amount === void 0) { amount = 1; }
            this.key = key;
            this.sprite = sprite;
            this.amount = amount;
        }
        return InventoryItem;
    }());
    var Player = (function () {
        function Player(token, map, playerID) {
            var _this = this;
            this.token = token;
            this.map = map;
            this.playerID = playerID;
            this.inventory = {};
            this.invetoryUI = new PIXI.Container();
            // je na tahu?
            this.active = false;
            this.mapx = map.center;
            this.mapy = map.center;
            this.map.rooms.getValue(this.mapx, this.mapy).players[this.playerID] = this;
            Catacombs.Keyboard.on(37, function () { _this.left(); });
            Catacombs.Keyboard.on(65, function () { _this.left(); });
            Catacombs.Keyboard.on(38, function () { _this.up(); });
            Catacombs.Keyboard.on(87, function () { _this.up(); });
            Catacombs.Keyboard.on(39, function () { _this.right(); });
            Catacombs.Keyboard.on(68, function () { _this.right(); });
            Catacombs.Keyboard.on(40, function () { _this.down(); });
            Catacombs.Keyboard.on(83, function () { _this.down(); });
        }
        Player.create = function (map) {
            if (Player.playersCount > 4)
                return null;
            var player = new Player(new PIXI.Sprite(PIXI.Texture.fromImage('images/player' + Player.playersCount + '.png')), map, Player.playersCount);
            Player.playersCount++;
            return player;
        };
        Player.prototype.takeItem = function (item) {
            var invItem = this.inventory[item.definition.key];
            if (invItem) {
                invItem.amount++;
            }
            else {
                var itemDef = item.definition;
                invItem = new InventoryItem(item.definition.key, new PIXI.Sprite(itemDef.tokenTexture));
                this.inventory[item.definition.key] = invItem;
            }
            this.updateInventoryUI();
        };
        Player.prototype.useItem = function (key) {
            var item = this.inventory[key];
            item.amount--;
            this.updateInventoryUI();
        };
        Player.prototype.updateInventoryUI = function () {
            this.invetoryUI.removeChildren();
            var lastX = 0;
            for (var key in this.inventory) {
                var item = this.inventory[key];
                if (item.amount <= 0)
                    continue;
                if (item.amount > 1) {
                    var text = new PIXI.Text(item.amount + "", { fontFamily: 'Arial', fontSize: 24, fill: 0xff1010 });
                    this.invetoryUI.addChild(text);
                    text.x = lastX;
                    text.y = 2;
                    lastX += text.width;
                }
                this.invetoryUI.addChild(item.sprite);
                item.sprite.x = lastX;
                lastX += Catacombs.Game.TOKEN_IMG_SIZE + 15;
            }
        };
        Player.prototype.move = function (sideFrom, sideTo) {
            if (!this.active)
                return;
            // můžu se posunout tímto směrem z aktuální místnosti?
            var room = this.map.rooms.getValue(this.mapx, this.mapy);
            if (!(sideFrom & room.rotatedExits)) {
                return;
            }
            // můžu se posunout tímto směrem do další místnosti (pokud je objevená)?
            var tmapx = this.mapx;
            var tmapy = this.mapy;
            switch (sideTo) {
                // přicházím zleva
                case 1:
                    tmapx = this.mapx + 1;
                    break;
                // přicházím zprava
                case 4:
                    tmapx = this.mapx - 1;
                    break;
                // přicházím shora
                case 8:
                    tmapy = this.mapy + 1;
                    break;
                // přicházím zdola
                case 2:
                    tmapy = this.mapy - 1;
                    break;
            }
            if (tmapx < 0 || tmapx >= this.map.sideSize || tmapy < 0 || tmapy >= this.map.sideSize)
                return;
            room = this.map.rooms.getValue(tmapx, tmapy);
            if (!room) {
                room = this.map.revealMapPiece(tmapx, tmapy, sideTo);
            }
            else {
                if (!(sideTo & room.rotatedExits)) {
                    return;
                }
            }
            this.token.x += (tmapx - this.mapx) * Catacombs.Game.ROOM_IMG_SIZE;
            this.token.y += (tmapy - this.mapy) * Catacombs.Game.ROOM_IMG_SIZE;
            var oldRoom = this.map.rooms.getValue(this.mapx, this.mapy);
            if (oldRoom)
                oldRoom.players[this.playerID] = null;
            room.players[this.playerID] = this;
            this.mapx = tmapx;
            this.mapy = tmapy;
            var player = this;
            room.items.splice(0, room.items.length).forEach(function (i) {
                player.takeItem(i);
                i.sprite.parent.removeChild(i.sprite);
            });
        };
        Player.prototype.up = function () { this.move(8, 2); };
        Player.prototype.down = function () { this.move(2, 8); };
        Player.prototype.left = function () { this.move(1, 4); };
        Player.prototype.right = function () { this.move(4, 1); };
        return Player;
    }());
    Player.playersCount = 0;
    Catacombs.Player = Player;
})(Catacombs || (Catacombs = {}));
