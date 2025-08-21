import { Owner } from '../domain/Owner';
import type { OwnerRepository } from '../domain/OwnerRepository';

export class ApiOwnerRepository implements OwnerRepository {
	private readonly baseUrl: string;

	constructor() {
		const apiUrl = import.meta.env.VITE_API_URL || '';
		this.baseUrl = `${apiUrl}/owners/register`;
	}

		async register(owner: Owner): Promise<void> {
			const payload = {
				name: owner.name,
				lastName: owner.lastName,
				email: owner.email,
				password: owner.password,
			};
			let response: Response;
			try {
				response = await fetch(this.baseUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(payload),
				});
			} catch (err) {
				throw new Error('Network error: ' + (err instanceof Error ? err.message : String(err)));
			}

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`API error: ${error}`);
			}
		}
}
