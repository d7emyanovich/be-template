import { IContract } from '../interface/contract';
import { ContractStatus } from '../enum/contract.status';
import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  HasMany,
  AllowNull,
} from 'sequelize-typescript';
import { Profile } from './profile';
import { DataTypes } from 'sequelize';
import { Job } from './job';

@Table({
  modelName: 'Contract',
})
export class Contract extends Model<IContract> {
  @AllowNull(false)
  @Column
  terms: string;

  @Column({ type: DataTypes.ENUM({ values: Object.keys(ContractStatus) }) })
  status: string;

  @ForeignKey(() => Profile)
  @Column
  ContractorId: number;

  @ForeignKey(() => Profile)
  @Column
  ClientId: number;

  @BelongsTo(() => Profile)
  Contractor: Profile;

  @BelongsTo(() => Profile)
  Client: Profile;

  @HasMany(() => Job)
  Job: number;
}
