import { IPaginatedResponse } from '../../common/model';
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../dto/user-response.dto';

export class IPaginatedUsersResponse extends IPaginatedResponse<UserDto> {
  @ApiProperty({
    type: UserDto,
    isArray: true,
  })
  data: UserDto[];
}
