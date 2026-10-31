import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NewUserInput, User } from '../types';

type UserState = {
  users: User[];
  addUser: (input: NewUserInput) => User;
  importUsers: (inputs: NewUserInput[]) => User[];
  updateUser: (id: number, input: NewUserInput) => User | undefined;
  deleteUser: (id: number) => void;
};

/** Demo rows that shipped before launch; removed by the persist migration. */
const LEGACY_SEED_IDS = new Set([1, 2, 3, 4, 5, 6, 7]);

type LegacyUser = {
  id: number;
  name: string;
  createdAt: string;
  username?: string;
  password?: string;
  /** v1/v2 field, mapped to username when migrating. */
  phone?: string;
  /** v1/v2 field, mapped to password when migrating. */
  identity?: string;
};

type PersistedUserState = { users?: LegacyUser[] };

function nextId(users: User[]): number {
  return users.reduce((max, user) => Math.max(max, user.id), 0) + 1;
}

function createUser(input: NewUserInput, id: number): User {
  return {
    id,
    name: input.name.trim(),
    username: input.username.trim(),
    password: input.password.trim(),
    createdAt: new Date().toISOString(),
  };
}

/** Carries v1/v2 records into the credentials model without losing the row. */
function toUser(user: LegacyUser): User {
  return {
    id: user.id,
    name: user.name,
    username: user.username ?? user.phone ?? '',
    password: user.password ?? user.identity ?? '',
    createdAt: user.createdAt,
  };
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: [],
      addUser: (input) => {
        const users = get().users;
        const user = createUser(input, nextId(users));
        set({ users: [...users, user] });
        return user;
      },
      importUsers: (inputs) => {
        if (!inputs.length) return [];
        const users = get().users;
        let id = nextId(users);
        const created = inputs.map((input) => {
          const user = createUser(input, id);
          id += 1;
          return user;
        });
        set({ users: [...users, ...created] });
        return created;
      },
      updateUser: (id, input) => {
        const users = get().users;
        const current = users.find((user) => user.id === id);
        if (!current) return undefined;

        const updated: User = {
          ...current,
          name: input.name.trim(),
          username: input.username.trim(),
          password: input.password.trim(),
        };
        set({ users: users.map((user) => (user.id === id ? updated : user)) });
        return updated;
      },
      deleteUser: (id) => {
        set({ users: get().users.filter((user) => user.id !== id) });
      },
    }),
    {
      // Kept as-is so existing browser data survives the rebrand.
      name: 'sijil:users:v1',
      version: 3,
      migrate: (persistedState, version) => {
        if (version >= 3) return persistedState as UserState;

        const state = persistedState as PersistedUserState;
        let users = state.users ?? [];

        // v1 shipped seven demo rows with ids 1–7. Real records always start
        // at 8, so dropping those ids clears the test data without touching
        // anything the user entered or imported.
        if (version < 2) {
          users = users.filter((user) => !LEGACY_SEED_IDS.has(user.id));
        }

        return { ...state, users: users.map(toUser) } as UserState;
      },
    },
  ),
);
