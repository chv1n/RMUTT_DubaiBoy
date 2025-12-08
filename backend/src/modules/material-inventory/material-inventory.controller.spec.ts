import { Test, TestingModule } from '@nestjs/testing';
import { MaterialInventoryController } from './material-inventory.controller';
import { MaterialInventoryService } from './material-inventory.service';

describe('MaterialInventoryController', () => {
  let controller: MaterialInventoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialInventoryController],
      providers: [MaterialInventoryService],
    }).compile();

    controller = module.get<MaterialInventoryController>(MaterialInventoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
