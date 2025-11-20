import bcrypt from 'bcryptjs';

// Number of salt rounds for hashing
const SALT_ROUNDS = 10;

// Function to hash a password
export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

// Function to compare a password with a hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

