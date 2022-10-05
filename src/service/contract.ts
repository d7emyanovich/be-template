import { Contract } from '../model/contract';
import { Op } from 'sequelize';
import { ContractStatus } from '../enum/contract.status';

export class ContractService {
  async getOneByProfile(
    profileId: number,
    contractId: number,
  ): Promise<Contract> {
    return Contract.findOne({
      where: { id: contractId, ContractorId: profileId },
    });
  }

  async getManyByProfile(profileId: number): Promise<Contract[]> {
    return Contract.findAll({
      where: {
        [Op.or]: [{ ContractorId: profileId }, { ClientId: profileId }],
        status: {
          [Op.not]: ContractStatus.TERMINATED,
        },
      },
    });
  }
}
