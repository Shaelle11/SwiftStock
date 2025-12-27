import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db/prisma';
import type { UserRole } from '@/lib/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-here';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  storeId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  message?: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      storeId: user.storeId 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & { id: string; email: string; role: string; storeId?: string };
    return {
      id: decoded.id,
      email: decoded.email,
      firstName: decoded.firstName || '',
      lastName: decoded.lastName || '',
      role: decoded.role.toLowerCase() as UserRole,
      storeId: decoded.storeId
    };
  } catch {
    return null;
  }
}

/**
 * Register a new user
 */
export async function registerUser(data: RegisterData): Promise<AuthResponse> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return {
        success: false,
        message: 'User with this email already exists'
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: (data.role?.toUpperCase() || 'CASHIER') as 'ADMIN' | 'CASHIER' | 'CUSTOMER'
      }
    });

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.toLowerCase() as 'admin' | 'cashier' | 'customer',
      storeId: user.storeId || undefined
    };

    const token = generateToken(authUser);

    return {
      success: true,
      user: authUser,
      token,
      message: 'User registered successfully'
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'Registration failed'
    };
  }
}

/**
 * Login user with email and password
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    });

    if (!user || !user.isActive) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // Verify password
    const isValidPassword = await verifyPassword(credentials.password, user.password);

    if (!isValidPassword) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.toLowerCase() as 'admin' | 'cashier' | 'customer',
      storeId: user.storeId || undefined
    };

    const token = generateToken(authUser);

    return {
      success: true,
      user: authUser,
      token,
      message: 'Login successful'
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Login failed'
    };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        ownedStore: true
      }
    });

    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.toLowerCase() as 'admin' | 'cashier' | 'customer',
      storeId: user.ownedStore?.id
    };
  } catch {
    console.error('Get user error');
    return null;
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthUser, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(user.role);
}

/**
 * Check if user is admin
 */
export function isAdmin(user: AuthUser): boolean {
  return user.role === 'admin';
}

/**
 * Check if user is cashier or admin
 */
export function canAccessPOS(user: AuthUser): boolean {
  return ['admin', 'cashier'].includes(user.role);
}

/**
 * Middleware to verify authentication
 */
export async function verifyAuth(request: Request): Promise<{ user: AuthUser | null; error?: string }> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, error: 'No valid authorization header' };
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return { user: null, error: 'Invalid token' };
    }

    // Get fresh user data from database
    const user = await getUserById(decoded.id);
    
    if (!user) {
      return { user: null, error: 'User not found' };
    }

    return { user };
  } catch {
    return { user: null, error: 'Authentication failed' };
  }
}