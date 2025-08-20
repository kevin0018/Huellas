export class Owner {
	readonly name: string;
	readonly lastName: string;
	readonly email: string;
	readonly password: string;

	private constructor(name: string, lastName: string, email: string, password: string) {
		this.name = name;
		this.lastName = lastName;
		this.email = email;
		this.password = password;
	}

	/**
	 * Factory method to create a new Owner with validation.
	 */
	static create(props: {
		name: string;
		lastName: string;
		email: string;
		password: string;
	}): Owner {
		if (!props.name || !props.lastName || !props.email || !props.password) {
			throw new Error('All fields are required');
		}
		// Simple email validation
		if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(props.email)) {
			throw new Error('Invalid email format');
		}
		if (props.password.length < 6) {
			throw new Error('Password must be at least 6 characters');
		}
		return new Owner(
			props.name.trim(),
			props.lastName.trim(),
			props.email.trim().toLowerCase(),
			props.password
		);
	}

	/**
	 * Clone method for testing purposes.
	 */
	clone(): Owner {
		return new Owner(this.name, this.lastName, this.email, this.password);
	}
}
