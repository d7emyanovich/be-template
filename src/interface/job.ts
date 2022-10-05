export interface IJob {
  id: number;
  description: string;
  price: number;
  paid: boolean;
  paymentDate: Date;
  ContractId: number;
}
