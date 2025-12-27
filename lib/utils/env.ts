// Environment utilities
export const getEnvVar = (name: string, fallback?: string): string => {
  const value = process.env[name];
  if (!value && !fallback) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value || fallback || '';
};

export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';