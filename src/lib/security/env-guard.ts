/**
 * Fail-Fast Security Environment Invariant Validator
 * Ensures that critical production secrets are present on server startup.
 */
export function validateSecurityEnvironment(): { isValid: boolean; missingVars: string[] } {
  const requiredSecurityVars: string[] = ['DATABASE_URL'];

  if (process.env.NODE_ENV === 'production') {
    requiredSecurityVars.push('AUTH_SECRET', 'NEXT_PUBLIC_APP_URL');
  }

  const missingVars = requiredSecurityVars.filter((v) => !process.env[v]);

  if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
    const errorMsg = `[FATAL SECURITY CONFIGURATION] Missing required environment variables: ${missingVars.join(', ')}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
}
