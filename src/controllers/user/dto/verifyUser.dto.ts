import {
  IsNotEmpty, IsNumber, // eslint-disable-line @typescript-eslint/no-unused-vars
  IsString, // eslint-disable-line @typescript-eslint/no-unused-vars
} from 'class-validator';

class VerifyUserDto {
  @IsNotEmpty()
  @IsString()
  walletAddress!: string;

  @IsNumber()
  questionId!: number;

  @IsString()
  chain!: string;
}

export default VerifyUserDto;
