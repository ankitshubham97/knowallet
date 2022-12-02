import AuditEventType from '../../enums/auditEventType.enum';
import {
  Column, // eslint-disable-line @typescript-eslint/no-unused-vars
  CreatedAt, // eslint-disable-line @typescript-eslint/no-unused-vars
  Model,
  Table, // eslint-disable-line @typescript-eslint/no-unused-vars
  UpdatedAt, // eslint-disable-line @typescript-eslint/no-unused-vars
} from 'sequelize-typescript';

@Table
class Audit extends Model<Audit> {
  @Column
  userId!: string;

  @Column
  orgId!: string;

  @Column
  eventType!: AuditEventType;

  @Column
  level!: number;

  @Column
  createdBy!: string;

  @Column
  @CreatedAt
  createdAt!: Date;

  @Column
  @UpdatedAt
  updatedAt!: Date;
}

export default Audit;
