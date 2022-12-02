import {
  IsNotEmpty, // eslint-disable-line @typescript-eslint/no-unused-vars
  IsString, // eslint-disable-line @typescript-eslint/no-unused-vars
  MaxLength, // eslint-disable-line @typescript-eslint/no-unused-vars
  MinLength, // eslint-disable-line @typescript-eslint/no-unused-vars
} from 'class-validator';

class ManageApiKeyDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(60)
  @MinLength(60)
  apiKey!: string;
}

export default ManageApiKeyDto;
