import React from 'react';
import { render, screen } from '@testing-library/react';
import { UserTable } from '@/components/users/user-table';
import { User } from '@/types/user';
import '@testing-library/jest-dom';

// Mock translation
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en' },
    }),
}));

// Mock HeroUI components if needed, or rely on them working in JSDOM
// Usually HeroUI components work fine if environment is set up.

const mockUsers: User[] = [
    {
        id: "1",
        username: "test",
        email: "test@test.com",
        display_name: { en: "Test User", th: "", ja: "" },
        roles: ["admin"],
        department: "IT",
        status: "active",
        last_login: null,
        created_at: new Date().toISOString()
    }
];

describe("UserTable", () => {
    it("renders user data", () => {
        render(
            <UserTable
                users={mockUsers}
                isLoading={false}
                total={1}
                page={1}
                limit={10}
                onSortChange={jest.fn()}
                onPageChange={jest.fn()}
                onSelectionChange={jest.fn()}
                onAction={jest.fn()}
            />
        );

        expect(screen.getByText("test@test.com")).toBeInTheDocument();
        expect(screen.getByText("Admin")).toBeInTheDocument();
    });
});
