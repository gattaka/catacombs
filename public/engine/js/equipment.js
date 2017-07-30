var Catacombs;
(function (Catacombs) {
    var EquipmentDef = (function () {
        function EquipmentDef(type, file, price, availableInstances) {
            this.type = type;
            this.file = file;
            this.price = price;
            this.availableInstances = availableInstances;
            EquipmentDef.totalAvailableInstances += availableInstances;
        }
        EquipmentDef.register = function (type, file, price, availableInstances) {
            EquipmentDef.defsByType[EquipmentType[type]] = new EquipmentDef(type, file, price, availableInstances);
            EquipmentDef.defsByOrder.push(EquipmentDef.defsByType[EquipmentType[type]]);
        };
        return EquipmentDef;
    }());
    EquipmentDef.totalAvailableInstances = 0;
    EquipmentDef.defsByType = {};
    EquipmentDef.defsByOrder = [];
    Catacombs.EquipmentDef = EquipmentDef;
    var Equipment = (function () {
        function Equipment(def) {
            this.def = def;
        }
        Equipment.create = function (def) {
            if (def.availableInstances == 0) {
                alert("Nepodařilo se získat odměnu - nejsou volné karty!");
                return null;
            }
            else {
                def.availableInstances--;
                EquipmentDef.totalAvailableInstances--;
                Equipment.equipmentCount++;
            }
            return new Equipment(def);
        };
        return Equipment;
    }());
    Equipment.equipmentCount = 0;
    Catacombs.Equipment = Equipment;
    var EquipmentType;
    (function (EquipmentType) {
        EquipmentType[EquipmentType["LANTERN"] = 0] = "LANTERN";
        EquipmentType[EquipmentType["LOCKPICKS"] = 1] = "LOCKPICKS";
        EquipmentType[EquipmentType["PICKAXE"] = 2] = "PICKAXE";
        EquipmentType[EquipmentType["SWORD"] = 3] = "SWORD";
        EquipmentType[EquipmentType["SHIELD"] = 4] = "SHIELD";
        EquipmentType[EquipmentType["ARMOR"] = 5] = "ARMOR";
    })(EquipmentType = Catacombs.EquipmentType || (Catacombs.EquipmentType = {}));
    // položky
    EquipmentDef.register(EquipmentType.LANTERN, "lantern_token", 4, 4);
    EquipmentDef.register(EquipmentType.LOCKPICKS, "lockpicks_token", 4, 2);
    EquipmentDef.register(EquipmentType.SWORD, "sword_token", 8, 4);
    EquipmentDef.register(EquipmentType.SHIELD, "shield_token", 8, 2);
    EquipmentDef.register(EquipmentType.ARMOR, "armor_token", 12, 3);
})(Catacombs || (Catacombs = {}));
