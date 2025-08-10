import { OwnerId } from "../value-objects/OwnerId.js";

export class Owner {
  constructor(
    public readonly id: OwnerId,
    public readonly name: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly petIds: number[]
  ) {}
  
}