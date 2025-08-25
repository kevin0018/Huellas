export class ListPetsByOwnerQuery {
  readonly ownerId: number;
  constructor(ownerId: number) {
    this.ownerId = ownerId;
  }
}
