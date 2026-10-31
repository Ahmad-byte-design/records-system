export type User = {
  id: number;
  name: string;
  username: string;
  password: string;
  createdAt: string;
};

export type NewUserInput = Pick<User, 'name' | 'username' | 'password'>;
