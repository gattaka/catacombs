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
        Equipment.create = function (map, mapx, mapy, def) {
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
    EquipmentDef.register("lantern", 5, 4);
    EquipmentDef.register("pickaxe", 5, 2);
    EquipmentDef.register("sword", 10, 4);
    EquipmentDef.register("shield", 10, 2);
    EquipmentDef.register("armor", 15, 3);
})(Catacombs || (Catacombs = {}));
