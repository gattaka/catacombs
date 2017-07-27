var Catacombs;
(function (Catacombs) {
    var EquipmentDef = (function () {
        function EquipmentDef(name, price, availableInstances) {
            this.name = name;
            this.price = price;
            this.availableInstances = availableInstances;
            EquipmentDef.totalAvailableInstances += availableInstances;
        }
        EquipmentDef.register = function (name, price, availableInstances) {
            EquipmentDef.defsByName[name] = new EquipmentDef(name, price, availableInstances);
            EquipmentDef.defsByOrder.push(EquipmentDef.defsByName[name]);
        };
        return EquipmentDef;
    }());
    EquipmentDef.totalAvailableInstances = 0;
    EquipmentDef.defsByName = {};
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
    // položky
    EquipmentDef.register("lantern", 4, 4);
    EquipmentDef.register("pickaxe", 4, 2);
    EquipmentDef.register("sword", 8, 4);
    EquipmentDef.register("shield", 8, 2);
    EquipmentDef.register("armor", 12, 3);
})(Catacombs || (Catacombs = {}));
