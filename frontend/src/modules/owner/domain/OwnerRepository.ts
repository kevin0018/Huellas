import { Owner } from './Owner';

export interface OwnerRepository {
  register(owner: Owner): Promise<void>;
}
