import { MongoIdStringPipe } from './mongo-id-string.pipe';
import { BadRequestException } from '@nestjs/common';

describe('MongoIdStringPipe', () => {
  let pipe: MongoIdStringPipe;
  beforeEach(() => {
    pipe = new MongoIdStringPipe();
  });
  const validId: string = '637f10e03f8d761c869142c1';
  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });
  describe('arrayMode', () => {
    beforeEach(() => {
      pipe = new MongoIdStringPipe(true);
    });
    it('should check array of ids and return array if all id is mongoId', () => {
      // given
      const expectedValue: string[] = [validId];
      // when
      const result: string[] = pipe.transform(expectedValue) as any;
      // then
      expect(result).toEqual(expectedValue);
    });
    it('should check array of ids and throw error if not all id is mongoId', () => {
      // given
      const expectedError: BadRequestException = new BadRequestException(
        'Array include invalid mongoDb id',
      );
      // when
      // then
      try {
        pipe.transform(['notId', validId]);
      } catch (e) {
        expect(e).toEqual(expectedError);
      }
    });
  });
  describe('string Mode', () => {
    it('should check string on mongoId', () => {
      // given
      // when
      const result: string = pipe.transform(validId) as any;
      // then
      expect(result).toEqual(validId);
    });
    it('should throw error if id is not mongoId', () => {
      // given
      const expectedError: BadRequestException = new BadRequestException(
        'Invalid mongoDb id',
      );
      // when
      // then
      try {
        pipe.transform('notId');
      } catch (e) {
        expect(e).toEqual(expectedError);
      }
    });
  });
});
