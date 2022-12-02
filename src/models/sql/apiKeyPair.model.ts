import {
  Column, // eslint-disable-line @typescript-eslint/no-unused-vars
  CreatedAt, // eslint-disable-line @typescript-eslint/no-unused-vars
  Model,
  Table, // eslint-disable-line @typescript-eslint/no-unused-vars
  UpdatedAt, // eslint-disable-line @typescript-eslint/no-unused-vars
} from 'sequelize-typescript';

@Table
class ApiKeyPair extends Model<ApiKeyPair> {
  @Column
  orgId!: string;

  @Column
  apiKey!: string;

  @Column
  apiSecret!: string;

  @Column
  access!: number;

  @Column
  expiryEpochSeconds!: number;

  @Column
  ipWhitelist?: string;

  @Column
  @CreatedAt
  createdAt!: Date;

  @Column
  @UpdatedAt
  updatedAt!: Date;
}

export default ApiKeyPair;
