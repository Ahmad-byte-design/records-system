export type User = {
  id: number;
  name: string;
  phone: string;
  identity: string;
  createdAt: string;
};

export type NewUserInput = Pick<User, 'name' | 'phone' | 'identity'>;
