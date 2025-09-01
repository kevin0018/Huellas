import { PetType } from "@prisma/client";

export class Procedure {
  private id: number;
  private petType: PetType;
  private name: string;
  private age: number;
  private description: string | null;

  constructor(
    id: number,
    petType: PetType,
    name: string,
    age: number,
    notes: string | null,
  ) {
    this.id = id;
    this.petType = petType;
    this.name = name;
    this.age = age;
    this.description = notes;
  }

  public getId(): number {
    return this.id;
  }

  public setId(id: number): void {
    this.id = id;
  }

  public getPetType(): PetType {
    return this.petType;
  }

  public setPetType(petType: PetType): void {
    this.petType = petType;
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public getAge(): number {
    return this.age;
  }

  public setAge(age: number): void {
    this.age = age;
  }

  public getDescription(): string | null {
    return this.description;
  }

  public setDescription(description: string): void {
    this.description = description;
  }
}