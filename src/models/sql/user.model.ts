import {
  Column, // eslint-disable-line @typescript-eslint/no-unused-vars
  CreatedAt, // eslint-disable-line @typescript-eslint/no-unused-vars
  Model,
  Table, // eslint-disable-line @typescript-eslint/no-unused-vars
  UpdatedAt, // eslint-disable-line @typescript-eslint/no-unused-vars
} from 'sequelize-typescript';

@Table
class User extends Model<User> {
  @Column
  walletAddress!: string;

  @Column
  proof!: string;

  @Column
  calldata!: string;

  @Column
  @CreatedAt
  createdAt!: Date;

  @Column
  @UpdatedAt
  updatedAt!: Date;
}

export default User;
