import { Test, TestingModule } from '@nestjs/testing';
import { PushLogController } from './push-log.controller';
import { PushLogService } from './push-log.service';

describe('PushLogController', () => {
  let controller: PushLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PushLogController],
      providers: [PushLogService],
    }).compile();

    controller = module.get<PushLogController>(PushLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
