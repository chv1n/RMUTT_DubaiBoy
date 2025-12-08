import { Test, TestingModule } from '@nestjs/testing';
import { WarehouseMasterService } from './warehouse-master.service';

describe('WarehouseMasterService', () => {
  let service: WarehouseMasterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WarehouseMasterService],
    }).compile();

    service = module.get<WarehouseMasterService>(WarehouseMasterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
