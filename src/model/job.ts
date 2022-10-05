import { DataTypes } from 'sequelize';
import {
  Table,
  Column,
  Model,
  AllowNull,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { Contract } from './contract';
import { IJob } from '../interface/job';

@Table
export class Job extends Model<IJob> {
  @AllowNull(false)
  @Column
  description: string;

  @AllowNull(false)
  @Column({ type: DataTypes.DECIMAL(12, 2) })
  price: number;

  @AllowNull(false)
  @Column({ defaultValue: false })
  paid: boolean;

  @Column
  paymentDate: Date;

  @ForeignKey(() => Contract)
  @Column
  ContractId: number;

  @BelongsTo(() => Contract)
  Contract: Contract;
}
