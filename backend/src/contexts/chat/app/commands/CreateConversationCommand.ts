export interface CreateConversationCommand {
  title?: string;
  createdBy: number;
  participantIds: number[];
}
