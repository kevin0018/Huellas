export class OwnerId {
  private readonly value: number;

  constructor(value: number) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error('OwnerId must be a positive integer');
    }
    this.value = value;
  }

  getValue(): number {
    return this.value;
  }

  equals(other: OwnerId): boolean {
    return this.value === other.value;
  }
}