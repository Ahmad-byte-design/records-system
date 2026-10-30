import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toAsciiDigits } from '@/lib/arabic';
import type { NewUserInput, User } from '../types';

type UserState = {
  users: User[];
  addUser: (input: NewUserInput) => User;
  importUsers: (inputs: NewUserInput[]) => User[];
};

/** Demo rows that shipped before launch; removed by the persist migration. */
const LEGACY_SEED_IDS = new Set([1, 2, 3, 4, 5, 6, 7]);

type PersistedUserState = { users?: User[] };

function nextId(users: User[]): number {
  return users.reduce((max, user) => Math.max(max, user.id), 0) + 1;
}

function createUser(input: NewUserInput, id: number): User {
  return {
    id,
    name: input.name.trim(),
    phone: toAsciiDigits(input.phone.trim()),
    identity: toAsciiDigits(input.identity.trim()),
    createdAt: new Date().toISOString(),
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
    }),
    {
      // Kept as-is so existing browser data survives the rebrand.
      name: 'sijil:users:v1',
      version: 2,
      migrate: (persistedState, version) => {
        if (version >= 2) return persistedState as UserState;

        // v1 shipped seven demo rows with ids 1–7. Real records always start
        // at 8, so dropping those ids clears the test data without touching
        // anything the user entered or imported.
        const state = persistedState as PersistedUserState;
        return {
          ...state,
          users: (state.users ?? []).filter((user) => !LEGACY_SEED_IDS.has(user.id)),
        } as UserState;
      },
    },
  ),
);

