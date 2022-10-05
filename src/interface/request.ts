import { Request as ExpressRequest } from 'express-serve-static-core';
import { IProfile } from './profile';

export interface IRequest extends ExpressRequest {
  profile?: IProfile;
}
