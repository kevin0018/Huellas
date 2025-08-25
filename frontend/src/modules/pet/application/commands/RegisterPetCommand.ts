import type { PetProps, PetType, PetSize, PetSex } from '../../domain/Pet';

export class RegisterPetCommand {
  // required
  readonly name!: string;
  readonly type!: PetType;
  readonly ownerId!: number;
  readonly sex!: PetSex;

  // optional
  readonly race?: string | null;
  readonly birthDate?: Date | string | null;
  readonly size?: PetSize | null;
  readonly microchipCode?: string | null;
  readonly hasPassport?: boolean;
  readonly countryOfOrigin?: string | null;
  readonly passportNumber?: string | null;
  readonly notes?: string | null;

  constructor(
    props: Omit<PetProps, 'id' | 'birthDate' | 'hasPassport'> & {
      birthDate?: Date | string | null;
      hasPassport?: boolean;
    }
  ) {
    Object.assign(this, props);
  }
}