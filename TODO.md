again with the correct path.# Profile Edit Restrictions - TODO

## Task
Make profile detail editable for customer only (not for seller and admin), and customer can only edit their details when their Vault is empty (no item for delivery remain) and once in a week only.

## Plan
- [ ] 1. Add PUT /api/users/:id endpoint in server.js to handle user profile updates with lastProfileEdit timestamp
- [ ] 2. Modify ProfilePage.jsx to add:
  - [ ] Role check (only customers can edit)
  - [ ] Vault check (only when vault is empty - no pending orders)
  - [ ] One-week check (only edit once per week)
  - [ ] Show appropriate error messages when editing is not allowed
- [ ] 3. Test the implementation
