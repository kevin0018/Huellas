import { PetSize, PetType, Sex } from "@prisma/client";

export class Pet {
  private id: number;
  private name: string;
  private race: string;
  private type: PetType;
  private ownerId: number;
  private birthDate: Date;
  private size: PetSize;
  private microchipCode: string;
  private sex: Sex;
  private hasPassport: boolean;
  private countryOfOrigin: string | null;
  private passportNumber: string | null;
  private notes: string | null;

  public getId(): number {
    return this.id;
  }

  public setId(id: number): void {
    this.id = id;
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public getRace(): string {
    return this.race;
  }

  public setRace(race: string): void {
    this.race = race;
  }

  public getType(): PetType {
    return this.type;
  }

  public setType(type: PetType): void {
    this.type = type;
  }

  public getOwnerId(): number {
    return this.ownerId;
  }

  public setOwnerId(ownerId: number): void {
    this.ownerId = ownerId;
  }

  public getBirthDate(): Date {
    return this.birthDate;
  }

  public setBirthDate(birthDate: Date): void {
    this.birthDate = birthDate;
  }

  public getSize(): PetSize {
    return this.size;
  }

  public setSize(size: PetSize): void {
    this.size = size;
  }

  public getMicrochipCode(): string {
    return this.microchipCode;
  }

  public setMicrochipCode(microchipCode: string): void {
    this.microchipCode = microchipCode;
  }

  public getSex(): Sex {
    return this.sex;
  }

  public setSex(sex: Sex): void {
    this.sex = sex;
  }

  public getHasPassport(): boolean {
    return this.hasPassport;
  }

  public setHasPassport(hasPassport: boolean): void {
    this.hasPassport = hasPassport;
  }

  public getCountryOfOrigin(): string | null {
    return this.countryOfOrigin;
  }

  public setCountryOfOrigin(countryOfOrigin: string | null): void {
    this.countryOfOrigin = countryOfOrigin;
  }

  public getPassportNumber(): string | null {
    return this.passportNumber;
  }

  public setPassportNumber(passportNumber: string | null): void {
    this.passportNumber = passportNumber;
  }

  public getNotes(): string | null {
    return this.notes;
  }

  public setNotes(notes: string | null): void {
    this.notes = notes;
  }

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