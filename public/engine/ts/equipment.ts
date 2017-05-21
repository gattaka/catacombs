namespace Catacombs {

    export class EquipmentDef {
        public static totalAvailableInstances = 0;
        public static defsByName: { [name: string]: EquipmentDef } = {};
        private static defsByOrder = [];
        public static register(name: string, price: number, availableInstances: number) {
            EquipmentDef.defsByName[name] = new EquipmentDef(name, price, availableInstances);
            EquipmentDef.defsByOrder.push(EquipmentDef.defsByName[name]);
        }

        private constructor(public name: string, public price: number, public availableInstances: number) {
            EquipmentDef.totalAvailableInstances += availableInstances;
        }

    }

    export class Equipment {
        public static equipmentCount = 0;

        public static create(map: Map, mapx: number, mapy: number, def: EquipmentDef): Equipment {
            if (def.availableInstances == 0) {
                alert("Nepodařilo se získat odměnu - nejsou volné karty!");
                return null;
            } else {
                def.availableInstances--;
                EquipmentDef.totalAvailableInstances--;
                Equipment.equipmentCount++;
            }
            return new Equipment(def);
        }

        private constructor(
            public def: EquipmentDef
        ) { }
    }

    // položky
    EquipmentDef.register("lantern", 5, 4);
    EquipmentDef.register("pickaxe", 5, 2);
    EquipmentDef.register("sword", 10, 4);
    EquipmentDef.register("shield", 10, 2);
    EquipmentDef.register("armor", 15, 3);

}