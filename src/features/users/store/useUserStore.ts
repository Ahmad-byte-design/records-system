import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toAsciiDigits } from '@/lib/arabic';
import type { NewUserInput, User } from '../types';

type UserState = {
  users: User[];
  addUser: (input: NewUserInput) => User;
  importUsers: (inputs: NewUserInput[]) => User[];
};

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

const seedUsers: User[] = [
  {
    id: 1,
    name: 'أحمد محمد العلي',
    phone: '0938 938 300',
    identity: '012931092',
    createdAt: '2026-09-14T09:20:00.000Z',
  },
  {
    id: 2,
    name: 'سارة خالد الحربي',
    phone: '0944 210 876',
    identity: '019284617',
    createdAt: '2026-09-22T12:45:00.000Z',
  },
  {
    id: 3,
    name: 'عمر حسن الزبيدي',
    phone: '0991 554 128',
    identity: '011782430',
    createdAt: '2026-10-02T08:10:00.000Z',
  },
  {
    id: 4,
    name: 'ليلى عبد الرحمن',
    phone: '0935 771 204',
    identity: '014506238',
    createdAt: '2026-10-09T15:30:00.000Z',
  },
  {
    id: 5,
    name: 'يوسف كريم السالم',
    phone: '0770 318 992',
    identity: '018347205',
    createdAt: '2026-10-18T10:05:00.000Z',
  },
  {
    id: 6,
    name: 'نور الهدى سالم',
    phone: '0781 426 073',
    identity: '016720394',
    createdAt: '2026-10-24T17:40:00.000Z',
  },
  {
    id: 7,
    name: 'محمد جاسم العبيدي',
    phone: '0750 662 481',
    identity: '013468927',
    createdAt: '2026-10-28T07:55:00.000Z',
  },
];

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: seedUsers,
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
      version: 1,
    },
  ),
);
