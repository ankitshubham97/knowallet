import {
  IsNotEmpty, // eslint-disable-line @typescript-eslint/no-unused-vars
  IsNumber, // eslint-disable-line @typescript-eslint/no-unused-vars
  IsString, // eslint-disable-line @typescript-eslint/no-unused-vars
  MaxLength, // eslint-disable-line @typescript-eslint/no-unused-vars
  MinLength, // eslint-disable-line @typescript-eslint/no-unused-vars
} from 'class-validator';

class UpdateAccessApiKeyDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(60)
  @MinLength(60)
  apiKey!: string;

  @IsNotEmpty()
  @IsNumber()
  access!: number;
}

export default UpdateAccessApiKeyDto;
