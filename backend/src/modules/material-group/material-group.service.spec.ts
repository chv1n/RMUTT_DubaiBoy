import { Test, TestingModule } from '@nestjs/testing';
import { MaterialGroupService } from './material-group.service';

describe('MaterialGroupService', () => {
  let service: MaterialGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaterialGroupService],
    }).compile();

    service = module.get<MaterialGroupService>(MaterialGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
