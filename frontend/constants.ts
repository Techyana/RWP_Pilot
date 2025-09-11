
import { PreapprovedUser, Role } from './types';

export const PREAPPROVED_USERS: PreapprovedUser[] = [
  { name: 'John', surname: 'Doe', email: 'john.doe@workshop.com', rzaNumber: 'RZA12345', role: Role.ENGINEER },
  { name: 'Jane', surname: 'Smith', email: 'jane.smith@workshop.com', rzaNumber: 'RZA67890', role: Role.ENGINEER },
  { name: 'Peter', surname: 'Jones', email: 'peter.jones@workshop.com', rzaNumber: 'RZA11223', role: Role.SUPERVISOR },
  { name: 'Mary', surname: 'Williams', email: 'mary.williams@workshop.com', rzaNumber: 'RZA44556', role: Role.ADMIN },
];
