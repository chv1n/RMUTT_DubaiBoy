import { Test, TestingModule } from '@nestjs/testing';
import { DsahboardController } from './dsahboard.controller';
import { DsahboardService } from './dsahboard.service';

describe('DsahboardController', () => {
  let controller: DsahboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DsahboardController],
      providers: [DsahboardService],
    }).compile();

    controller = module.get<DsahboardController>(DsahboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
