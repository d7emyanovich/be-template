import express from 'express';
import bodyParser from 'body-parser';
import { sequelize } from './sequalize';
import { getProfile } from './middleware/getProfile';
import { ProfileService } from './service/profile';
import { IRequest } from './interface/request';
import { ContractService } from './service/contract';
import { JobService } from './service/job';

export const app = express();

app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

app.get('/contracts/:id', getProfile, async (req: IRequest, res) => {
  const { id } = req.params;
  const contractorService = new ContractService();
  const contract = await contractorService.getOneByProfile(
    req.profile.id,
    parseInt(id, null),
  );

  if (!contract) {
    return res.status(404).end();
  }

  res.json(contract);
});

app.get('/contracts', getProfile, async (req: IRequest, res) => {
  const contractorService = new ContractService();
  const contracts = await contractorService.getManyByProfile(req.profile.id);

  if (!contracts.length) {
    return res.status(404).end();
  }

  res.json(contracts);
});

app.get('/jobs/unpaid', getProfile, async (req: IRequest, res) => {
  const jobService = new JobService();
  const unpaidJobs = await jobService.getUnpaidByProfile(req.profile.id);

  if (!unpaidJobs.length) {
    return res.status(404).end();
  }

  res.json(unpaidJobs);
});

app.post('/jobs/:jobId/pay', getProfile, async (req: IRequest, res) => {
  const jobService = new JobService();
  const { jobId } = req.params;

  try {
    res.json(await jobService.pay(parseInt(jobId, null)));
  } catch (e) {
    return res.status(500).end();
  }
});

app.post(
  '/balances/deposit/:userId',
  getProfile,
  async (req: IRequest, res) => {
    const { userId } = req.params;
    const profileService = new ProfileService();
    const updatedClient = await profileService.depositByClient(
      parseInt(userId, null),
    );

    res.json(updatedClient);
  },
);

app.get('/admin/best-profession', getProfile, async (req: IRequest, res) => {
  const { start, end } = req.query;

  if (!(Date.parse(String(start)) && Date.parse(String(end)))) {
    return res.status(400).end();
  }

  const profileService = new ProfileService();
  const bestProfession = await profileService.getBestProfession(
    new Date(String(start)),
    new Date(String(end)),
  );

  if (!bestProfession) {
    return res.status(400).end();
  }

  res.json({ bestProfession });
});

app.get('/admin/best-client', getProfile, async (req: IRequest, res) => {
  const { start, end, limit } = req.query;

  if (!(Date.parse(String(start)) && Date.parse(String(end)))) {
    return res.status(400).end();
  }

  const profileService = new ProfileService();
  const bestClients = await profileService.getBestClient(
    new Date(String(start)),
    new Date(String(end)),
    limit ? Number(limit) : null,
  );

  if (!bestClients.length) {
    return res.status(400).end();
  }

  res.json(
    bestClients.map((client) => {
      return {
        id: client.id,
        fullName: `${client.firstName} ${client.lastName}`,
        paid: client.get('sumPrice'),
      };
    }),
  );
});
