import type { Pet } from "../../modules/pet/domain/Pet";

export const DEFAULT_PET_IMAGE_URL = "/media/pfp_sample.svg";

export function getPetImageUrl(pet: Pick<Pet, "profileImageUrl">): string {
  return pet.profileImageUrl || DEFAULT_PET_IMAGE_URL;
}
