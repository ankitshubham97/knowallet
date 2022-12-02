import {
  IsNotEmpty, // eslint-disable-line @typescript-eslint/no-unused-vars
  IsString, // eslint-disable-line @typescript-eslint/no-unused-vars
} from 'class-validator';

class CreateOrUpdateUserDto {
  @IsNotEmpty()
  @IsString()
  walletAddress!: string;

  @IsNotEmpty()
  @IsString()
  selfieBase64String!: string;

  @IsNotEmpty()
  @IsString()
  passportBase64String!: string;
}

export default CreateOrUpdateUserDto;
