/* export Pet class */// modules/pet/domain/Pet.ts
export type PetType = 'dog' | 'cat' | 'ferret';
export type PetSize = 'large' | 'medium' | 'small';
export type PetSex = 'male' | 'female';

export interface PetProps {
  id?: number;                  // opcional (lo asigna la API/DB)
  name: string;
  race?: string | null;
  type: PetType;
  ownerId: number;
  birthDate?: Date | null;
  size?: PetSize | null;
  microchipCode?: string | null;
  sex: PetSex;
  hasPassport?: boolean;
  countryOfOrigin?: string | null;
  passportNumber?: string | null;
  notes?: string | null;
}

export class Pet {
  readonly id?: number;
  readonly name: string;
  readonly race: string | null;
  readonly type: PetType;
  readonly ownerId: number;
  readonly birthDate: Date | null;
  readonly size: PetSize | null;
  readonly microchipCode: string | null;
  readonly sex: PetSex;
  readonly hasPassport: boolean;
  readonly countryOfOrigin: string | null;
  readonly passportNumber: string | null;
  readonly notes: string | null;

  private constructor(props: PetProps) {
    this.id = props.id;
    this.name = props.name;
    this.race = props.race ?? null;
    this.type = props.type;
    this.ownerId = props.ownerId;
    this.birthDate = props.birthDate ?? null;
    this.size = props.size ?? null;
    this.microchipCode = props.microchipCode ?? null;
    this.sex = props.sex;
    this.hasPassport = !!props.hasPassport;
    this.countryOfOrigin = props.countryOfOrigin ?? null;
    this.passportNumber = props.passportNumber ?? null;
    this.notes = props.notes ?? null;
  }

  static create(props: Omit<PetProps, 'id'> & { id?: number }): Pet {
    // Validaciones mínimas alineadas con tu tabla
    if (!props.name?.trim()) throw new Error('Name is required');
    if (!props.type) throw new Error('Type is required');
    if (props.ownerId == null || Number.isNaN(props.ownerId)) {
      throw new Error('ownerId is required');
    }
    if (!props.sex) throw new Error('Sex is required');

    // microchip único en DB: aquí solo normalizamos
    const micro = props.microchipCode?.trim() || null;
    if (micro && micro.length > 191) {
      throw new Error('microchip_code too long');
    }

    // coherencias de pasaporte
    const hasPass = !!props.hasPassport;
    const passportNum = props.passportNumber?.trim() || null;
    if (hasPass && !passportNum) {
      throw new Error('passport_number is required when has_passport is true');
    }

    const birth =
      props.birthDate instanceof Date
        ? props.birthDate
        : props.birthDate
        ? new Date(props.birthDate)
        : null;

    return new Pet({
      id: props.id,
      name: props.name.trim(),
      race: props.race?.trim() || null,
      type: props.type,
      ownerId: Number(props.ownerId),
      birthDate: birth,
      size: props.size ?? null,
      microchipCode: micro,
      sex: props.sex,
      hasPassport: hasPass,
      countryOfOrigin: props.countryOfOrigin?.trim() || null,
      passportNumber: passportNum,
      notes: props.notes?.trim() || null,
    });
  }

  clone(): Pet {
    return new Pet({
      id: this.id,
      name: this.name,
      race: this.race,
      type: this.type,
      ownerId: this.ownerId,
      birthDate: this.birthDate ? new Date(this.birthDate) : null,
      size: this.size,
      microchipCode: this.microchipCode,
      sex: this.sex,
      hasPassport: this.hasPassport,
      countryOfOrigin: this.countryOfOrigin,
      passportNumber: this.passportNumber,
      notes: this.notes,
    });
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      race: this.race,
      type: this.type,
      ownerId: this.ownerId,
      birthDate: this.birthDate ? this.birthDate.toISOString().slice(0, 10) : null, // YYYY-MM-DD
      size: this.size,
      microchipCode: this.microchipCode,
      sex: this.sex,
      hasPassport: this.hasPassport,
      countryOfOrigin: this.countryOfOrigin,
      passportNumber: this.passportNumber,
      notes: this.notes,
    };
  }
}