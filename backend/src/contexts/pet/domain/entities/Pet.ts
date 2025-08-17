import { PetSize, PetType, Sex } from "@prisma/client";

export class Pet {
  public id: number;
  public name: string;
  public race: string;
  public type: PetType;
  public ownerId: number;
  public birthDate: Date;
  public size: PetSize;
  public microchipCode: string;
  public sex: Sex;
  public hasPassport: boolean;
  public countryOfOrigin: string | null;
  public passportNumber: string | null;
  public notes: string | null;

  constructor(
    id: number,
    name: string,
    race: string,
    type: PetType,
    ownerId: number,
    birthDate: Date,
    size: PetSize,
    microchipCode: string,
    sex: Sex,
    hasPassport: boolean,
    countryOfOrigin: string | null,
    passportNumber: string | null,
    notes: string | null
  ) {
    this.id = id;
    this.name = name;
    this.race = race;
    this.type = type;
    this.ownerId = ownerId;
    this.birthDate = birthDate;
    this.size = size;
    this.microchipCode = microchipCode;
    this.sex = sex;
    this.hasPassport = hasPassport;
    this.countryOfOrigin = countryOfOrigin;
    this.passportNumber = passportNumber;
    this.notes = notes;
  }
}