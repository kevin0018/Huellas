import { describe, it, expect, vi } from 'vitest';
import { RegisterOwnerCommand } from '../../../../application/commands/RegisterOwnerCommand';
import { RegisterOwnerCommandHandler } from '../../../../application/commands/RegisterOwnerCommandHandler';
import { Owner } from '../../../../domain/Owner';

describe('RegisterOwnerCommandHandler', () => {
	it('should call repository with Owner instance', async () => {
		// Arrange
		const mockRepository = {
			register: vi.fn().mockResolvedValue(undefined)
		};
		const handler = new RegisterOwnerCommandHandler(mockRepository);
		const command = new RegisterOwnerCommand(
			'John',
			'Doe',
			'john@example.com',
			'securePassword123'
		);

		// Act
		await handler.execute(command);

		// Assert
		expect(mockRepository.register).toHaveBeenCalledTimes(1);
		const ownerArg = mockRepository.register.mock.calls[0][0];
		expect(ownerArg).toBeInstanceOf(Owner);
		expect(ownerArg.name).toBe('John');
		expect(ownerArg.lastName).toBe('Doe');
		expect(ownerArg.email).toBe('john@example.com');
		expect(ownerArg.password).toBe('securePassword123');
	});

	it('should throw if repository fails', async () => {
		// Arrange
		const mockRepository = {
			register: vi.fn().mockRejectedValue(new Error('API error'))
		};
		const handler = new RegisterOwnerCommandHandler(mockRepository);
		const command = new RegisterOwnerCommand(
			'Jane',
			'Smith',
			'jane@example.com',
			'password456'
		);

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow('API error');
	});
});
