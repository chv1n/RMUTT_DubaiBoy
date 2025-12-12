import { AppDataSource } from '../data-source';
import { MaterialGroup } from '../../modules/material-group/entities/material-group.entity';
import { MaterialUnits } from '../../modules/unit/entities/unit.entity';
import { MaterialContainerType } from '../../modules/container-type/entities/container-type.entity';
import { Supplier } from '../../modules/supplier/entities/supplier.entity';
import { User } from '../../modules/user/entities/user.entity'; // Import User entity
import { Role } from '../../common/enums/role.enum'; // Import Role enum
import { Product } from '../../modules/product/entities/product.entity';
import { ProductType } from '../../modules/product-type/entities/product-type.entity';
import { WarehouseMaster } from '../../modules/warehouse-master/entities/warehouse-master.entity';
import { MaterialMaster } from '../../modules/material/entities/material-master.entity';

async function seed() {
    try {
        console.log('Initializing DataSource...');
        await AppDataSource.initialize();
        console.log('DataSource initialized.');

        // Seed Material Groups (Semiconductor Context)
        const groupRepo = AppDataSource.getRepository(MaterialGroup);
        const groups = [
            { group_name: 'ซิลิคอนเวเฟอร์', abbreviation: 'WAFER' },
            { group_name: 'สารเคมี', abbreviation: 'CHEM' },
            { group_name: 'แก๊สอุตสาหกรรม', abbreviation: 'GAS' },
            { group_name: 'โฟโตเรซิสต์', abbreviation: 'PR' },
            { group_name: 'วัสดุบรรจุภัณฑ์', abbreviation: 'PKG' },
            { group_name: 'อะไหล่เครื่องจักร', abbreviation: 'SPARE' },
        ];

        for (const groupData of groups) {
            const exists = await groupRepo.findOneBy({ group_name: groupData.group_name });
            if (!exists) {
                await groupRepo.save(groupRepo.create(groupData));
                console.log(`Seeded MaterialGroup: ${groupData.group_name}`);
            }
        }

        // Seed Material Units
        const unitRepo = AppDataSource.getRepository(MaterialUnits);
        const units = [
            { unit_name: 'แผ่น' }, // Wafer
            { unit_name: 'ลิตร' }, // Chemicals
            { unit_name: 'กิโลกรัม' },
            { unit_name: 'ถัง' }, // Gas cylinders
            { unit_name: 'กรัม' },
            { unit_name: 'ชิ้น' },
            { unit_name: 'กล่อง' },
            { unit_name: 'มิลลิลิตร' },
        ];

        for (const unitData of units) {
            const exists = await unitRepo.findOneBy({ unit_name: unitData.unit_name });
            if (!exists) {
                await unitRepo.save(unitRepo.create(unitData));
                console.log(`Seeded MaterialUnit: ${unitData.unit_name}`);
            }
        }

        // Seed Container Types (Semiconductor Context)
        const containerRepo = AppDataSource.getRepository(MaterialContainerType);
        const containers = [
            { type_name: 'FOUP' }, // Front Opening Unified Pod
            { type_name: 'Cassette' },
            { type_name: 'Canister' }, // For chemicals
            { type_name: 'Cylinder' }, // For gases
            { type_name: 'Bottle' },
            { type_name: 'Box' },
            { type_name: 'Tray' },
        ];

        for (const containerData of containers) {
            const exists = await containerRepo.findOneBy({ type_name: containerData.type_name });
            if (!exists) {
                await containerRepo.save(containerRepo.create(containerData));
                console.log(`Seeded ContainerType: ${containerData.type_name}`);
            }
        }

        // Seed Suppliers (Semiconductor Context)
        const supplierRepo = AppDataSource.getRepository(Supplier);
        const suppliers = [
            {
                supplier_name: 'Siam Silicon Wafer Co., Ltd.',
                phone: '02-111-2222',
                email: 'sales@siamsilicon.com',
                address: 'นิคมอุตสาหกรรมลาดกระบัง กทม.',
                active: 1,
            },
            {
                supplier_name: 'Advanced Chemical Solutions',
                phone: '038-333-4444',
                email: 'contact@advchem.com',
                address: 'นิคมอุตสาหกรรมมาบตาพุด ระยอง',
                active: 1,
            },
            {
                supplier_name: 'Pure Gas Supply',
                phone: '02-555-6666',
                email: 'info@puregas.com',
                address: 'บางนา-ตราด กม.10 สมุทรปราการ',
                active: 1,
            },
            {
                supplier_name: 'TechParts Precision',
                phone: '02-777-8888',
                email: 'support@techparts.com',
                address: 'นิคมอุตสาหกรรมไฮเทค อยุธยา',
                active: 1,
            },
            {
                supplier_name: 'Global Packaging Materials',
                phone: '02-999-0000',
                email: 'sales@globalpkg.com',
                address: 'นิคมอุตสาหกรรมบางปู สมุทรปราการ',
                active: 1,
            },
        ];

        for (const supplierData of suppliers) {
            const exists = await supplierRepo.findOneBy({ supplier_name: supplierData.supplier_name });
            if (!exists) {
                await supplierRepo.save(supplierRepo.create(supplierData));
                console.log(`Seeded Supplier: ${supplierData.supplier_name}`);
            }
        }


        // Seed Product Types
        const productTypeRepo = AppDataSource.getRepository(ProductType);
        const productTypes = [
            { type_name: 'Finished Goods', active: 1 },
            { type_name: 'Semi-Finished Goods', active: 1 },
            { type_name: 'Prototype', active: 1 },
        ];

        for (const typeData of productTypes) {
            const exists = await productTypeRepo.findOneBy({ type_name: typeData.type_name });
            if (!exists) {
                await productTypeRepo.save(productTypeRepo.create(typeData));
                console.log(`Seeded ProductType: ${typeData.type_name}`);
            }
        }

        // Seed Products
        const productRepo = AppDataSource.getRepository(Product);
        // We need to fetch the types to link them, assuming they were just seeded or exist
        const finishedType = await productTypeRepo.findOneBy({ type_name: 'Finished Goods' });
        const semiType = await productTypeRepo.findOneBy({ type_name: 'Semi-Finished Goods' });

        if (finishedType && semiType) {
            const products = [
                { product_name: '300mm Polished Wafer', product_type: finishedType, active: 1 },
                { product_name: 'Patterned Wafer', product_type: semiType, active: 1 },
                { product_name: 'Packaged Chip Type A', product_type: finishedType, active: 1 },
                { product_name: 'Solar Cell Unit', product_type: finishedType, active: 1 },
                { product_name: 'Test Die', product_type: semiType, active: 1 },
            ];

            for (const productData of products) {
                const exists = await productRepo.findOneBy({ product_name: productData.product_name });
                if (!exists) {
                    await productRepo.save(productRepo.create(productData));
                    console.log(`Seeded Product: ${productData.product_name}`);
                }
            }
        }



        // Seed Warehouses
        const warehouseRepo = AppDataSource.getRepository(WarehouseMaster);
        const warehouses = [
            {
                warehouse_name: 'Main Warehouse',
                warehouse_code: 'WH-001',
                warehouse_phone: '02-123-4567',
                warehouse_address: '123 Industrial Estate, Bangkok',
                warehouse_email: 'warehouse.main@example.com',
                is_active: true
            },
            {
                warehouse_name: 'Chemical Storage',
                warehouse_code: 'WH-002',
                warehouse_phone: '02-123-4568',
                warehouse_address: '123 Industrial Estate, Bangkok',
                warehouse_email: 'warehouse.chem@example.com',
                is_active: true
            },
            {
                warehouse_name: 'Cold Storage',
                warehouse_code: 'WH-003',
                warehouse_phone: '02-123-4569',
                warehouse_address: '123 Industrial Estate, Bangkok',
                warehouse_email: 'warehouse.cold@example.com',
                is_active: true
            }
        ];

        for (const whData of warehouses) {
            const exists = await warehouseRepo.findOneBy({ warehouse_code: whData.warehouse_code });
            if (!exists) {
                await warehouseRepo.save(warehouseRepo.create(whData));
                console.log(`Seeded Warehouse: ${whData.warehouse_name}`);
            }
        }

        // Seed Users
        const userRepo = AppDataSource.getRepository(User);
        const users = [
            {
                username: 'superadmin',
                email: 'superadmin@example.com',
                password: '123123',
                fullname: 'Super Admin User',
                role: Role.SUPER_ADMIN,
                active: true,
            },
            {
                username: 'admin',
                email: 'admin@example.com',
                password: '123123',
                fullname: 'Admin User',
                role: Role.ADMIN,
                active: true,
            },
            {
                username: 'user',
                email: 'user@example.com',
                password: '123123',
                fullname: 'Regular User',
                role: Role.USER,
                active: true,
            },
        ];

        for (const userData of users) {
            const exists = await userRepo.findOneBy({ username: userData.username });
            if (!exists) {
                // We depend on the @BeforeInsert hook in User entity to hash the password
                const newUser = userRepo.create(userData);
                await userRepo.save(newUser);
                console.log(`Seeded User: ${userData.username} (${userData.role})`);
            } else {
                console.log(`User already exists: ${userData.username}`);
            }
        }

        // --- Seed Materials ---
        console.log('Seeding Materials...');
        const materialRepo = AppDataSource.getRepository(MaterialMaster);

        // Fetch dependencies for lookups
        const waferGroup = await groupRepo.findOneBy({ group_name: 'ซิลิคอนเวเฟอร์' });
        const chemGroup = await groupRepo.findOneBy({ group_name: 'สารเคมี' });
        const prGroup = await groupRepo.findOneBy({ group_name: 'โฟโตเรซิสต์' });
        const gasGroup = await groupRepo.findOneBy({ group_name: 'แก๊สอุตสาหกรรม' });
        const spareGroup = await groupRepo.findOneBy({ group_name: 'อะไหล่เครื่องจักร' });

        const waferUnit = await unitRepo.findOneBy({ unit_name: 'แผ่น' });
        const literUnit = await unitRepo.findOneBy({ unit_name: 'ลิตร' });
        const cylUnit = await unitRepo.findOneBy({ unit_name: 'ถัง' });
        const pieceUnit = await unitRepo.findOneBy({ unit_name: 'ชิ้น' });

        const foupCont = await containerRepo.findOneBy({ type_name: 'FOUP' });
        const canisterCont = await containerRepo.findOneBy({ type_name: 'Canister' });
        const bottleCont = await containerRepo.findOneBy({ type_name: 'Bottle' });
        const cylinderCont = await containerRepo.findOneBy({ type_name: 'Cylinder' });
        const boxCont = await containerRepo.findOneBy({ type_name: 'Box' });

        const siamSilicon = await supplierRepo.findOneBy({ supplier_name: 'Siam Silicon Wafer Co., Ltd.' });
        const advChem = await supplierRepo.findOneBy({ supplier_name: 'Advanced Chemical Solutions' });
        const pureGas = await supplierRepo.findOneBy({ supplier_name: 'Pure Gas Supply' });
        const techParts = await supplierRepo.findOneBy({ supplier_name: 'TechParts Precision' });

        if (waferGroup && chemGroup && prGroup && gasGroup && spareGroup &&
            waferUnit && literUnit && cylUnit && pieceUnit &&
            foupCont && canisterCont && bottleCont && cylinderCont && boxCont &&
            siamSilicon && advChem && pureGas && techParts) {

            const materials = [
                {
                    material_name: '300mm Silicon Wafer (Prime)',
                    material_group: waferGroup,
                    unit: waferUnit,
                    container_type: foupCont,
                    quantity_per_container: 25,
                    container_min_stock: 10,
                    container_max_stock: 50,
                    order_leadtime: 14,
                    lifetime: 180,
                    lifetime_unit: 'days',
                    cost_per_unit: 5000,
                    supplier: siamSilicon,
                    is_active: true
                },
                {
                    material_name: '300mm Silicon Wafer (Test)',
                    material_group: waferGroup,
                    unit: waferUnit,
                    container_type: foupCont,
                    quantity_per_container: 25,
                    container_min_stock: 20,
                    container_max_stock: 100,
                    order_leadtime: 14,
                    lifetime: 365,
                    lifetime_unit: 'days',
                    cost_per_unit: 2000,
                    supplier: siamSilicon,
                    is_active: true
                },
                {
                    material_name: 'Photoresist PR-193nm',
                    material_group: prGroup,
                    unit: literUnit,
                    container_type: bottleCont,
                    quantity_per_container: 4,
                    container_min_stock: 5,
                    container_max_stock: 20,
                    order_leadtime: 30,
                    lifetime: 90,
                    lifetime_unit: 'days',
                    cost_per_unit: 15000,
                    supplier: advChem,
                    is_active: true
                },
                {
                    material_name: 'Developer Solution (TMAH 2.38%)',
                    material_group: chemGroup,
                    unit: literUnit,
                    container_type: canisterCont,
                    quantity_per_container: 20,
                    container_min_stock: 10,
                    container_max_stock: 40,
                    order_leadtime: 7,
                    lifetime: 180,
                    lifetime_unit: 'days',
                    cost_per_unit: 500,
                    supplier: advChem,
                    is_active: true
                },
                {
                    material_name: 'Sulfuric Acid (H2SO4 - ULSI)',
                    material_group: chemGroup,
                    unit: literUnit,
                    container_type: canisterCont,
                    quantity_per_container: 20,
                    container_min_stock: 15,
                    container_max_stock: 50,
                    order_leadtime: 5,
                    lifetime: 365,
                    lifetime_unit: 'days',
                    cost_per_unit: 300,
                    supplier: advChem,
                    is_active: true
                },
                {
                    material_name: 'Hydrogen Peroxide (H2O2)',
                    material_group: chemGroup,
                    unit: literUnit,
                    container_type: canisterCont,
                    quantity_per_container: 20,
                    container_min_stock: 15,
                    container_max_stock: 50,
                    order_leadtime: 5,
                    lifetime: 90,
                    lifetime_unit: 'days',
                    cost_per_unit: 400,
                    supplier: advChem,
                    is_active: true
                },
                {
                    material_name: 'Nitrogen Gas (N2 - 99.999%)',
                    material_group: gasGroup,
                    unit: cylUnit,
                    container_type: cylinderCont,
                    quantity_per_container: 1,
                    container_min_stock: 20,
                    container_max_stock: 100,
                    order_leadtime: 2,
                    lifetime: 3650,
                    lifetime_unit: 'days',
                    cost_per_unit: 4000,
                    supplier: pureGas,
                    is_active: true
                },
                {
                    material_name: 'Silane Gas (SiH4)',
                    material_group: gasGroup,
                    unit: cylUnit,
                    container_type: cylinderCont,
                    quantity_per_container: 1,
                    container_min_stock: 5,
                    container_max_stock: 20,
                    order_leadtime: 45,
                    lifetime: 365,
                    lifetime_unit: 'days',
                    cost_per_unit: 25000,
                    supplier: pureGas,
                    is_active: true
                },
                {
                    material_name: 'Copper Target (450mm)',
                    material_group: spareGroup,
                    unit: pieceUnit,
                    container_type: boxCont,
                    quantity_per_container: 1,
                    container_min_stock: 2,
                    container_max_stock: 10,
                    order_leadtime: 60,
                    lifetime: 0,
                    lifetime_unit: 'days',
                    cost_per_unit: 80000,
                    supplier: techParts,
                    is_active: true
                },
                {
                    material_name: 'CMP Slurry (Oxide)',
                    material_group: chemGroup,
                    unit: literUnit,
                    container_type: canisterCont,
                    quantity_per_container: 20,
                    container_min_stock: 8,
                    container_max_stock: 32,
                    order_leadtime: 21,
                    lifetime: 120,
                    lifetime_unit: 'days',
                    cost_per_unit: 2000,
                    supplier: advChem,
                    is_active: true
                }
            ];

            for (const matData of materials) {
                const exists = await materialRepo.findOneBy({ material_name: matData.material_name });
                if (!exists) {
                    await materialRepo.save(materialRepo.create(matData));
                    console.log(`Seeded Material: ${matData.material_name}`);
                }
            }
        } else {
            console.warn('Skipping Material seeding due to missing dependencies.');
        }

        console.log('Seeding completed successfully.');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

seed();
