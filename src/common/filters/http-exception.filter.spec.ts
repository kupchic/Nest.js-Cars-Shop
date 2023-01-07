import { Test, TestingModule } from '@nestjs/testing';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

const mockJson: jest.Mock = jest.fn();
const mockStatus: jest.Mock = jest.fn().mockImplementation(() => ({
  json: mockJson,
}));
const mockGetResponse: jest.Mock = jest.fn().mockImplementation(() => ({
  status: mockStatus,
}));
const mockUrl: string = '/mock';
const mockHttpArgumentsHost: jest.Mock = jest.fn().mockImplementation(() => ({
  getResponse: mockGetResponse,
  getRequest: jest.fn().mockReturnValueOnce({ url: mockUrl }),
}));

const mockArgumentsHost: ArgumentsHost = {
  switchToHttp: mockHttpArgumentsHost,
} as any;

describe('System header validation service', () => {
  let filter: HttpExceptionFilter;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpExceptionFilter],
    }).compile();
    filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('not internal error catch', () => {
    filter.catch(
      new HttpException('Http exception', HttpStatus.BAD_REQUEST),
      mockArgumentsHost,
    );
    expect(mockHttpArgumentsHost).toBeCalledTimes(1);
    expect(mockHttpArgumentsHost).toBeCalledWith();
    expect(mockGetResponse).toBeCalledTimes(1);
    expect(mockGetResponse).toBeCalledWith();
    expect(mockStatus).toBeCalledTimes(1);
    expect(mockStatus).toBeCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toBeCalledTimes(1);
    // expect(mockJson).toBeCalledWith({
    //   message: 'Http exception',
    // }); //TODO
  });
});
