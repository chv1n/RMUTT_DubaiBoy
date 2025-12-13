import { Test, TestingModule } from '@nestjs/testing';
import { DsahboardService } from './dsahboard.service';

describe('DsahboardService', () => {
  let service: DsahboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DsahboardService],
    }).compile();

    service = module.get<DsahboardService>(DsahboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
