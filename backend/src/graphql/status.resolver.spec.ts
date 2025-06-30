import { Test, TestingModule } from '@nestjs/testing';
import { StatusResolver, StatusResponse } from './status.resolver';

describe('StatusResolver', () => {
  let resolver: StatusResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusResolver],
    }).compile();

    resolver = module.get<StatusResolver>(StatusResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('status', () => {
    it('should return status ok', () => {
      const result = resolver.status();
      
      expect(result).toEqual({
        result: 'ok',
      });
    });

    it('should return a StatusResponse object', () => {
      const result = resolver.status();
      
      expect(result).toBeInstanceOf(Object);
      expect(result).toHaveProperty('result');
      expect(typeof result.result).toBe('string');
    });
  });
}); 