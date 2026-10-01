import { SwaggerUiOptions } from 'swagger-ui-express';

export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Workforce Analytics Platform API',
    version: '1.0.0',
    description:
      'Enterprise Workforce Analytics Platform API featuring passwordless WebAuthn / Passkeys, FIDO2 Hardware Security Keys, Employee Directory CRUD with soft deletion, Department & Team APIs, and real-time MongoDB Analytics.',
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
    { name: 'Passkey & FIDO2', description: 'Passwordless WebAuthn / Passkey registration, login, and credential management' },
    { name: 'Authentication', description: 'Session validation, user profile, and logout' },
    { name: 'Employees', description: 'Employee lifecycle, CRUD, search, filters, pagination, and soft deletion' },
    { name: 'Departments', description: 'Department management and headcount hierarchy' },
    { name: 'Teams', description: 'Team management within departments' },
    { name: 'Analytics', description: 'Real-time MongoDB workforce analytics, KPIs, and chart data' },
    { name: 'Skills', description: 'Skill catalog, competency benchmarks, and gap analytics' },
    { name: 'Roles', description: 'Enterprise job roles and permissions hierarchy' },
    { name: 'Locations', description: 'Workplace sites and remote hubs' },
    { name: 'Admin', description: 'Admin role oversight and user management' },
    { name: 'System', description: 'System health and monitoring endpoints' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token (obtained from /auth/login or /auth/login-verify response)',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66e123456789abcdef012345' },
          username: { type: 'string', example: 'admin' },
          email: { type: 'string', format: 'email', example: 'admin@wfa.internal' },
          displayName: { type: 'string', example: 'Enterprise Admin' },
          roles: {
            type: 'array',
            items: { type: 'string', enum: ['admin', 'manager', 'employee'] },
            example: ['admin'],
          },
          department: { type: 'string', example: 'Engineering' },
          lastLogin: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Department: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6ab21acf49522d27fe96275a' },
          name: { type: 'string', example: 'Engineering' },
          code: { type: 'string', example: 'ENG' },
          description: { type: 'string', example: 'Software and systems engineering' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Team: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6ab21ad049522d27fe962761' },
          name: { type: 'string', example: 'Backend Engineering' },
          code: { type: 'string', example: 'BE' },
          departmentId: { type: 'string', example: '6ab21acf49522d27fe96275a' },
          description: { type: 'string', example: 'Distributed microservices and database architecture' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Employee: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6ab2625f014c743408a8393c' },
          employeeId: { type: 'string', example: 'EMP-9001' },
          firstName: { type: 'string', example: 'Alexander' },
          lastName: { type: 'string', example: 'Wright' },
          fullName: { type: 'string', example: 'Alexander Wright' },
          email: { type: 'string', format: 'email', example: 'alexander.wright@workforce.internal' },
          phone: { type: 'string', example: '+1 (555) 789-4321' },
          departmentId: { $ref: '#/components/schemas/Department' },
          teamId: { $ref: '#/components/schemas/Team' },
          position: { type: 'string', example: 'Senior Cloud Solutions Architect' },
          employmentType: { type: 'string', enum: ['Full-time', 'Part-time', 'Contract', 'Intern'], example: 'Full-time' },
          status: { type: 'string', enum: ['Active', 'Inactive', 'On Leave', 'Terminated'], example: 'Active' },
          location: { type: 'string', example: 'New York' },
          hireDate: { type: 'string', format: 'date-time', example: '2026-09-22T00:00:00.000Z' },
          salary: { type: 'number', example: 142000 },
          isDeleted: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      EmployeeInput: {
        type: 'object',
        required: ['employeeId', 'firstName', 'lastName', 'email', 'departmentId', 'position', 'location', 'hireDate'],
        properties: {
          employeeId: { type: 'string', example: 'EMP-9002' },
          firstName: { type: 'string', example: 'Samantha' },
          lastName: { type: 'string', example: 'Reed' },
          email: { type: 'string', format: 'email', example: 'samantha.reed@workforce.internal' },
          phone: { type: 'string', example: '+1 (555) 654-3210' },
          departmentId: { type: 'string', example: '6ab21acf49522d27fe96275a' },
          teamId: { type: 'string', example: '6ab21ad049522d27fe962760' },
          position: { type: 'string', example: 'Senior Full-Stack Engineer' },
          employmentType: { type: 'string', enum: ['Full-time', 'Part-time', 'Contract', 'Intern'], default: 'Full-time' },
          status: { type: 'string', enum: ['Active', 'Inactive', 'On Leave', 'Terminated'], default: 'Active' },
          location: { type: 'string', example: 'San Francisco' },
          hireDate: { type: 'string', format: 'date', example: '2026-09-22' },
          salary: { type: 'number', example: 138000 },
        },
      },
      RegisterChallengeRequest: {
        type: 'object',
        required: ['username', 'email', 'displayName'],
        properties: {
          username: { type: 'string', example: 'john.doe' },
          email: { type: 'string', format: 'email', example: 'john.doe@wfa.internal' },
          displayName: { type: 'string', example: 'John Doe' },
        },
      },
      RegisterVerifyRequest: {
        type: 'object',
        required: ['response'],
        properties: {
          response: { type: 'object', description: 'Registration attestation response from startRegistration()' },
          friendlyName: { type: 'string', example: 'Windows (Chrome Passkey)' },
        },
      },
      LoginChallengeRequest: {
        type: 'object',
        properties: {
          username: { type: 'string', example: 'john.doe', description: 'Optional username for non-discoverable passkeys' },
        },
      },
      LoginVerifyRequest: {
        type: 'object',
        required: ['response'],
        properties: {
          response: { type: 'object', description: 'Assertion response from startAuthentication()' },
        },
      },
      Passkey: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66e987654321fedcba543210' },
          credentialID: { type: 'string', example: 'base64url-credential-id' },
          friendlyName: { type: 'string', example: 'Windows (Chrome Passkey)' },
          credentialDeviceType: { type: 'string', example: 'singleDevice' },
          transports: {
            type: 'array',
            items: { type: 'string' },
            example: ['internal', 'usb'],
          },
          createdAt: { type: 'string', format: 'date-time' },
          lastUsedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    // -------------------------------------------------------------
    // WEBAUTHN / PASSKEY & FIDO2 ENDPOINTS
    // -------------------------------------------------------------
    '/auth/register-challenge': {
      post: {
        tags: ['Passkey & FIDO2'],
        summary: 'Step 1: Request Registration Challenge',
        description: 'Generates a WebAuthn registration challenge for device biometrics or FIDO2 hardware keys.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterChallengeRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'WebAuthn registration options generated' },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/auth/register-verify': {
      post: {
        tags: ['Passkey & FIDO2'],
        summary: 'Step 2: Verify Registration Attestation',
        description: 'Cryptographically verifies device signature and stores public key in MongoDB.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterVerifyRequest' },
            },
          },
        },
        responses: {
          '201': { description: 'Passkey registered and user session created' },
          '400': { description: 'Verification failed' },
        },
      },
    },
    '/auth/login-challenge': {
      post: {
        tags: ['Passkey & FIDO2'],
        summary: 'Step 1: Request Login Challenge',
        description: 'Generates WebAuthn authentication options.',
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginChallengeRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Authentication options generated' },
        },
      },
    },
    '/auth/login-verify': {
      post: {
        tags: ['Passkey & FIDO2'],
        summary: 'Step 2: Verify Login Assertion',
        description: 'Cryptographically verifies device signature, increments counter, and establishes session.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginVerifyRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Authentication successful' },
          '400': { description: 'Verification failed' },
        },
      },
    },
    '/auth/credentials': {
      get: {
        tags: ['Passkey & FIDO2'],
        summary: 'List Registered Security Keys / Passkeys',
        description: 'Retrieves all passkeys and FIDO2 hardware keys registered to the authenticated user.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'List of registered credentials' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/auth/credentials/{id}': {
      patch: {
        tags: ['Passkey & FIDO2'],
        summary: 'Rename Credential',
        description: 'Updates the friendly name or nickname of a registered passkey.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['friendlyName'],
                properties: { friendlyName: { type: 'string', example: 'Work YubiKey 5C' } },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Credential renamed' },
          '404': { description: 'Credential not found' },
        },
      },
      delete: {
        tags: ['Passkey & FIDO2'],
        summary: 'Revoke Credential',
        description: 'Permanently deletes and revokes a passkey or hardware security key.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Credential revoked successfully' },
          '404': { description: 'Credential not found' },
        },
      },
    },

    // -------------------------------------------------------------
    // AUTHENTICATION & SESSION ENDPOINTS
    // -------------------------------------------------------------
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get Current Authenticated User',
        description: 'Returns profile details of the currently logged-in session.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'User profile retrieved' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Sign Out / Destroy Session',
        description: 'Destroys express-session and clears session cookie.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Logged out successfully' },
        },
      },
    },

    // -------------------------------------------------------------
    // EMPLOYEE APIS (DAY 4)
    // -------------------------------------------------------------
    '/employees': {
      get: {
        tags: ['Employees'],
        summary: 'List Employees (Paginated, Searchable, Filterable)',
        description: 'Retrieves employees with support for multi-field search, status/department/location filtering, sorting, and pagination. Soft-deleted employees are automatically excluded.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Items per page' },
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search term across name, email, employee ID, position' },
          { name: 'departmentId', in: 'query', schema: { type: 'string' }, description: 'Filter by Department ObjectId' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['Active', 'Inactive', 'On Leave', 'Terminated'] } },
          { name: 'employmentType', in: 'query', schema: { type: 'string', enum: ['Full-time', 'Part-time', 'Contract', 'Intern'] } },
          { name: 'location', in: 'query', schema: { type: 'string' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', default: 'createdAt' } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          '200': { description: 'Paginated list of employees' },
          '401': { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['Employees'],
        summary: 'Create Employee',
        description: 'Creates a new employee record with unique ID and email checks.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/EmployeeInput' },
            },
          },
        },
        responses: {
          '201': { description: 'Employee created successfully' },
          '400': { description: 'Validation failed' },
          '409': { description: 'Employee ID or email already exists' },
        },
      },
    },
    '/employees/{id}': {
      get: {
        tags: ['Employees'],
        summary: 'Get Employee by ID',
        description: 'Retrieves single employee details by MongoDB ObjectId or employee ID.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Employee details' },
          '404': { description: 'Employee not found' },
        },
      },
      put: {
        tags: ['Employees'],
        summary: 'Update Employee',
        description: 'Updates an existing employee record.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/EmployeeInput' },
            },
          },
        },
        responses: {
          '200': { description: 'Employee updated successfully' },
          '404': { description: 'Employee not found' },
        },
      },
      delete: {
        tags: ['Employees'],
        summary: 'Soft Delete Employee',
        description: 'Flags an employee as deleted (isDeleted: true) without losing historical records.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Employee soft-deleted successfully' },
          '404': { description: 'Employee not found' },
        },
      },
    },
    '/employees/{id}/status': {
      patch: {
        tags: ['Employees'],
        summary: 'Quick Status Change',
        description: 'Updates an employee status (Active, Inactive, On Leave, Terminated).',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['Active', 'Inactive', 'On Leave', 'Terminated'] },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Status updated' },
          '404': { description: 'Employee not found' },
        },
      },
    },

    // -------------------------------------------------------------
    // DEPARTMENT APIS
    // -------------------------------------------------------------
    '/departments': {
      get: {
        tags: ['Departments'],
        summary: 'List Departments',
        description: 'Retrieves all departments.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'List of departments' },
        },
      },
      post: {
        tags: ['Departments'],
        summary: 'Create Department',
        description: 'Creates a new department with unique code and name.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'code'],
                properties: {
                  name: { type: 'string', example: 'Legal & Compliance' },
                  code: { type: 'string', example: 'LEGAL' },
                  description: { type: 'string', example: 'Corporate legal affairs and regulatory compliance' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Department created' },
          '409': { description: 'Department code or name already exists' },
        },
      },
    },

    // -------------------------------------------------------------
    // TEAM APIS
    // -------------------------------------------------------------
    '/teams': {
      get: {
        tags: ['Teams'],
        summary: 'List Teams',
        description: 'Retrieves teams, optionally filtered by ?departmentId=...',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'departmentId', in: 'query', schema: { type: 'string' }, description: 'Filter by Department ObjectId' },
        ],
        responses: {
          '200': { description: 'List of teams' },
        },
      },
      post: {
        tags: ['Teams'],
        summary: 'Create Team',
        description: 'Creates a team within a department.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'code', 'departmentId'],
                properties: {
                  name: { type: 'string', example: 'Cloud Security' },
                  code: { type: 'string', example: 'SEC' },
                  departmentId: { type: 'string', example: '6ab21acf49522d27fe96275a' },
                  description: { type: 'string', example: 'Cloud security and infrastructure compliance' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Team created' },
          '404': { description: 'Department not found' },
          '409': { description: 'Team code already exists in department' },
        },
      },
    },

    // -------------------------------------------------------------
    // DASHBOARD ANALYTICS API
    // -------------------------------------------------------------
    '/analytics/dashboard': {
      get: {
        tags: ['Analytics'],
        summary: 'Real-Time Dashboard Analytics (8 KPIs & 6 Charts)',
        description: 'Aggregates live workforce metrics from MongoDB Atlas including Total Employees, Active, Departments, Teams, Present Today, On Leave, New Hires, Attendance Rate, and 6 visual chart aggregations.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Real-time dashboard analytics payload' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/analytics/placement': {
      get: {
        tags: ['Analytics'],
        summary: 'Placement Analytics (5 KPIs, Funnel, Salary Analysis & Breakdowns)',
        description: 'Aggregates candidate placement data, conversion funnel, salary analysis (min, max, median, average), and breakdowns by department, employer, skill, and location.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'department', in: 'query', schema: { type: 'string' }, description: 'Filter by Department Name or Code' },
          { name: 'location', in: 'query', schema: { type: 'string' }, description: 'Filter by Location (e.g. San Francisco)' },
          { name: 'employer', in: 'query', schema: { type: 'string' }, description: 'Filter by Employer Name' },
          { name: 'role', in: 'query', schema: { type: 'string' }, description: 'Filter by Role / Title' },
          { name: 'skill', in: 'query', schema: { type: 'string' }, description: 'Filter by Skill' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['In Progress', 'Placed', 'Failed'] }, description: 'Filter by Status' },
        ],
        responses: {
          '200': { description: 'Placement analytics payload' },
          '401': { description: 'Unauthorized - Bearer token required' },
        },
      },
    },

    // -------------------------------------------------------------
    // ADMIN ENDPOINTS
    // -------------------------------------------------------------
    '/auth/users': {
      get: {
        tags: ['Admin'],
        summary: 'List All Users with Passkey Counts (Admin Only)',
        description: 'Admin endpoint to inspect all users and their registered passkey counts.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'List of all users' },
          '403': { description: 'Forbidden - requires admin role' },
        },
      },
    },
    '/auth/users/{id}/role': {
      patch: {
        tags: ['Admin'],
        summary: 'Update User Roles (Admin Only)',
        description: 'Upgrades or modifies user roles (e.g. employee -> manager/admin).',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['roles'],
                properties: {
                  roles: {
                    type: 'array',
                    items: { type: 'string', enum: ['admin', 'manager', 'employee'] },
                    example: ['manager'],
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'User roles updated' },
          '403': { description: 'Forbidden' },
        },
      },
    },

    // -------------------------------------------------------------
    // ROLES APIS
    // -------------------------------------------------------------
    '/roles': {
      get: {
        tags: ['Roles'],
        summary: 'List Enterprise Roles',
        description: 'Retrieves all defined enterprise job roles with permission structures.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Roles list retrieved' },
          '401': { description: 'Unauthorized - Bearer token required' },
        },
      },
      post: {
        tags: ['Roles'],
        summary: 'Create Enterprise Role',
        description: 'Registers a new enterprise role.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'code', 'departmentId'],
                properties: {
                  name: { type: 'string', example: 'Lead Cloud Architect' },
                  code: { type: 'string', example: 'ENG-CLOUD' },
                  departmentId: { type: 'string', example: '6ab21acf49522d27fe96275a' },
                  level: { type: 'string', enum: ['Junior', 'Mid', 'Senior', 'Lead', 'Executive'] },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Role created' },
          '401': { description: 'Unauthorized' },
        },
      },
    },

    // -------------------------------------------------------------
    // LOCATIONS APIS
    // -------------------------------------------------------------
    '/locations': {
      get: {
        tags: ['Locations'],
        summary: 'List Workplace Locations',
        description: 'Retrieves all physical office facilities and remote hubs.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Locations list retrieved' },
          '401': { description: 'Unauthorized - Bearer token required' },
        },
      },
      post: {
        tags: ['Locations'],
        summary: 'Create Location',
        description: 'Registers a new workplace site.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'code', 'city', 'country'],
                properties: {
                  name: { type: 'string', example: 'Austin Engineering Hub' },
                  code: { type: 'string', example: 'ATX-HUB' },
                  city: { type: 'string', example: 'Austin' },
                  country: { type: 'string', example: 'United States' },
                  type: { type: 'string', enum: ['Office', 'Work From Home', 'Hybrid'] },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Location created' },
          '401': { description: 'Unauthorized' },
        },
      },
    },

    // -------------------------------------------------------------
    // SKILLS & SKILL ANALYTICS APIS
    // -------------------------------------------------------------
    '/skills': {
      get: {
        tags: ['Skills'],
        summary: 'List Skills Registry',
        description: 'Retrieves all organizational skills and benchmark demand.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Skills retrieved' },
          '401': { description: 'Unauthorized - Bearer token required' },
        },
      },
    },
    '/skills/analytics': {
      get: {
        tags: ['Skills'],
        summary: 'Skill Analytics Aggregation',
        description: 'Returns data for the 7 Skill Analytics panels: distribution, required vs available, gaps, coverage, top/missing skills, certifications, and training recommendations.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'departmentId',
            in: 'query',
            description: 'Optional department ObjectId filter',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Skill analytics payload' },
          '401': { description: 'Unauthorized - Bearer token required' },
        },
      },
    },

    // -------------------------------------------------------------
    // SYSTEM HEALTHCHECK
    // -------------------------------------------------------------
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Healthcheck',
        description: 'Server uptime and MongoDB connectivity check.',
        responses: {
          '200': { description: 'System healthy' },
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
    withCredentials: false,
  },
};
