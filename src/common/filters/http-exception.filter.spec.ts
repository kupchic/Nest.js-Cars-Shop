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

  it('should catch not internal error ', () => {
    // given
    const exception: HttpException = new HttpException(
      'Http exception',
      HttpStatus.BAD_REQUEST,
    );
    // when
    filter.catch(exception, mockArgumentsHost);
    // then
    expect(mockHttpArgumentsHost).nthCalledWith(1);
    expect(mockGetResponse).nthCalledWith(1);
    expect(mockStatus).nthCalledWith(1, HttpStatus.BAD_REQUEST);
    const res: any = mockJson.mock.calls[0][0];
    expect(res).toMatchObject({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
      path: mockUrl,
    });
    expect(res.timestamp).toBeDefined();
  });
  it('should catch internal error', () => {
    // given
    const exception: HttpException = null;
    // when
    filter.catch(exception, mockArgumentsHost);
    // then
    expect(mockHttpArgumentsHost).nthCalledWith(1);
    expect(mockGetResponse).nthCalledWith(1);
    expect(mockStatus).nthCalledWith(1, HttpStatus.INTERNAL_SERVER_ERROR);
    const res: any = mockJson.mock.calls[0][0];
    expect(res).toMatchObject({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
      path: mockUrl,
    });
    expect(res.timestamp).toBeDefined();
  });
});
