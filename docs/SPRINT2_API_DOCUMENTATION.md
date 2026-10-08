# Workforce Analytics Platform — Sprint 2 API Documentation

**Base URL**: `http://localhost:5000/api/v1`  
**Swagger UI**: `http://localhost:5000/api-docs`  
**OpenAPI Specification**: `http://localhost:5000/api-docs.json`  
**Authentication**: Bearer JWT (`Authorization: Bearer <jwt_token>`) / WebAuthn Cookie Session

---

## 1. Overview & Architecture

Sprint 2 introduces 3 advanced analytics calculation engines (**Placement**, **Recruitment**, and **Learning & Development**), an automated **Multi-Source Data Pipeline**, a **Skill Development Progress Report**, and an **Executive Data Export Engine** for Microsoft Excel (`.xlsx`) and printable PDF summaries.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        SPRINT 2 SERVICE LAYER                          │
│                                                                        │
│ ┌──────────────────────┐  ┌──────────────────────┐  ┌────────────────┐ │
│ │ Placement Analytics  │  │ Recruitment Analytics│  │ Learning & Dev │ │
│ │ - Funnel Conversion  │  │ - Hiring Funnel      │  │ - Upskilling   │ │
│ │ - Salary (₹ INR)     │  │ - Sourcing ROI       │  │ - Score Mastery│ │
│ └──────────┬───────────┘  └──────────┬───────────┘  └───────┬────────┘ │
│            │                         │                      │          │
│            ▼                         ▼                      ▼          │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │         Executive Reports & Export Engine (Excel & PDF)            │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Sprint 2 Role-Based Access Control (RBAC) Matrix

| Module / Action | Admin | HR Manager | Executive | Dept Manager | Team Lead | Employee |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Placement Analytics** | Full | Full | Full | Department | Department | Blocked |
| **Recruitment Analytics** | Full | Full | Full | Department | Department | Blocked |
| **Learning Analytics** | Full | Full | Full | Department | Department | Self |
| **Skill Development Report** | Full | Full | Full | Department | Department | Self |
| **Export Engine (Excel / PDF)** | Full | Full | Full | Department | Blocked | Blocked |
| **Data Ingestion Pipeline** | Yes | Yes | No | No | No | No |

---

## 3. Sprint 2 Analytics Endpoints

### 3.1 Placement Analytics Dashboard
Calculates candidate placement lifecycle, conversion funnel, employer benchmarks, and salary insights localized in Indian Rupee (**₹ INR**).

- **Method & Path**: `GET /api/v1/analytics/placement`
- **Auth**: Bearer Token / Session
- **Query Parameters**:
  - `department` (String, Optional): Filter by department name (e.g., `Engineering`)
  - `departmentId` (ObjectId, Optional): Filter by MongoDB Department ID
  - `role` (String, Optional): Filter by position
  - `location` (String, Optional): Filter by city (e.g., `Bangalore`, `San Francisco`)
  - `skill` (String, Optional): Filter by skill keyword
  - `employer` (String, Optional): Filter by corporate hiring partner
  - `status` (String, Optional): `Offered` | `Accepted` | `Joined` | `Declined`
  - `startDate` (ISO Date, Optional): Period start (e.g., `2026-01-01`)
  - `endDate` (ISO Date, Optional): Period end (e.g., `2026-12-31`)

#### Response 200 OK Schema
```json
{
  "success": true,
  "data": {
    "kpis": {
      "totalCandidates": 120,
      "candidatesPlaced": 86,
      "placementRate": 71.7,
      "avgPlacementTimeDays": 24.5,
      "avgSalary": 1450000,
      "medianSalary": 1400000,
      "totalOfferedSalary": 124700000
    },
    "funnel": [
      { "stage": "Total Candidates", "count": 120, "conversionRate": 100 },
      { "stage": "Screened", "count": 108, "conversionRate": 90.0 },
      { "stage": "Interviewed", "count": 98, "conversionRate": 81.7 },
      { "stage": "Offered", "count": 92, "conversionRate": 76.7 },
      { "stage": "Placed", "count": 86, "conversionRate": 71.7 }
    ],
    "breakdowns": {
      "placementsByDepartment": [
        { "department": "Engineering", "placedCount": 42 },
        { "department": "Data Science", "placedCount": 18 }
      ],
      "placementsBySkill": [
        { "skill": "React & TypeScript", "placedCount": 26 },
        { "skill": "Python & Data Pipeline", "placedCount": 22 }
      ],
      "placementsByLocation": [
        { "location": "Bangalore", "count": 38 },
        { "location": "Hyderabad", "count": 24 }
      ],
      "placementsByEmployer": [
        { "employer": "TechCorp Global", "count": 18 },
        { "employer": "InnoSoft Systems", "count": 14 }
      ]
    },
    "salaryAnalysis": {
      "min": 650000,
      "max": 2800000,
      "average": 1450000,
      "percentiles": {
        "p25": 1100000,
        "p50": 1400000,
        "p75": 1850000
      }
    }
  }
}
```

---

### 3.2 Recruitment Analytics Dashboard
Calculates job requisition fulfillment, candidate hiring funnel, sourcing channel ROI, and cost/time-to-hire benchmarks.

- **Method & Path**: `GET /api/v1/analytics/recruitment`
- **Auth**: Bearer Token / Session
- **Query Parameters**:
  - `department` (String, Optional): Filter by department
  - `departmentId` (ObjectId, Optional): Filter by department ID
  - `location` (String, Optional): Filter by location
  - `priority` (String, Optional): `Low` | `Medium` | `High` | `Urgent`
  - `channel` (String, Optional): `LinkedIn` | `Referral` | `Campus` | `Direct` | `Agency`
  - `startDate`, `endDate` (ISO Date, Optional)

#### Response 200 OK Schema
```json
{
  "success": true,
  "data": {
    "kpis": {
      "openPositions": 45,
      "totalApplications": 1250,
      "shortlisted": 480,
      "interviews": 210,
      "offers": 95,
      "successfulHires": 78,
      "avgTimeToHireDays": 28.4,
      "avgCostPerHire": 42000,
      "offerAcceptanceRate": 82.1
    },
    "funnel": [
      { "stage": "Applications", "count": 1250, "conversionRate": 100 },
      { "stage": "Shortlisted", "count": 480, "conversionRate": 38.4 },
      { "stage": "Interviewed", "count": 210, "conversionRate": 16.8 },
      { "stage": "Offered", "count": 95, "conversionRate": 7.6 },
      { "stage": "Hired", "count": 78, "conversionRate": 6.2 }
    ],
    "channelROI": [
      { "channel": "LinkedIn", "applications": 540, "hires": 38, "conversionRate": 7.0, "avgCostPerHire": 38000 },
      { "channel": "Referral", "applications": 120, "hires": 22, "conversionRate": 18.3, "avgCostPerHire": 15000 },
      { "channel": "Direct", "applications": 390, "hires": 12, "conversionRate": 3.1, "avgCostPerHire": 25000 }
    ],
    "requisitionFulfillment": [
      { "department": "Engineering", "openPositions": 20, "hiredCount": 16, "fulfillmentRate": 80.0 },
      { "department": "Marketing", "openPositions": 8, "hiredCount": 7, "fulfillmentRate": 87.5 }
    ]
  }
}
```

---

### 3.3 Learning & Development Analytics Dashboard
Quantifies upskilling velocity, course completion funnels, assessment score mastery, and closed skill-gap ratios.

- **Method & Path**: `GET /api/v1/analytics/learning`
- **Auth**: Bearer Token / Session
- **Query Parameters**:
  - `department` (String, Optional): Filter by department
  - `departmentId` (ObjectId, Optional): Filter by department ID
  - `category` (String, Optional): `Technical` | `Leadership` | `Domain` | `Analytical`
  - `skill` (String, Optional): Filter by skill
  - `status` (String, Optional): `Enrolled` | `In-Progress` | `Completed` | `Dropped`
  - `startDate`, `endDate` (ISO Date, Optional)

#### Response 200 OK Schema
```json
{
  "success": true,
  "data": {
    "kpis": {
      "totalEnrolled": 210,
      "completionRate": 78.5,
      "avgAssessmentScore": 84.2,
      "totalTrainingHours": 4200,
      "certificationsEarned": 142,
      "trainingEffectivenessScore": 4.6
    },
    "funnel": [
      { "stage": "Enrolled", "count": 210, "percentage": 100 },
      { "stage": "In Progress", "count": 45, "percentage": 21.4 },
      { "stage": "Assessment Attempted", "count": 165, "percentage": 78.5 },
      { "stage": "Completed", "count": 165, "percentage": 78.5 },
      { "stage": "Certified", "count": 142, "percentage": 67.6 }
    ],
    "departmentProgress": [
      { "department": "Engineering", "totalEnrolled": 95, "completionRate": 84.2, "avgScore": 86.5 },
      { "department": "Operations", "totalEnrolled": 40, "completionRate": 72.5, "avgScore": 81.0 }
    ],
    "skillGapBridge": [
      {
        "targetSkill": "Cloud Architecture",
        "initialGap": 12,
        "enrolledCount": 15,
        "completedCount": 11,
        "closedGapCount": 10,
        "gapResolutionRate": 83.3
      }
    ]
  }
}
```

---

## 4. Sprint 2 Data Pipeline & Ingestion API

### 4.1 Pipeline Status & Synchronization Audit
- **Method & Path**: `GET /api/v1/pipeline`
- **Auth**: Bearer Token (Admin, HR Manager)
- **Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "totalIngested": 415,
    "lastSyncTimestamp": "2026-10-07T10:15:00.000Z",
    "collections": {
      "placements": 120,
      "recruitments": 85,
      "learningRecords": 210
    },
    "deduplication": {
      "duplicatesRejected": 14,
      "orphansResolved": 6
    }
  }
}
```

---

### 4.2 Multi-Source Batch Ingestion Engine
- **Method & Path**: `POST /api/v1/pipeline/ingest`
- **Auth**: Bearer Token (Admin, HR Manager)
- **Request Body**:
```json
{
  "placements": [
    {
      "placementId": "PLC-9901",
      "candidateName": "Ananya Roy",
      "candidateEmail": "ananya.roy@example.com",
      "position": "Lead Data Engineer",
      "employerName": "DataScale Systems",
      "offeredSalary": 1800000,
      "joiningDate": "2026-11-01",
      "status": "Accepted",
      "timeToPlaceDays": 21
    }
  ],
  "recruitments": [
    {
      "requisitionId": "REQ-2026-99",
      "jobTitle": "Senior Frontend Developer",
      "department": "Engineering",
      "openPositions": 3,
      "channel": "LinkedIn",
      "status": "Active"
    }
  ],
  "learningRecords": [ ... ]
}
```

---

## 5. Executive Reports & Export Engine

### 5.1 Skill Development Progress Report
- **Method & Path**: `GET /api/v1/reports/skill-development`
- **Auth**: Bearer Token
- **Query Parameters**: `department`, `departmentId`, `skill`, `status`, `q`, `page`, `limit`

#### Response 200 OK Schema
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalTracked": 210,
      "completedCount": 165,
      "gapsIdentified": 48,
      "gapsResolved": 42,
      "resolutionRate": 87.5,
      "avgCompetencyGain": 1.4
    },
    "records": [
      {
        "_id": "6ab84001c98a761234567890",
        "employee": {
          "name": "Alexander Wright",
          "employeeId": "EMP-1001",
          "email": "alexander.wright@workforce.internal"
        },
        "department": { "name": "Engineering", "code": "ENG" },
        "course": { "title": "Advanced Microservices Architecture", "category": "Technical" },
        "targetSkill": { "name": "Kubernetes" },
        "baselineRating": 2.5,
        "postTrainingRating": 4.5,
        "ratingDelta": 2.0,
        "gapIdentified": true,
        "gapResolved": true,
        "assessmentScore": 92,
        "certificationEarned": true
      }
    ],
    "pagination": { "total": 210, "page": 1, "limit": 10, "totalPages": 21 }
  }
}
```

---

### 5.2 Multi-Format Executive Export Engine
Streams authenticated workforce data in **Microsoft Excel (`.xlsx` UTF-8 BOM)** or printable **PDF** report layout.

- **Method & Path**: `GET /api/v1/reports/export`
- **Auth**: Bearer Token (Admin, Executive, HR Manager, Department Manager)
- **Query Parameters**:
  - `type` (Required): `placement` | `recruitment` | `learning` | `skill-development`
  - `format` (Required): `excel` | `pdf`
  - `departmentId` (Optional ObjectId)
  - `department` (Optional Name/Code string)

#### Content-Type Headers Streamed:
- **Excel Output**: `Content-Type: application/vnd.ms-excel`
- **PDF Printable Output**: `Content-Type: text/html; charset=utf-8`

---

## 6. Sprint 2 Database Schemas (Data Dictionaries)

### 6.1 `placements` Collection
| Field | Type | Rules & Indexing | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Mongo auto ID |
| `placementId` | String | Required, Unique, Indexed | Candidate Placement ID (e.g. `PLC-1001`) |
| `candidateName` | String | Required | Full candidate name |
| `candidateEmail` | String | Required, Lowercase | Candidate contact email |
| `departmentId` | ObjectId | Ref: `departments` | Target hiring department |
| `employerName` | String | Required | Corporate employer (e.g. `TechCorp Global`) |
| `position` | String | Required | Job title placed |
| `offeredSalary` | Number | Required | Offered base salary (**₹ INR**) |
| `placementDate` | Date | Required | Placement offer/acceptance date |
| `status` | Enum | Required | `Offered`, `Accepted`, `Joined`, `Declined` |
| `timeToPlaceDays` | Number | Default: 0 | Days from sourcing to placement |
| `skills` | Array[String] | Optional | Associated core technical skills |

### 6.2 `recruitments` Collection
| Field | Type | Rules & Indexing | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Mongo auto ID |
| `requisitionId` | String | Required, Unique, Indexed | Requisition Code (e.g. `REQ-2026-01`) |
| `jobTitle` | String | Required | Job title opening |
| `departmentId` | ObjectId | Ref: `departments` | Department requesting headcount |
| `location` | String | Required | Target office location |
| `priority` | Enum | Default: `Medium` | `Low`, `Medium`, `High`, `Urgent` |
| `channel` | Enum | Default: `Direct` | `LinkedIn`, `Referral`, `Campus`, `Direct`, `Agency` |
| `openPositions` | Number | Required | Target hiring quota |
| `applicationsCount` | Number | Default: 0 | Candidates applied |
| `shortlistedCount` | Number | Default: 0 | Candidates passed initial screen |
| `interviewedCount` | Number | Default: 0 | Candidates interviewed |
| `offeredCount` | Number | Default: 0 | Job offers extended |
| `hiredCount` | Number | Default: 0 | Hires completed |
| `costPerHire` | Number | Default: 0 | Sourcing & recruiter cost |
| `avgTimeToHireDays` | Number | Default: 0 | Days to fulfill opening |
| `status` | Enum | Default: `Active` | `Draft`, `Active`, `Filled`, `Cancelled` |

### 6.3 `learningrecords` Collection
| Field | Type | Rules & Indexing | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Mongo auto ID |
| `recordId` | String | Required, Unique, Indexed | Enrolment Record ID (e.g. `LR-5001`) |
| `employeeId` | ObjectId | Ref: `employees` | Trainee employee ID |
| `departmentId` | ObjectId | Ref: `departments` | Employee department |
| `trainingId` | ObjectId | Ref: `trainings` | Enrolled course/program ID |
| `targetSkillId` | ObjectId | Ref: `skills` | Targeted skill upgrade |
| `progressPct` | Number | Default: 0 | Course progress percentage (0 - 100) |
| `status` | Enum | Default: `Enrolled` | `Enrolled`, `In-Progress`, `Completed`, `Dropped` |
| `hoursSpent` | Number | Default: 0 | Total learning hours completed |
| `assessmentScore` | Number | Default: 0 | Final exam score (0 - 100) |
| `passedAssessment` | Boolean | Default: false | True if score $\ge 75\%$ |
| `certificationEarned` | Boolean | Default: false | True if certificate issued |
| `certificateName` | String | Optional | Title of certificate |
| `certificateId` | String | Optional | Unique verification code |
