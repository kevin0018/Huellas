import { RegisterOwnerCommand } from '../../modules/owner/application/commands/RegisterOwnerCommand';
import { RegisterOwnerCommandHandler } from '../../modules/owner/application/commands/RegisterOwnerCommandHandler';
import { ApiOwnerRepository } from '../../modules/owner/infra/ApiOwnerRepository';
import { RegisterVolunteerCommand } from '../../modules/volunteer/application/commands/RegisterVolunteerCommand';
import { RegisterVolunteerCommandHandler } from '../../modules/volunteer/application/commands/RegisterVolunteerCommandHandler';
import { ApiVolunteerRepository } from '../../modules/volunteer/infra/ApiVolunteerRepository';

export type RegistrationDraft = {
  name: string;
  lastName: string;
  email: string;
  password: string;
  description?: string;
};

const ownerRegistration = new RegisterOwnerCommandHandler(new ApiOwnerRepository());
const volunteerRegistration = new RegisterVolunteerCommandHandler(new ApiVolunteerRepository());

export async function registerUser(type: 'owner' | 'volunteer', draft: RegistrationDraft): Promise<void> {
  if (type === 'owner') {
    await ownerRegistration.execute(new RegisterOwnerCommand(
      draft.name,
      draft.lastName,
      draft.email,
      draft.password,
    ));
    return;
  }

  await volunteerRegistration.execute(new RegisterVolunteerCommand(
    draft.name,
    draft.lastName,
    draft.email,
    draft.password,
    draft.description || '',
  ));
}
