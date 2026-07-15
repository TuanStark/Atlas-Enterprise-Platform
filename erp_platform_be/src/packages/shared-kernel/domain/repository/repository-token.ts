export const createRepositoryToken = (aggregate: string): symbol =>
  Symbol(`${aggregate}Repository`);
