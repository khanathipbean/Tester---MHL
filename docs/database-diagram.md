# Database Schema — ER Diagram

```mermaid
erDiagram
    Project ||--o{ TestSuite : "has"
    Project ||--o{ TestCase : "has"
    Project ||--o{ TestRun : "has"
    Project ||--o{ Defect : "has"
    Project ||--o{ Tag : "has"

    TestSuite ||--o{ TestCase : "contains"
    TestSuite ||--o{ TestSuite : "parent-child"

    TestCase ||--o{ TestStep : "has"
    TestCase ||--o{ TestExecution : "executed in"
    TestCase ||--o{ Defect : "linked to"
    TestCase ||--o{ TestCaseTag : "tagged"

    TestRun ||--o{ TestExecution : "contains"

    TestExecution ||--o{ Defect : "reported from"

    Tag ||--o{ TestCaseTag : "applied to"

    Project {
        string id PK
        string key UK
        string name
        string description
        string status
        datetime createdAt
        datetime updatedAt
    }

    TestSuite {
        string id PK
        string projectId FK
        string parentId FK
        string name
        string description
        datetime createdAt
        datetime updatedAt
    }

    TestCase {
        string id PK
        string projectId FK
        string suiteId FK
        string key
        string title
        string description
        string preconditions
        string condition
        string testSteps
        string expectedResult
        string priority
        string type
        string status
        string automationStatus
        string notes
        boolean clarificationRequired
        boolean inProgress
        boolean tested
        string createdByName
        string updatedByName
        datetime createdAt
        datetime updatedAt
    }

    TestStep {
        string id PK
        string testCaseId FK
        int position
        string action
        string expectedResult
        string testData
        datetime createdAt
        datetime updatedAt
    }

    TestRun {
        string id PK
        string projectId FK
        string key
        string name
        string environment
        string status
        datetime startedAt
        datetime completedAt
        datetime createdAt
        datetime updatedAt
    }

    TestExecution {
        string id PK
        string testRunId FK
        string testCaseId FK
        string status
        string assigneeName
        string actualResult
        string notes
        int durationSeconds
        datetime executedAt
        datetime createdAt
        datetime updatedAt
    }

    Defect {
        string id PK
        string projectId FK
        string testCaseId FK
        string executionId FK
        string key
        string title
        string description
        string severity
        string priority
        string status
        string externalUrl
        datetime createdAt
        datetime updatedAt
    }

    Tag {
        string id PK
        string projectId FK
        string name
        string color
        datetime createdAt
        datetime updatedAt
    }

    TestCaseTag {
        string testCaseId PK_FK
        string tagId PK_FK
        datetime assignedAt
    }

    User {
        string id PK
        string name
        string email UK
        string password
        string role
        datetime createdAt
        datetime updatedAt
    }
```

## Summary

| Table | Description |
|-------|-------------|
| **Project** | Top-level container for all test assets |
| **TestSuite** | Module/folder grouping (hierarchical via parentId) |
| **TestCase** | Individual test case with conditions, steps, expected results |
| **TestStep** | Ordered steps within a test case |
| **TestRun** | A test execution session (planned → in-progress → completed) |
| **TestExecution** | Status of a specific test case within a test run |
| **Defect** | Bug/defect linked to test case or execution |
| **Tag** | Labels for categorizing test cases |
| **TestCaseTag** | Many-to-many join table (TestCase ↔ Tag) |
| **User** | System users with role-based access (ADMIN, QA, DEV, VIEWER) |

## Key Relationships

- **Project** → cascades delete to all child entities
- **TestSuite** → self-referencing hierarchy (parent/children)
- **TestCase ↔ Tag** → many-to-many via TestCaseTag
- **TestExecution** → links TestRun + TestCase (unique per run)
- **Defect** → optionally linked to TestCase and/or TestExecution
- **User** → standalone (no FK, uses name fields in other tables)
