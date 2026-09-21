# Authorization Architecture & Role-Based Access Control (RBAC)

## 1. Overview
WFA implements hierarchical and granular Role-Based Access Control across five enterprise roles:
1. **Admin**: Full administrative configuration, audit logs, and user management.
2. **HR**: Workforce directory, recruitment, training, compliance, and department metrics.
3. **Manager**: Departmental staffing, performance, attendance review, and schedule approvals.
4. **Team Lead**: Shift management, task distribution, team attendance, and skill tracking.
5. **Employee**: Self-service profile, shift view, training recommendations, and personal attendance.

## 2. Permission Matrix

| Permission Key | Description | Admin | HR | Manager | Team Lead | Employee |
|---|---|:---:|:---:|:---:|:---:|:---:|
| `employee:view` | View employee directory | ✅ | ✅ | ✅ | ✅ | ✅ |
| `employee:create` | Onboard new employee | ✅ | ✅ | ❌ | ❌ | ❌ |
| `employee:update` | Modify employee record | ✅ | ✅ | ❌ | ❌ | ❌ |
| `employee:delete` | Offboard / delete employee | ✅ | ❌ | ❌ | ❌ | ❌ |
| `attendance:view` | View attendance logs | ✅ | ✅ | ✅ | ✅ | Self |
| `attendance:manage` | Correct attendance entries | ✅ | ✅ | ✅ | ❌ | ❌ |
| `leave:review` | Approve/reject leave requests | ✅ | ✅ | ✅ | ✅ | ❌ |
| `schedule:manage` | Create / edit shift rosters | ✅ | ❌ | ✅ | ✅ | ❌ |
| `compliance:review` | Audit labor compliance rules | ✅ | ✅ | ❌ | ❌ | ❌ |
| `payroll:view` | Inspect salary and payroll data | ✅ | ✅ | ❌ | ❌ | Self |
| `payroll:manage` | Run payroll processes | ✅ | ✅ | ❌ | ❌ | ❌ |
| `reports:export` | Export analytics CSV/PDF | ✅ | ✅ | ✅ | ❌ | ❌ |
| `audit:view` | Inspect platform audit trails | ✅ | ❌ | ❌ | ❌ | ❌ |
| `settings:manage` | Manage system settings | ✅ | ❌ | ❌ | ❌ | ❌ |

## 3. Enforcement Strategy
- **Frontend Route Guards**: Render UI controls conditionally to deliver a clean user experience. Frontend checks are not considered security boundaries.
- **Backend Middleware**: Every API request is verified server-side against the user's role and specific permissions before executing any business logic.
