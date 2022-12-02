import {
  Column, // eslint-disable-line @typescript-eslint/no-unused-vars
  CreatedAt, // eslint-disable-line @typescript-eslint/no-unused-vars
  Model,
  Table, // eslint-disable-line @typescript-eslint/no-unused-vars
  UpdatedAt, // eslint-disable-line @typescript-eslint/no-unused-vars
} from 'sequelize-typescript';

@Table
class Consent extends Model<Consent> {
  @Column
  userWalletAddress!: string;

  @Column
  requestorWalletAddress!: string;

  @Column
  consent!: boolean;

  @Column
  @CreatedAt
  createdAt!: Date;

  @Column
  @UpdatedAt
  updatedAt!: Date;
}

export default Consent;
