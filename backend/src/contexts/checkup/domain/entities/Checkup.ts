export class Checkup {
  private id: number;
  private petId: number;
  private procedureId: number;
  private date: Date;
  private notes: string | null;

  constructor(
    id: number,
    petId: number,
    procedureId: number,
    date: Date,
    notes: string | null
  ) {
    this.id = id;
    this.petId = petId;
    this.procedureId = procedureId;
    this.date = date;
    this.notes = notes;
  }

  public getId(): number {
    return this.id;
  }

  public setId(id: number): void {
    this.id = id;
  }

  public getPetId(): number {
    return this.petId;
  }

  public setPetId(petId: number): void {
    this.petId = petId;
  }

  public getProcedureId(): number {
    return this.procedureId;
  }

  public setProcedureId(procedureId: number): void {
    this.procedureId = procedureId;
  }

  public getDate(): Date {
    return this.date;
  }

  public setDate(date: Date): void {
    this.date = date;
  }

  public getNotes(): string | null {
    return this.notes;
  }

  public setNotes(notes: string | null): void {
    this.notes = notes;
  }
}