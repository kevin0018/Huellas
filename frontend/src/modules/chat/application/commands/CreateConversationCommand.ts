export class CreateConversationCommand {
  public readonly title: string;
  public readonly participantIds: number[];

  constructor(title: string, participantIds: number[]) {
    this.title = title;
    this.participantIds = participantIds;
  }
}
