import Currency from '../../enums/currency.enum';

import {
  Column, // eslint-disable-line @typescript-eslint/no-unused-vars
  CreatedAt, // eslint-disable-line @typescript-eslint/no-unused-vars
  Model,
  Table, // eslint-disable-line @typescript-eslint/no-unused-vars
  UpdatedAt, // eslint-disable-line @typescript-eslint/no-unused-vars
} from 'sequelize-typescript';
import LedgerEntry from '../../enums/ledgerEntry.enum';

@Table
class LedgerTxn extends Model<LedgerTxn> {
  @Column
  userId!: string; // This is Fuze-maintained id of all the actors including consumers, customers and Fuze's own account.

  @Column
  txnId!: string; // This is the external txn id which we would get from the customer.

  @Column
  amount!: number;

  @Column
  currency!: Currency;

  @Column
  entry!: LedgerEntry;

  @Column
  isActive!: boolean;

  @Column
  @CreatedAt
  createdAt!: Date;

  @Column
  @UpdatedAt
  updatedAt!: Date;
}

export default LedgerTxn;
