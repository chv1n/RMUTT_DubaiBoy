import { Test, TestingModule } from '@nestjs/testing';
import { WarehouseMasterController } from './warehouse-master.controller';
import { WarehouseMasterService } from './warehouse-master.service';

describe('WarehouseMasterController', () => {
  let controller: WarehouseMasterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WarehouseMasterController],
      providers: [WarehouseMasterService],
    }).compile();

    controller = module.get<WarehouseMasterController>(WarehouseMasterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
