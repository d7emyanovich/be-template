import { Contract } from '../model/contract';
import { Job } from '../model/job';
import { Op } from 'sequelize';
import { ContractStatus } from '../enum/contract.status';
import { sequelize } from '../sequalize';
import { Profile } from '../model/profile';

export class JobService {
  async getUnpaidByProfile(profileId: number): Promise<Job[]> {
    return Job.findAll({
      where: { paid: { [Op.not]: true } },
      include: [
        {
          model: Contract,
          where: {
            [Op.or]: [{ ContractorId: profileId }, { ClientId: profileId }],
            status: {
              [Op.not]: ContractStatus.TERMINATED,
            },
          },
          required: true,
        },
      ],
    });
  }

  async pay(id: number): Promise<Job> {
    const transaction = await sequelize.transaction();

    const job = await Job.findOne({
      where: { id },
      include: [
        {
          model: Contract,
          required: true,
          include: [
            {
              model: Profile,
              as: 'Client',
              required: true,
            },
          ],
        },
      ],
    });

    const client = await job?.Contract?.Client;

    if (!(job && client) || job.paid) {
      await transaction.rollback();

      // TODO Add Custom Exceptions
      throw new Error('Incorrect job');
    }

    if (job.price > client.balance) {
      await transaction.rollback();

      throw new Error("Client doesn't have enough money.");
    }

    try {
      await job.update({
        paid: true,
        paymentDate: new Date(),
      });
      await client.update({
        balance: client.balance - job.price,
      });

      await client.save();
      await job.save();

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();

      throw new Error(error.message);
    }

    return job;
  }

  async getUnpaidJobsDebt(clientId: number): Promise<number> {
    const job = await Job.findOne({
      where: { paid: { [Op.not]: true } },
      include: [
        {
          model: Contract,
          where: {
            ClientId: clientId,
            status: { [Op.not]: ContractStatus.TERMINATED },
          },
          required: true,
        },
      ],
      attributes: [
        [sequelize.fn('sum', sequelize.col('Jobs.price')), 'debtAmount'],
      ],
    });

    const debtAmount = job.get('debtAmount') ?? 0;

    if (!debtAmount) {
      throw new Error('Error of debt amount calculation.');
    }

    return Number(debtAmount);
  }
}
