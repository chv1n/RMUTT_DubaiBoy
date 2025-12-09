import { Test, TestingModule } from '@nestjs/testing';
import { ProductPlanController } from './product-plan.controller';
import { ProductPlanService } from './product-plan.service';

describe('ProductPlanController', () => {
  let controller: ProductPlanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductPlanController],
      providers: [ProductPlanService],
    }).compile();

    controller = module.get<ProductPlanController>(ProductPlanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
