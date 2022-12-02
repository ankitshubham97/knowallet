import {
  IsArray, // eslint-disable-line @typescript-eslint/no-unused-vars
  IsNotEmpty, // eslint-disable-line @typescript-eslint/no-unused-vars
  IsNumber, // eslint-disable-line @typescript-eslint/no-unused-vars
  IsOptional, // eslint-disable-line @typescript-eslint/no-unused-vars
  IsString, // eslint-disable-line @typescript-eslint/no-unused-vars
  MaxLength, // eslint-disable-line @typescript-eslint/no-unused-vars
} from 'class-validator';

class GenerateApiKeyDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(16)
  orgId!: string;

  @IsNotEmpty()
  @IsNumber()
  access!: number;

  @IsNotEmpty()
  @IsNumber()
  expiryEpochSeconds!: number;

  @IsOptional()
  @IsArray()
  ipWhitelist?: string[];
}

export default GenerateApiKeyDto;
