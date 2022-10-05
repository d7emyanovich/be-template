import { DataTypes } from 'sequelize';
import { ContractStatus } from '../enum/contract.status';
import { Table, Column, Model, HasMany, AllowNull } from 'sequelize-typescript';
import { ProfileType } from '../enum/profile.type';
import { Contract } from './contract';
import { IProfile } from '../interface/profile';

@Table
export class Profile extends Model<IProfile> {
  @AllowNull(false)
  @Column
  firstName: string;

  @AllowNull(false)
  @Column
  lastName: string;

  @AllowNull(false)
  @Column({ type: DataTypes.ENUM({ values: Object.keys(ContractStatus) }) })
  profession: ContractStatus;

  @AllowNull(false)
  @Column({ type: DataTypes.DECIMAL(12, 2) })
  balance: number;

  @AllowNull(false)
  @Column
  type: ProfileType;

  @HasMany(() => Contract)
  Contractor: number;

  @HasMany(() => Contract)
  Client: number;
}
