import { Test, TestingModule } from '@nestjs/testing';
import { PlanListService } from './plan-list.service';

describe('PlanListService', () => {
  let service: PlanListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanListService],
    }).compile();

    service = module.get<PlanListService>(PlanListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
