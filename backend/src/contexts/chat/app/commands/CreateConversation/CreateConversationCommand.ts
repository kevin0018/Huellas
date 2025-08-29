export interface CreateConversationCommand {
  title?: string | null;
  participantIds: number[];
  createdBy: number;
}
