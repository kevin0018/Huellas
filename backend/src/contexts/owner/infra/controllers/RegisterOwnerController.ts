import { RegisterOwnerCommand } from "../../app/commands/registerOwner/RegisterOwnerCommand.js";

export class RegisterOwnerController {
  async handle(request, response) {
    const { name, email, password } = request.body;

    // Get the id number of the sequence
    const id = await this.sequenceIdGenerator.generate();
    const command = new RegisterOwnerCommand(name, email, password, id);
  }
}