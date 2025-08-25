import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from './db.js';
import type { User, Role, Permission } from '../types/auth.js';

const JWT_SECRET = import.meta.env.JWT_SECRET;
const BCRYPT_ROUNDS = parseInt(import.meta.env.BCRYPT_ROUNDS || '12');

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateJWT(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJWT(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query(
    'SELECT * FROM users WHERE email = $1 AND is_active = true',
    [email]
  );
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    roleId: row.role_id,
    isActive: row.is_active,
    emailVerified: row.email_verified,
    lastLogin: row.last_login,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await query(
    'SELECT * FROM users WHERE id = $1 AND is_active = true',
    [id]
  );
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    roleId: row.role_id,
    isActive: row.is_active,
    emailVerified: row.email_verified,
    lastLogin: row.last_login,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getUserWithRole(userId: string) {
  const result = await query(`
    SELECT 
      u.*,
      r.name as role_name,
      r.description as role_description,
      ARRAY_AGG(
        JSON_BUILD_OBJECT(
          'id', p.id,
          'name', p.name,
          'resource', p.resource,
          'action', p.action
        )
      ) as permissions
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN role_permissions rp ON r.id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.id
    WHERE u.id = $1 AND u.is_active = true
    GROUP BY u.id, r.id
  `, [userId]);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: {
      id: row.role_id,
      name: row.role_name,
      permissions: row.permissions.filter((p: any) => p.id !== null).map((p: any) => `${p.resource}:${p.action}`)
    }
  };
}

export async function createUser(userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: string;
}): Promise<User> {
  const hashedPassword = await hashPassword(userData.password);
  
  const result = await query(`
    INSERT INTO users (email, password_hash, first_name, last_name, role_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [userData.email, hashedPassword, userData.firstName, userData.lastName, userData.roleId]);

  const row = result.rows[0];
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    roleId: row.role_id,
    isActive: row.is_active,
    emailVerified: row.email_verified,
    lastLogin: row.last_login,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function updateLastLogin(userId: string): Promise<void> {
  await query(
    'UPDATE users SET last_login = NOW() WHERE id = $1',
    [userId]
  );
}

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const token = jwt.sign({ userId: user.id, type: 'password_reset' }, JWT_SECRET, { expiresIn: '1h' });
  
  await query(`
    INSERT INTO password_resets (user_id, token, expires_at)
    VALUES ($1, $2, NOW() + INTERVAL '1 hour')
  `, [user.id, token]);

  return token;
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== 'password_reset') return false;

    // Verificar que el token existe y no ha sido usado
    const tokenResult = await query(
      'SELECT * FROM password_resets WHERE token = $1 AND used = false AND expires_at > NOW()',
      [token]
    );

    if (tokenResult.rows.length === 0) return false;

    const hashedPassword = await hashPassword(newPassword);

    // Actualizar contraseña
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, decoded.userId]
    );

    // Marcar token como usado
    await query(
      'UPDATE password_resets SET used = true WHERE token = $1',
      [token]
    );

    return true;
  } catch (error) {
    return false;
  }
}