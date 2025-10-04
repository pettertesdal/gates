export const mockValidUsers = [
  { username: 'user', role: 1, team: 1 },
  { username: 'admin', role: 2, team: 1 },
  { username: 'superadmin', role: 3, team: 1 },
];


export let nextRequestId = 3;

export function getUsernames() {
  return mockValidUsers;
}
