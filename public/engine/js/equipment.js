var Catacombs;
(function (Catacombs) {
    var EquipmentDef = /** @class */ (function () {
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
        EquipmentDef.totalAvailableInstances = 0;
        EquipmentDef.defsByType = {};
        EquipmentDef.defsByOrder = [];
        return EquipmentDef;
    }());
    Catacombs.EquipmentDef = EquipmentDef;
    var Equipment = /** @class */ (function () {
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
        Equipment.equipmentCount = 0;
        return Equipment;
    }());
    Catacombs.Equipment = Equipment;
    var EquipmentType;
    (function (EquipmentType) {
        EquipmentType[EquipmentType["LANTERN"] = 0] = "LANTERN";
        EquipmentType[EquipmentType["LOCKPICK"] = 1] = "LOCKPICK";
        EquipmentType[EquipmentType["PICKAXE"] = 2] = "PICKAXE";
        EquipmentType[EquipmentType["SWORD"] = 3] = "SWORD";
        EquipmentType[EquipmentType["SHIELD"] = 4] = "SHIELD";
        EquipmentType[EquipmentType["ARMOR"] = 5] = "ARMOR";
        EquipmentType[EquipmentType["POTION"] = 6] = "POTION";
        EquipmentType[EquipmentType["CROSSBOW"] = 7] = "CROSSBOW";
    })(EquipmentType = Catacombs.EquipmentType || (Catacombs.EquipmentType = {}));
    // položky
    EquipmentDef.register(EquipmentType.POTION, "potion_token", 4, 99999);
    EquipmentDef.register(EquipmentType.LOCKPICK, "lockpicks_token", 4, 2);
    EquipmentDef.register(EquipmentType.SWORD, "sword_token", 4, 4);
    EquipmentDef.register(EquipmentType.CROSSBOW, "crossbow_token", 8, 4);
    EquipmentDef.register(EquipmentType.ARMOR, "armor_token", 8, 3);
})(Catacombs || (Catacombs = {}));
