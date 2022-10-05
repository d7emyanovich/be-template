import { ProfileType } from '../enum/profile.type';

export interface IProfile {
  id: number;
  firstName: string;
  lastName: string;
  profession: string;
  balance: number;
  type: ProfileType;
}
