# Task: Role-Based User Management

- [ ] Update `User.ts` model with the `role` property and default setup
- [ ] Create `auth.ts` decryption helper in `g:/shain-traders/src/lib/auth.ts`
- [ ] Update login and me API endpoints to encode/decode user roles
- [ ] Create API routes for manager management:
  - [ ] `/api/users` (GET to list, POST to create)
  - [ ] `/api/users/[id]` (DELETE to remove a manager user)
- [ ] Protect DELETE operations on existing APIs (products and customers)
- [ ] Update UI views:
  - [ ] Update Sidebar to show/hide Dues Report based on role
  - [ ] Update Inventory Page to hide Delete buttons for managers
  - [ ] Update Customers Page to hide Delete buttons for managers
  - [ ] Update Settings Page to add the "Manage Staff Accounts" UI for the owner
- [ ] Verify and build
