import type { PetProps } from '../../domain/Pet';

export class UpdatePetCommand {
  readonly id: number;
  readonly data: Omit<PetProps, 'id'>;

  constructor(id: number, data: Omit<PetProps, 'id'>) {
    this.id = id;
    this.data = data;
  }
}