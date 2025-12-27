// Example: How to create users via API in SwiftStock

// Method 1: Using fetch() in JavaScript/TypeScript
async function createUser() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'cashier', // or 'admin'
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('User created successfully:', data.user);
      console.log('Auth token:', data.token);
    } else {
      console.error('Failed to create user:', data.message);
    }
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

// Method 2: Using curl (command line)
/*
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123", 
    "firstName": "John",
    "lastName": "Doe",
    "role": "cashier"
  }'
*/

// Method 3: Using PowerShell (Windows)
/*
$headers = @{ "Content-Type" = "application/json" }
$body = @{
  email = "user@example.com"
  password = "password123"
  firstName = "John"
  lastName = "Doe"
  role = "cashier"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Headers $headers -Body $body
*/

// Expected Response Format:
/*
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "cashier",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
*/

// API Endpoints available:
// POST /api/auth/register - Create new user
// POST /api/auth/login    - Authenticate user  
// GET  /api/auth/me       - Get current user (requires auth token)

export { createUser };