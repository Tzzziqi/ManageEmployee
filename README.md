# Employee Management System

## Project Overview

This project is a Full Stack Employee Management System designed to support employee onboarding and HR operations.

The system provides separate workflows for employees and HR users.

Employees can:

- Register through HR-generated invitation links
- Submit onboarding applications
- Manage personal information
- Upload work authorization documents
- Track visa workflow progress

HR users can:

- Generate registration invitation links for new employees
- Send onboarding invitation emails
- Review onboarding applications
- Manage employee records
- Operate a multi-step visa approval workflow
- Review uploaded documents
- Send workflow notification emails

---

# Tech Stack

## Frontend

- React
- TypeScript
- Redux Toolkit
- React Router
- Tailwind CSS
- Axios

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Nodemailer

---

# Team Responsibilities

| Module | Owner |
|---|---|
| Application | ShaoEH |
| HR | Tzzziqi |
| Employee | Freya |

---

# HR Module

It contains three major parts:

- Onboarding Application Review
- Employee Profile Management
- Visa Status Workflow Management

---

## Onboarding Application Review

The onboarding system acts as the entry point of the employee lifecycle.

HR can review onboarding applications through approval and rejection workflows, while employees can receive feedback, update their submissions, and re-submit applications.

```text
Employee submits onboarding
↓
HR reviews application
↓
Approve / Reject
↓
Employee receives feedback
↓
Employee updates and re-submits
```

After onboarding approval, the backend initializes downstream business logic, including employee profile creation and visa workflow initialization when OPT processing is required.

The system also separates onboarding submissions from permanent employee records to avoid coupling temporary application state with long-term employee data.

---

## Employee Profile Management

Employee profiles are maintained independently from onboarding submissions so that permanent employee records remain stable after onboarding approval.

This separation required synchronization between onboarding approval, employee profile creation, and visa workflow initialization.

The HR system supports employee search, profile management, and work authorization tracking through a dedicated employee records module.

---

## Visa Status Workflow Management

The visa system is implemented as a workflow engine instead of a simple document upload system.

Workflow order:

```text
OPT_RECEIPT
→ OPT_EAD
→ I_983
→ I_20
```

Each document maintains an independent status:

```text
not_uploaded
pending
approved
rejected
```

The visa workflow system supports document review, approval/rejection handling, feedback loops, and next-step notification delivery between HR and employees.

The system enforces strict sequential workflow progression:

- Employees cannot upload the next document until the previous step is approved
- Rejected documents require re-upload
- Approval unlocks the next workflow stage

All workflow state transitions are centralized inside:

```text
VisaStatus.documents
```

The project also separates onboarding approval from visa approval:

```text
Onboarding Approval
≠
Visa Document Approval
```

Onboarding approval controls employee lifecycle initialization, while visa approval only manages document-level workflow progression.

The HR and employee sides are connected through a bidirectional workflow process:

```text
Employee uploads document
↓
HR reviews document
↓
Approve / Reject
↓
Employee receives feedback or next-step notification
↓
Employee uploads the next required document
```

The notification system is integrated directly into the workflow engine. After HR approves a document, the system determines the next required step and sends a dynamic email notification to the employee.

---

# Architecture

The project follows a layered frontend/backend architecture with centralized workflow management inside the VisaStatus module.
