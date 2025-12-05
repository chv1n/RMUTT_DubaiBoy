import { AppDataSource } from '../data-source';
import { MaterialGroup } from '../../modules/material-group/entities/material-group.entity';
import { MaterialUnits } from '../../modules/unit/entities/unit.entity';
import { MaterialContainerType } from '../../modules/container-type/entities/container-type.entity';
import { Supplier } from '../../modules/supplier/entities/supplier.entity';

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

        console.log('Seeding completed successfully.');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

seed();
