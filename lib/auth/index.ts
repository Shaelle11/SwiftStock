import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db/prisma';
import type { Store } from '@/lib/types';
import { getUserType } from '@/lib/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-here-default-for-build';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string; // 'business_owner' | 'employee' | 'customer'
  storeId?: string;
  ownedStores?: Store[];
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
  storeId?: string; // For employees
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
      userType: user.userType,
      storeId: user.storeId,
      firstName: user.firstName,
      lastName: user.lastName
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
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & { 
      id: string; 
      email: string; 
      userType: string; 
      storeId?: string;
      firstName: string;
      lastName: string;
    };
    return {
      id: decoded.id,
      email: decoded.email,
      firstName: decoded.firstName || '',
      lastName: decoded.lastName || '',
      userType: decoded.userType || 'customer',
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
    console.log('Attempting registration for:', data.email);
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      hasJWTSecret: !!process.env.JWT_SECRET,
      hasDatabaseURL: !!process.env.DATABASE_URL
    });

    // Check if required environment variables are present
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not found');
      return {
        success: false,
        message: 'Server configuration error'
      };
    }

    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL not found');
      return {
        success: false,
        message: 'Database connection error'
      };
    }

    // Check if user already exists
    console.log('Checking if user exists...');
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      console.log('User already exists:', data.email);
      return {
        success: false,
        message: 'User with this email already exists'
      };
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await hashPassword(data.password);

    // Create user
    console.log('Creating user in database...');
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        storeId: data.storeId || null // For employees
      }
    });

    console.log('User created successfully:', user.id);

    // Determine user type based on relationships
    const ownedStores = await prisma.store.findMany({
      where: { ownerId: user.id }
    });

    // Create minimal user object for type checking
    const userForTypeCheck = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      storeId: user.storeId || undefined,
      phone: user.phone || undefined,
      address: user.address || undefined
    };

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: getUserType(userForTypeCheck, ownedStores.map(s => ({
        ...s,
        description: s.description || undefined
      }))),
      storeId: user.storeId || undefined,
      ownedStores: ownedStores.map(s => ({
        ...s,
        description: s.description || undefined
      }))
    };

    const token = generateToken(authUser);

    return {
      success: true,
      user: authUser,
      token,
      message: 'User registered successfully'
    };
  } catch (error) {
    console.error('Registration error details:', error);
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; message: string };
      
      switch (prismaError.code) {
        case 'P2002':
          return {
            success: false,
            message: 'Email already exists'
          };
        case 'P2003':
          return {
            success: false,
            message: 'Database constraint violation'
          };
        default:
          console.error('Prisma error code:', prismaError.code);
          return {
            success: false,
            message: `Database error: ${prismaError.message}`
          };
      }
    }
    
    return {
      success: false,
      message: `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Login user with email and password
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    console.log('Attempting login for:', credentials.email);
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      hasJWTSecret: !!process.env.JWT_SECRET,
      hasDatabaseURL: !!process.env.DATABASE_URL
    });

    // Check if required environment variables are present
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not found');
      return {
        success: false,
        message: 'Server configuration error'
      };
    }

    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL not found');
      return {
        success: false,
        message: 'Database connection error'
      };
    }

    // Find user by email with owned stores
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
      include: {
        ownedStore: true // Include owned store if any
      }
    });

    console.log('User found:', !!user);

    if (!user || !user.isActive) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // Verify password
    const isValidPassword = await verifyPassword(credentials.password, user.password);

    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // Get all owned stores for user type determination
    const ownedStores = user.ownedStore ? [user.ownedStore] : [];

    // Create minimal user object for type checking
    const userForTypeCheck = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      storeId: user.storeId || undefined,
      phone: user.phone || undefined,
      address: user.address || undefined
    };

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: getUserType(userForTypeCheck, ownedStores.map(s => ({
        ...s,
        description: s.description || undefined
      }))),
      storeId: user.storeId || undefined,
      ownedStores: ownedStores.map(s => ({
        ...s,
        description: s.description || undefined
      }))
    };

    const token = generateToken(authUser);

    return {
      success: true,
      user: authUser,
      token,
      message: 'Login successful'
    };
  } catch (error) {
    console.error('Login error details:', error);
    return {
      success: false,
      message: `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`
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
      userType: getUserType({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        storeId: user.storeId,
        phone: user.phone,
        address: user.address
      }, user.ownedStore ? [{ ...user.ownedStore, description: user.ownedStore.description || undefined }] : []),
      storeId: user.ownedStore?.id
    };
  } catch {
    console.error('Get user error');
    return null;
  }
}

/**
 * Check if user has required user type
 */
export function hasUserType(user: AuthUser, requiredTypes: string[]): boolean {
  return requiredTypes.includes(user.userType);
}

/**
 * Check if user is a business owner
 */
export function isBusinessOwner(user: AuthUser): boolean {
  return user.userType === 'business_owner';
}

/**
 * Check if user is a business user (owner or employee)
 */
export function isBusinessUser(user: AuthUser): boolean {
  return ['business_owner', 'employee'].includes(user.userType);
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