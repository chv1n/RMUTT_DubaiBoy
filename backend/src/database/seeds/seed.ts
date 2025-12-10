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

        console.log('Seeding completed successfully.');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

seed();
