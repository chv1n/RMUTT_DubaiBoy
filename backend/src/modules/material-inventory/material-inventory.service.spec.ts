import { Test, TestingModule } from '@nestjs/testing';
import { MaterialInventoryService } from './material-inventory.service';

describe('MaterialInventoryService', () => {
  let service: MaterialInventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaterialInventoryService],
    }).compile();

    service = module.get<MaterialInventoryService>(MaterialInventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
