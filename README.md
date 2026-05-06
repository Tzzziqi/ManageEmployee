# Employee Management System

## Project Overview

This project is a Full Stack Employee Management System designed to support employee onboarding and HR operations.

Employees can submit onboarding applications, manage personal information, and upload work authorization documents. HR users can review onboarding applications, manage employee records, and operate a multi-step visa workflow approval system.

The project focuses on workflow-based system design rather than simple CRUD operations.

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

The HR module is the core workflow management component of the system.

It contains three major parts:

- Onboarding Application Review
- Employee Profile Management
- Visa Status Workflow Management

---

## Onboarding Application Review

HR can:

- View onboarding applications by status
- Open full onboarding forms
- Approve or reject applications
- Submit rejection feedback

The onboarding system was designed as the entry point of the employee lifecycle.

After onboarding approval, the backend initializes downstream business logic, including employee profile creation and visa workflow initialization when work authorization requires OPT processing.

The system also separates onboarding submissions from permanent employee records to avoid coupling temporary application state with long-term employee data.

The onboarding review process also creates an interaction loop between HR and employees:

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

---

## Employee Profile Management

HR can:

- View employee records
- Search employees by name
- View work authorization information
- Navigate employee records through pagination

Employee profiles are maintained independently from onboarding applications so that employee records remain stable after onboarding approval.

This separation required synchronization between onboarding approval, employee profile creation, and visa workflow initialization.

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

HR can:

- Preview uploaded documents
- Download uploaded documents
- Approve documents
- Reject documents with feedback
- Send next-step notification emails

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
