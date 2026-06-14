# Implementation Plan: Role-Based User Management (Owner vs. Manager)

This plan details how we will introduce user roles, allow the owner to add/delete manager accounts, and restrict manager permissions (add and sale only, no reports, no user management, no deletion).

## User Review Required
We will add a new `role` field to the User model. By default, the main account (`alaminice1617@gmail.com`) is designated as `owner`. Any accounts created by the owner in the settings page will be given the `manager` role.
Managers will be allowed to view/add products, view/add customers, view/add sales, and record payments. They will NOT see reports, other user accounts, or deletion options.

## Proposed Changes

### [MODIFY] User Schema
#### [User.ts](file:///g:/shain-traders/src/models/User.ts)
- Add a `role` field: string, enum `["owner", "manager"]`, default `manager`.
- Set default user (`alaminice1617@gmail.com`) to `owner` on creation.

### [NEW] Authentication Helpers
#### [auth.ts](file:///g:/shain-traders/src/lib/auth.ts)
- Implement `getSession` helper to decrypt the JWT cookie and retrieve the user's ID, email, and role.

### [MODIFY] Auth APIs
#### [login/route.ts](file:///g:/shain-traders/src/app/api/auth/login/route.ts)
- Inject the user's `role` into the SignJWT token payload.
#### [me/route.ts](file:///g:/shain-traders/src/app/api/auth/me/route.ts)
- Return the user's `role` and email.

### [NEW] Users API (Owner only)
#### [api/users/route.ts](file:///g:/shain-traders/src/app/api/users/route.ts)
- `GET`: List all manager users (only available to `owner`).
- `POST`: Create a new manager user (only available to `owner`).
#### [api/users/[id]/route.ts](file:///g:/shain-traders/src/app/api/users/[id]/route.ts)
- `DELETE`: Delete a manager user (only available to `owner`).

### [MODIFY] API Access Restriction
#### [api/products/[id]/route.ts](file:///g:/shain-traders/src/app/api/products/[id]/route.ts)
- Protect `DELETE` operations (restricted to `owner`).
#### [api/customers/[id]/route.ts](file:///g:/shain-traders/src/app/api/customers/[id]/route.ts)
- Protect `DELETE` operations (restricted to `owner`).

### [MODIFY] Frontend Roles Integration
#### [Sidebar.tsx](file:///g:/shain-traders/src/components/Sidebar.tsx)
- Hide "Dues Report" if the logged-in user is a `manager`.
#### [inventory/page.tsx](file:///g:/shain-traders/src/app/inventory/page.tsx)
- Hide the product "Delete" button if the user is a `manager`.
#### [customers/page.tsx](file:///g:/shain-traders/src/app/customers/page.tsx)
- Hide the customer "Delete" button if the user is a `manager`.
#### [settings/page.tsx](file:///g:/shain-traders/src/app/settings/page.tsx)
- If the logged-in user is `owner`, display the "Manage Staff Accounts" section to view managers and create new manager accounts.

## Verification Plan
### Automated Verification
- Verify code compiles successfully (`next build`).
### Manual Verification
- Test logging in as `owner` and adding a new `manager` account.
- Log in as the `manager` account, verify reports are hidden, and check that delete buttons in inventory/customers are invisible/disabled.
- Verify calling the DELETE APIs from a manager account returns `403 Forbidden`.
