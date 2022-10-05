import { Contract } from '../model/contract';
import { Profile } from '../model/profile';
import { JobService } from './job';
import { sequelize } from '../sequalize';
import { Op } from 'sequelize';
import { Job } from '../model/job';
import { ProfileType } from '../enum/profile.type';

const MAX_DEBT_AMOUNT_PERCENT = 25;
const DEFAULT_PROFILE_LIMIT = 2;

export class ProfileService {
  async depositByClient(clientId: number): Promise<Profile> {
    const jobService = new JobService();
    const transaction = await sequelize.transaction();

    try {
      const debtAmount = await jobService.getUnpaidJobsDebt(clientId);
      const client = await Profile.findOne({ where: { id: clientId } });

      await client.update({
        balance: client.balance + (debtAmount * MAX_DEBT_AMOUNT_PERCENT) / 100,
      });
      await client.save();

      await transaction.commit();

      return client;
    } catch (error) {
      await transaction.rollback();

      throw new Error(error.message);
    }
  }

  async getBestProfession(from?: Date, to?: Date): Promise<string> {
    const profilesWithBestProfession =
      await this.getProfilesSortedByPaymentAmount(
        ProfileType.CONTRACTOR,
        from ?? new Date(0),
        to ?? new Date(),
        1,
      );

    return profilesWithBestProfession.shift()?.profession ?? '';
  }

  async getBestClient(
    from?: Date,
    to?: Date,
    limit?: number,
  ): Promise<Profile[]> {
    return await this.getProfilesSortedByPaymentAmount(
      ProfileType.CONTRACTOR,
      from ?? new Date(0),
      to ?? new Date(),
      limit,
    );
  }

  async getProfilesSortedByPaymentAmount(
    profileType: ProfileType,
    from?: Date,
    to?: Date,
    limit?: number,
  ): Promise<Profile[]> {
    const profileAlias = profileType.toUpperCase();

    return Profile.findAll({
      include: [
        {
          model: Contract,
          as: `Contractor`,
          include: [
            {
              model: Job,
              where: {
                paid: true,
                [Op.and]: [
                  { paymentDate: { [Op.gte]: from ?? new Date(0) } },
                  { paymentDate: { [Op.lte]: to ?? new Date() } },
                ],
              },
            },
          ],
          required: true,
        },
      ],
      attributes: [
        'id',
        'profession',
        'firstName',
        'lastName',
        [
          sequelize.fn('sum', sequelize.col(`${profileAlias}->Job.price`)),
          'sumPrice',
        ],
      ],
      group: profileType === ProfileType.CONTRACTOR ? 'profession' : 'id',
      order: [['sumPrice', 'DESC']],
      limit: limit ?? DEFAULT_PROFILE_LIMIT,
      subQuery: false,
    });
  }
}
