import { Sequelize } from 'sequelize-typescript';
import { Contract } from './model/contract';
import { Profile } from './model/profile';
import { Job } from './model/job';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite3',
  models: [Contract, Profile, Job],
});
