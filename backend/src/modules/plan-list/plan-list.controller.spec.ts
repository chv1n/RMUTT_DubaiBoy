import { Test, TestingModule } from '@nestjs/testing';
import { PlanListController } from './plan-list.controller';
import { PlanListService } from './plan-list.service';

describe('PlanListController', () => {
  let controller: PlanListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanListController],
      providers: [PlanListService],
    }).compile();

    controller = module.get<PlanListController>(PlanListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
