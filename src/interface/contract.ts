import { ContractStatus } from '../enum/contract.status';

export interface IContract {
  id: number;
  terms: string;
  status: ContractStatus;
  ContractorId: number;
  ClientId: number;
}
