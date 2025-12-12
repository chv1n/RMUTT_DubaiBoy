import { Test, TestingModule } from '@nestjs/testing';
import { PushLogService } from './push-log.service';

describe('PushLogService', () => {
  let service: PushLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PushLogService],
    }).compile();

    service = module.get<PushLogService>(PushLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
