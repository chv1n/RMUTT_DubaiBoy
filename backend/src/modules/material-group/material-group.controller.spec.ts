import { Test, TestingModule } from '@nestjs/testing';
import { MaterialGroupController } from './material-group.controller';

describe('MaterialGroupController', () => {
  let controller: MaterialGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialGroupController],
    }).compile();

    controller = module.get<MaterialGroupController>(MaterialGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
