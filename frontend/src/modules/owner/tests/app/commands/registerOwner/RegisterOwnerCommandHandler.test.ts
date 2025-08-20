import { describe, it, expect, vi } from 'vitest';
import { RegisterOwnerCommand } from '../../../../application/commands/RegisterOwnerCommand';
import { RegisterOwnerCommandHandler } from '../../../../application/commands/RegisterOwnerCommandHandler';

describe('RegisterOwnerCommandHandler', () => {
	it('should call repository and return owner id on success', async () => {
		// Arrange
		const mockRepository = {
			register: vi.fn().mockResolvedValue({ id: 123 })
		};
		const handler = new RegisterOwnerCommandHandler(mockRepository);
		const command = new RegisterOwnerCommand({
			name: 'John',
			lastName: 'Doe',
			email: 'john@example.com',
			password: 'securePassword123'
		});

		// Act
		const result = await handler.execute(command);

		// Assert
		expect(mockRepository.register).toHaveBeenCalledWith(command);
		expect(result).toEqual({ id: 123 });
	});

	it('should throw if repository fails', async () => {
		// Arrange
		const mockRepository = {
			register: vi.fn().mockRejectedValue(new Error('API error'))
		};
		const handler = new RegisterOwnerCommandHandler(mockRepository);
		const command = new RegisterOwnerCommand({
			name: 'Jane',
			lastName: 'Smith',
			email: 'jane@example.com',
			password: 'password456'
		});

		// Act & Assert
		await expect(handler.execute(command)).rejects.toThrow('API error');
	});
});
