export class VolunteerId {
  private readonly value: number;

  constructor(value: number) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error('VolunteerId must be a positive integer');
    }
    this.value = value;
  }

  getValue(): number {
    return this.value;
  }

  equals(other: VolunteerId): boolean {
    return this.value === other.getValue();
  }
}