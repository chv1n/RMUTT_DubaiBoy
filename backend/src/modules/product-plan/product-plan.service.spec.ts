import { Test, TestingModule } from '@nestjs/testing';
import { ProductPlanService } from './product-plan.service';

describe('ProductPlanService', () => {
  let service: ProductPlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductPlanService],
    }).compile();

    service = module.get<ProductPlanService>(ProductPlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
