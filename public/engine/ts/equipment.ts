namespace Catacombs {

    export class EquipmentDef {
        public static totalAvailableInstances = 0;
        public static defsByType: { [name: string]: EquipmentDef } = {};
        private static defsByOrder = [];
        public static register(type: EquipmentType, file: string, price: number, availableInstances: number) {
            EquipmentDef.defsByType[EquipmentType[type]] = new EquipmentDef(type, file, price, availableInstances);
            EquipmentDef.defsByOrder.push(EquipmentDef.defsByType[EquipmentType[type]]);
        }

        private constructor(public type: EquipmentType, public file: string, public price: number, public availableInstances: number) {
            EquipmentDef.totalAvailableInstances += availableInstances;
        }

    }

    export class Equipment {
        public static equipmentCount = 0;

        public static create(def: EquipmentDef): Equipment {
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

    export enum EquipmentType {
        LANTERN, LOCKPICK, PICKAXE, SWORD, SHIELD, ARMOR, POTION, CROSSBOW
    }

    // položky
    EquipmentDef.register(EquipmentType.POTION, "potion_token", 4, 99999);
    EquipmentDef.register(EquipmentType.LOCKPICK, "lockpicks_token", 4, 2);
    EquipmentDef.register(EquipmentType.SWORD, "sword_token", 4, 4);
    EquipmentDef.register(EquipmentType.CROSSBOW, "crossbow_token", 8, 4);
    EquipmentDef.register(EquipmentType.ARMOR, "armor_token", 8, 3);

}