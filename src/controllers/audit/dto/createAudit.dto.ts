import {
  IsNotEmpty, // eslint-disable-line @typescript-eslint/no-unused-vars
  IsNumber, // eslint-disable-line @typescript-eslint/no-unused-vars
  IsString, // eslint-disable-line @typescript-eslint/no-unused-vars
  MaxLength, // eslint-disable-line @typescript-eslint/no-unused-vars
} from 'class-validator';

class CreateAuditDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(128)
  userId!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(16)
  orgId!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(16)
  eventType!: string;

  @IsNotEmpty()
  @IsNumber()
  level!: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(16)
  createdBy!: string;
}

export default CreateAuditDto;
