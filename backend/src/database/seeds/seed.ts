import { AppDataSource } from '../data-source';
import { MaterialGroup } from '../../modules/material-group/entities/material-group.entity';
import { MaterialUnits } from '../../modules/unit/entities/unit.entity';
import { MaterialContainerType } from '../../modules/container-type/entities/container-type.entity';
import { Supplier } from '../../modules/supplier/entities/supplier.entity';
import { User } from '../../modules/user/entities/user.entity';
import { Role } from '../../common/enums/role.enum';
import { Product } from '../../modules/product/entities/product.entity';
import { ProductType } from '../../modules/product-type/entities/product-type.entity';
import { WarehouseMaster } from '../../modules/warehouse-master/entities/warehouse-master.entity';
import { MaterialMaster } from '../../modules/material/entities/material-master.entity';
import { Bom } from '../../modules/bom/entities/bom.entity';
import { ProductPlan } from '../../modules/product-plan/entities/product-plan.entity';
import { PlanStatusEnum } from '../../modules/product-plan/enum/plan-status.enum';
import { PlanPriorityEnum } from '../../modules/product-plan/enum/plan-priority.enum';
import { InventoryTransaction } from '../../modules/inventory-transaction/entities/inventory-transaction.entity';
import { MaterialInventory } from '../../modules/material-inventory/entities/material-inventory.entity';
import { Between } from 'typeorm';

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
            const exists = await groupRepo.findOne({ where: { group_name: groupData.group_name }, withDeleted: true });
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
            const exists = await unitRepo.findOne({ where: { unit_name: unitData.unit_name }, withDeleted: true });
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
            const exists = await containerRepo.findOne({ where: { type_name: containerData.type_name }, withDeleted: true });
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
            const exists = await supplierRepo.findOne({ where: { supplier_name: supplierData.supplier_name }, withDeleted: true });
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
            const exists = await productTypeRepo.findOne({ where: { type_name: typeData.type_name }, withDeleted: true });
            if (!exists) {
                await productTypeRepo.save(productTypeRepo.create(typeData));
                console.log(`Seeded ProductType: ${typeData.type_name}`);
            }
        }

        // Seed Products
        const productRepo = AppDataSource.getRepository(Product);
        const finishedType = await productTypeRepo.findOneBy({ type_name: 'Finished Goods' });
        const semiType = await productTypeRepo.findOneBy({ type_name: 'Semi-Finished Goods' });

        if (finishedType && semiType) {
            const products = [
                { product_name: '300mm Polished Wafer', product_type: semiType, active: 1 }, // Changed to Semi
                { product_name: 'Patterned Wafer', product_type: semiType, active: 1 },
                { product_name: 'Packaged Chip Type A', product_type: finishedType, active: 1 },
                { product_name: 'Solar Cell Unit', product_type: finishedType, active: 1 },
                { product_name: 'Test Die', product_type: semiType, active: 1 },
                // New Products for Model Training
                { product_name: 'High-Performance CPU (Gen 12)', product_type: finishedType, active: 1 },
                { product_name: 'IoT Wireless Module (Wi-Fi 6)', product_type: finishedType, active: 1 },
                { product_name: 'Automotive Sensor Chip (Lidar)', product_type: finishedType, active: 1 },
            ];

            for (const productData of products) {
                const exists = await productRepo.findOne({ where: { product_name: productData.product_name }, withDeleted: true });
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
            const exists = await warehouseRepo.findOne({ where: { warehouse_code: whData.warehouse_code }, withDeleted: true });
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
            const exists = await userRepo.findOne({ where: { username: userData.username }, withDeleted: true });
            if (!exists) {
                // We depend on the @BeforeInsert hook in User entity to hash the password
                const newUser = userRepo.create(userData);
                await userRepo.save(newUser);
                console.log(`Seeded User: ${userData.username} (${userData.role})`);
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
                const exists = await materialRepo.findOne({ where: { material_name: matData.material_name }, withDeleted: true });
                if (!exists) {
                    await materialRepo.save(materialRepo.create(matData));
                    console.log(`Seeded Material: ${matData.material_name}`);
                }
            }

            // --- Seed BOMs ---
            console.log("Seeding BOMs...");
            const bomRepo = AppDataSource.getRepository(Bom);
            const polishedWafer = await productRepo.findOneBy({ product_name: '300mm Polished Wafer' });
            const patternedWafer = await productRepo.findOneBy({ product_name: 'Patterned Wafer' });
            const packagedChip = await productRepo.findOneBy({ product_name: 'Packaged Chip Type A' });

            const primeWaferMat = await materialRepo.findOneBy({ material_name: '300mm Silicon Wafer (Prime)' });
            const testWaferMat = await materialRepo.findOneBy({ material_name: '300mm Silicon Wafer (Test)' }); // Added for IoT/Sensor
            const slurryMat = await materialRepo.findOneBy({ material_name: 'CMP Slurry (Oxide)' });
            const prMat = await materialRepo.findOneBy({ material_name: 'Photoresist PR-193nm' });
            const copperTargetMat = await materialRepo.findOneBy({ material_name: 'Copper Target (450mm)' });

            const bomsToSeed: Partial<Bom>[] = [];

            // BOM for Polished Wafer
            if (polishedWafer && primeWaferMat && slurryMat) {
                bomsToSeed.push(
                    { product: polishedWafer, material: primeWaferMat, unit: waferUnit, usage_per_piece: 1, scrap_factor: 0.05, active: 1, version: '1.0' as any },
                    { product: polishedWafer, material: slurryMat, unit: literUnit, usage_per_piece: 0.02, scrap_factor: 0.1, active: 1, version: '1.0' as any }
                );
            }

            // BOM for Patterned Wafer (Using PR)
            if (patternedWafer && prMat) {
                bomsToSeed.push(
                    { product: patternedWafer, material: prMat, unit: literUnit, usage_per_piece: 0.005, scrap_factor: 0.02, active: 1, version: '1.0' as any }
                );
            }

            // BOM for Packaged Chip (Using Copper Target)
            if (packagedChip && copperTargetMat) {
                bomsToSeed.push(
                    { product: packagedChip, material: copperTargetMat, unit: pieceUnit, usage_per_piece: 0.0001, scrap_factor: 0.01, active: 1, version: '1.0' as any }
                );
            }

            // --- New BOMs for Training Products ---
            const cpuProduct = await productRepo.findOneBy({ product_name: 'High-Performance CPU (Gen 12)' });
            const iotProduct = await productRepo.findOneBy({ product_name: 'IoT Wireless Module (Wi-Fi 6)' });
            const sensorProduct = await productRepo.findOneBy({ product_name: 'Automotive Sensor Chip (Lidar)' });

            // CPU BOM (Complex: Prime Wafer + Copper + PR)
            if (cpuProduct && primeWaferMat && copperTargetMat && prMat) {
                bomsToSeed.push(
                    { product: cpuProduct, material: primeWaferMat, unit: waferUnit, usage_per_piece: 1, scrap_factor: 0.03, active: 1, version: '1.0' as any },
                    { product: cpuProduct, material: copperTargetMat, unit: pieceUnit, usage_per_piece: 0.0002, scrap_factor: 0.01, active: 1, version: '1.0' as any },
                    { product: cpuProduct, material: prMat, unit: literUnit, usage_per_piece: 0.01, scrap_factor: 0.05, active: 1, version: '1.0' as any }
                );
            }

            // IoT Module BOM (Medium: Test Wafer + Copper)
            if (iotProduct && testWaferMat && copperTargetMat) {
                bomsToSeed.push(
                    { product: iotProduct, material: testWaferMat, unit: waferUnit, usage_per_piece: 1, scrap_factor: 0.05, active: 1, version: '1.0' as any },
                    { product: iotProduct, material: copperTargetMat, unit: pieceUnit, usage_per_piece: 0.0001, scrap_factor: 0.02, active: 1, version: '1.0' as any }
                );
            }

            // Sensor BOM (Simple: Test Wafer + PR)
            if (sensorProduct && testWaferMat && prMat) {
                bomsToSeed.push(
                    { product: sensorProduct, material: testWaferMat, unit: waferUnit, usage_per_piece: 1, scrap_factor: 0.1, active: 1, version: '1.0' as any },
                    { product: sensorProduct, material: prMat, unit: literUnit, usage_per_piece: 0.005, scrap_factor: 0.05, active: 1, version: '1.0' as any }
                );
            }

            for (const bomData of bomsToSeed) {
                const exists = await bomRepo.findOneBy({ product: { product_id: bomData.product?.product_id }, material: { material_id: bomData.material?.material_id } });
                if (!exists) {
                    await bomRepo.save(bomRepo.create(bomData as any));
                    console.log(`Seeded BOM for: ${bomData.product?.product_name} - ${bomData.material?.material_name}`);
                }
            }

            // --- Seed Product Plans ---
            console.log("Seeding Plans...");
            const planRepo = AppDataSource.getRepository(ProductPlan);

            const today = new Date();
            const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
            const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
            const lastMonth = new Date(today); lastMonth.setMonth(today.getMonth() - 1);
            const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

            const plans: Partial<ProductPlan>[] = [];

            if (polishedWafer && patternedWafer && packagedChip) {
                plans.push(
                    // PENDING Plans
                    {
                        plan_name: 'Q1 Wafer Polishing Run',
                        product: polishedWafer,
                        input_quantity: 5000,
                        start_date: tomorrow,
                        end_date: nextWeek,
                        plan_status: PlanStatusEnum.PENDING,
                        plan_priority: PlanPriorityEnum.HIGH,
                        estimated_cost: 25000000.00,
                        created_at: yesterday
                    },
                    {
                        plan_name: 'Patterning Test Batch',
                        product: patternedWafer,
                        input_quantity: 100,
                        start_date: today,
                        end_date: tomorrow,
                        plan_status: PlanStatusEnum.DRAFT, // Still in draft
                        plan_priority: PlanPriorityEnum.MEDIUM,
                        estimated_cost: 50000.00,
                        created_at: yesterday
                    },
                    // IN PROGRESS Plans
                    {
                        plan_name: 'Urgent Chip Packaging',
                        product: packagedChip,
                        input_quantity: 2000,
                        start_date: yesterday,
                        end_date: tomorrow,
                        plan_status: PlanStatusEnum.PRODUCTION,
                        plan_priority: PlanPriorityEnum.HIGH,
                        estimated_cost: 1000000.00,
                        started_at: yesterday,
                        created_at: lastMonth
                    },
                    // COMPLETED Plans
                    {
                        plan_name: 'Last Month Standard Run',
                        product: polishedWafer,
                        input_quantity: 10000,
                        actual_produced_quantity: 9980,
                        start_date: lastMonth,
                        end_date: yesterday,
                        plan_status: PlanStatusEnum.COMPLETED,
                        plan_priority: PlanPriorityEnum.MEDIUM,
                        estimated_cost: 50000000.00,
                        actual_cost: 49500000.00,
                        started_at: lastMonth,
                        completed_at: yesterday,
                        created_at: lastMonth
                    },
                    // CANCELLED Plans
                    {
                        plan_name: 'Faulty Experiment Plan',
                        product: patternedWafer,
                        input_quantity: 50,
                        start_date: lastMonth,
                        end_date: lastMonth,
                        plan_status: PlanStatusEnum.CANCELLED,
                        plan_priority: PlanPriorityEnum.LOW,
                        estimated_cost: 10000.00,
                        cancelled_at: lastMonth,
                        cancel_reason: "Equipment failure on line 2",
                        created_at: lastMonth
                    }
                );
            }

            for (const planData of plans) {
                const exists = await planRepo.findOne({ where: { plan_name: planData.plan_name }, withDeleted: true });
                if (!exists) {
                    await planRepo.save(planRepo.create(planData as any));
                    console.log(`Seeded Plan: ${planData.plan_name}`);
                }
            }

        } else {
            console.warn('Skipping Material seeding due to missing dependencies.');
        }
        // --- Demo Data Generation (6 Months History) ---
        console.log('Generating 6 Months Historical Data...');
        await generateHistoricalData();
        await generateHistoricalPlans(); // Add this call

        console.log('Seeding completed successfully.');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

async function generateHistoricalData() {
    const transactionRepo = AppDataSource.getRepository(InventoryTransaction);
    const inventoryRepo = AppDataSource.getRepository(MaterialInventory);
    const materialRepo = AppDataSource.getRepository(MaterialMaster);
    const warehouseRepo = AppDataSource.getRepository(WarehouseMaster);

    const materials = await materialRepo.find();
    const warehouses = await warehouseRepo.find();

    if (materials.length === 0 || warehouses.length === 0) {
        console.log("Skipping historical data: No materials or warehouses found.");
        return;
    }

    const today = new Date();
    const startDate = new Date();
    startDate.setMonth(today.getMonth() - 6);

    const mainWarehouse = warehouses[0]; // Assume first is main

    // 1. Ensure Inventory Exists for Materials
    const inventories: MaterialInventory[] = [];
    for (const mat of materials) {
        let inv = await inventoryRepo.findOne({
            where: { material: { material_id: mat.material_id }, warehouse: { id: mainWarehouse.id } }
        });

        if (!inv) {
            inv = inventoryRepo.create({
                material: mat,
                warehouse: mainWarehouse,
                quantity: Math.floor(Math.random() * 500) + 100, // Initial Base
                reserved_quantity: 0,
                order_number: `INIT-${mat.material_id}`,
                mfg_date: new Date(),
                exp_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            });
            await inventoryRepo.save(inv);
        }
        inventories.push(inv);
    }

    // 2. Generate Daily Transactions
    const transactions: any[] = [];
    const loopDate = new Date(startDate);

    while (loopDate <= today) {
        // Randomly select some materials to have transactions today
        const dailyActiveMaterials = inventories.sort(() => 0.5 - Math.random()).slice(0, Math.floor(inventories.length * 0.3));

        for (const inv of dailyActiveMaterials) {
            // Decide Inbound vs Outbound
            // 40% Inbound, 60% Outbound (Consumption)
            const isInbound = Math.random() > 0.6;
            const qty = Math.floor(Math.random() * 50) + 1;
            const change = isInbound ? qty : -qty;

            // Only allow outbound if enough stock (logic proxy)
            // Ideally we track running stock, but for seed we just generate records.
            // Dashboard calculates trends from these records.

            transactions.push({
                materialInventory: inv,
                warehouse: mainWarehouse,
                transaction_type: isInbound ? 'PURCHASE' : 'PRODUCTION_ISSUE',
                transaction_date: new Date(loopDate), // Clone date
                quantity_change: change,
                reference_number: `REF-${loopDate.getTime()}-${Math.floor(Math.random() * 1000)}`,
                reason_remarks: isInbound ? 'Restock' : 'Used in production'
            });
        }

        loopDate.setDate(loopDate.getDate() + 1);
    }


    // Batch insert transactions for performance
    // Chunking to avoid memory issues
    const chunkSize = 100;
    for (let i = 0; i < transactions.length; i += chunkSize) {
        const chunk = transactions.slice(i, i + chunkSize);
        await transactionRepo.save(transactionRepo.create(chunk));
    }
    console.log(`Generated ${transactions.length} historical transactions.`);
}

async function generateHistoricalPlans() {
    console.log("Generating Historical Plans for Model Training...");
    const planRepo = AppDataSource.getRepository(ProductPlan);
    const productRepo = AppDataSource.getRepository(Product);

    const products = await productRepo.find({ where: { is_active: true } });

    if (products.length === 0) {
        console.warn("No active products found for historical plan generation.");
        return;
    }

    const today = new Date();
    const sixMonthsAgo = new Date(); // Changed to 6 months
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    const plansToSeed: any[] = [];

    for (const product of products) {
        // Generate plans for the last 60 days (1 per day) matching SQL logic
        for (let i = 1; i <= 60; i++) {
            // Date logic: CURRENT_DATE - gs (i)
            const planDate = new Date(today);
            planDate.setDate(today.getDate() - i);

            // Input Qty: 900 + random(0-200)
            const inputQty = 900 + Math.floor(Math.random() * 201);

            // Actual Qty: Input * (0.95 + random(0-0.10)) -> 95% to 105%
            const actualQty = Math.floor(inputQty * (0.95 + Math.random() * 0.10));

            // Random cost based on input qty (keeping previous cost logic as SQL didn't specify cost explicitly but required context)
            const estCost = inputQty * 100; // Simplified cost
            const actualCost = estCost * (actualQty / inputQty);

            plansToSeed.push({
                plan_name: `Backfill Plan (30 days) - ${product.product_name} - Day ${i}`,
                plan_description: 'Insert ย้อนหลังเพื่อ retrain model',
                product: product,
                input_quantity: inputQty,
                actual_produced_quantity: actualQty,
                start_date: planDate,
                end_date: planDate, // SQL has start=end
                plan_status: PlanStatusEnum.COMPLETED,
                plan_priority: PlanPriorityEnum.MEDIUM,
                started_at: planDate,
                completed_at: new Date(planDate.getTime() + 60 * 60 * 1000), // +1 hour as per SQL
                estimated_cost: estCost,
                actual_cost: actualCost,
                created_at: new Date()
            });
        }
    }

    // Save plans
    for (const plan of plansToSeed) {
        // Check if exists to avoid dupes on re-run (though names are unique-ish, strict check helps)
        const exists = await planRepo.findOne({ where: { plan_name: plan.plan_name }, withDeleted: true });
        if (!exists) {
            await planRepo.save(planRepo.create(plan));
        }
    }
    console.log(`Generated ${plansToSeed.length} historical plans.`);
}

seed();
