import { Owner } from '../domain/Owner';
import type { OwnerRepository } from '../domain/OwnerRepository';

export class ApiOwnerRepository implements OwnerRepository {
	private readonly baseUrl: string;

	constructor(baseUrl: string = '/api/owners') {
		this.baseUrl = baseUrl;
	}

	async register(owner: Owner): Promise<void> {
		const response = await fetch(this.baseUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name: owner.name,
				lastName: owner.lastName,
				email: owner.email,
				password: owner.password,
			}),
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`API error: ${error}`);
		}
	}
}
