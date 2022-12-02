import logger from './logger';

import { sequelize } from '../models/sql/sequelize';
import LedgerTxn from '../models/sql/ledgerTxn.model';

import { INTERNAL_SERVER_ERROR } from '../constants';
import LedgerEntry from '../enums/ledgerEntry.enum';
import Currency from '../enums/currency.enum';

type LedgerItem = {
  debitUserId: string;
  creditUserId: string;
  txnId: string;
  amount: number;
  currency: Currency;
};

class LedgerService {
  public ledgerTxnRepository = sequelize.getRepository(LedgerTxn);

  public async addTxn(
    txn: LedgerItem
  ): Promise<{ ok: boolean; error: string }> {
    try {
      const createdRows = await this.ledgerTxnRepository.bulkCreate([
        // @ts-ignore
        {
          userId: txn.creditUserId,
          txnId: txn.txnId,
          amount: txn.amount,
          currency: txn.currency,
          entry: LedgerEntry.CREDIT,
          isActive: true,
        },
        // @ts-ignore
        {
          userId: txn.debitUserId,
          txnId: txn.txnId,
          amount: txn.amount,
          currency: txn.currency,
          entry: LedgerEntry.DEBIT,
          isActive: true,
        },
      ]);
      if (createdRows.length !== 2) {
        return {
          ok: false,
          error: `Created ${createdRows.length} number of ledger items; expected: 2`,
        };
      }
      return {
        ok: true,
        error: '',
      };
    } catch (e) {
      logger.error(e);
      return {
        ok: false,
        error: INTERNAL_SERVER_ERROR,
      };
    }
  }
}

export default LedgerService;
