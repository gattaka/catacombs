namespace Catacombs {

    export abstract class MapItem {
        constructor(
            protected map: Map,
            public id: number,
            public mapx: number,
            public mapy: number,
        ) {}
    }

}