import { SwaggerUiOptions } from 'swagger-ui-express';

export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Workforce Analytics Platform API',
    version: '1.0.0',
    description:
      'Enterprise Workforce Analytics Platform API featuring Role-Based Access Control (RBAC) across 6 roles, WebAuthn/Passkeys, FIDO2 Hardware Security Keys, and full audit logging.',
    contact: {
      name: 'Workforce Analytics Platform Engineering',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Base API v1 Server',
    },
  ],
  tags: [
    { name: 'System', description: 'System health and monitoring endpoints' },
    { name: 'Authentication', description: 'Password authentication, session management, and RBAC' },
    { name: 'Passkey & FIDO2', description: 'Passwordless WebAuthn / Passkeys and FIDO2 Hardware Security Key endpoints' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66e123456789abcdef012345' },
          name: { type: 'string', example: 'Enterprise Admin' },
          email: { type: 'string', format: 'email', example: 'admin@wfa.internal' },
          role: {
            type: 'string',
            enum: ['Admin', 'HR Manager', 'Executive', 'Department Manager', 'Team Lead', 'Employee'],
            example: 'Admin',
          },
          department: { type: 'string', example: 'Human Resources' },
          lastLogin: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 2, example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane.doe@wfa.internal' },
          password: { type: 'string', minLength: 6, example: 'Password123!' },
          role: {
            type: 'string',
            enum: ['Admin', 'HR Manager', 'Executive', 'Department Manager', 'Team Lead', 'Employee'],
            default: 'Employee',
          },
          department: { type: 'string', example: 'Engineering' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@wfa.internal' },
          password: { type: 'string', example: 'Password123!' },
        },
      },
      Passkey: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66e987654321fedcba543210' },
          credentialID: { type: 'string', example: 'base64url-credential-id' },
          nickname: { type: 'string', example: 'YubiKey 5C NFC' },
          deviceType: { type: 'string', example: 'singleDevice' },
          transports: {
            type: 'array',
            items: { type: 'string' },
            example: ['usb', 'nfc'],
          },
          createdAt: { type: 'string', format: 'date-time' },
          lastUsedAt: { type: 'string', format: 'date-time' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error message description' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'System Healthcheck',
        description: 'Verifies server uptime, process details, and MongoDB database connectivity.',
        responses: {
          '200': {
            description: 'System is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                    uptime: { type: 'number', example: 45.2 },
                    database: { type: 'string', example: 'connected' },
                  },
                },
              },
            },
          },
          '503': {
            description: 'Database disconnected or system error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register new user',
        description: 'Creates a new user account with one of the 6 enterprise roles. Rate limited to 30 requests per 15 minutes.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User registered successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'Validation error or email already in use' },
          '429': { description: 'Too many authentication attempts' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Password login',
        description: 'Authenticates user with email and password, issuing a signed JWT token and HTTP-only cookie.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Logged in successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Logged in successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        token: { type: 'string' },
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Invalid email or password' },
          '403': { description: 'Account deactivated' },
          '429': { description: 'Rate limit exceeded' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'User logout',
        description: 'Clears the HTTP-only session cookie and creates an immutable audit log entry.',
        responses: {
          '200': {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Logged out successfully' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user profile',
        description: 'Returns profile details of the currently authenticated user session.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Current user profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized - invalid or missing session' },
        },
      },
    },
    '/auth/admin-only': {
      get: {
        tags: ['Authentication'],
        summary: 'Admin-only RBAC verification endpoint',
        description: 'Tests role-based access control. Accessible strictly by users with the "Admin" role.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Admin access granted' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - insufficient permissions' },
        },
      },
    },
    '/auth/passkey/login-options': {
      post: {
        tags: ['Passkey & FIDO2'],
        summary: 'Generate WebAuthn challenge for login',
        description: 'Generates a cryptographic challenge for biometric (Windows Hello, Touch ID) or FIDO2 hardware security key (YubiKey) sign-in.',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email', description: 'Optional user email to filter registered credentials' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Challenge generated successfully' },
          '429': { description: 'Rate limit exceeded' },
        },
      },
    },
    '/auth/passkey/verify-login': {
      post: {
        tags: ['Passkey & FIDO2'],
        summary: 'Verify WebAuthn login assertion',
        description: 'Verifies the cryptographic signature against the user public key in MongoDB, updates the counter, and starts session.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['authenticationResponse'],
                properties: {
                  authenticationResponse: { type: 'object', description: 'Assertion response from browser navigator.credentials.get()' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Passkey signature verified and authenticated' },
          '401': { description: 'Passkey signature verification failed' },
          '404': { description: 'Passkey not found' },
          '429': { description: 'Rate limit exceeded' },
        },
      },
    },
    '/auth/passkey/register-options': {
      post: {
        tags: ['Passkey & FIDO2'],
        summary: 'Generate WebAuthn challenge for registration',
        description: 'Generates registration challenge options for creating a new passkey or hardware security key.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Registration options generated' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/auth/passkey/verify-registration': {
      post: {
        tags: ['Passkey & FIDO2'],
        summary: 'Verify and store new passkey credential',
        description: 'Verifies authenticator attestation and stores credential ID, public key buffer, counter, and device metadata. Never stores biometrics or private keys.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['registrationResponse'],
                properties: {
                  registrationResponse: { type: 'object', description: 'Attestation response from navigator.credentials.create()' },
                  nickname: { type: 'string', example: 'YubiKey 5C NFC' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Passkey registered successfully' },
          '400': { description: 'Verification failed or challenge expired' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/auth/passkey/list': {
      get: {
        tags: ['Passkey & FIDO2'],
        summary: 'List user passkeys',
        description: 'Retrieves all passkeys and security keys registered by the logged-in user.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of registered passkeys',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Passkey' },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/auth/passkey/{id}/rename': {
      patch: {
        tags: ['Passkey & FIDO2'],
        summary: 'Rename a passkey',
        description: 'Updates the nickname of a registered passkey.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Passkey database ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nickname'],
                properties: {
                  nickname: { type: 'string', example: 'Work Laptop Touch ID' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Passkey renamed successfully' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Passkey not found' },
        },
      },
    },
    '/auth/passkey/{id}': {
      delete: {
        tags: ['Passkey & FIDO2'],
        summary: 'Revoke a passkey',
        description: 'Permanently deletes and revokes a passkey or hardware security key.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Passkey database ID',
          },
        ],
        responses: {
          '200': { description: 'Passkey revoked successfully' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Passkey not found' },
        },
      },
    },
  },
};

export const swaggerUiOptions: SwaggerUiOptions = {
  customSiteTitle: 'WFA Platform - API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
  },
};
