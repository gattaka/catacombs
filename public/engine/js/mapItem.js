var Catacombs;
(function (Catacombs) {
    var MapItem = (function () {
        function MapItem(map, id, mapx, mapy) {
            this.map = map;
            this.id = id;
            this.mapx = mapx;
            this.mapy = mapy;
        }
        return MapItem;
    }());
    Catacombs.MapItem = MapItem;
})(Catacombs || (Catacombs = {}));
