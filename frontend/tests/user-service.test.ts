
import { userService } from "@/services/user.service";
import usersData from "@/mocks/seed/users.json";

describe("UserService (Mock)", () => {
    // Assuming mock is enabled by default or env var
    
    it("should list users", async () => {
        const result = await userService.listUsers({});
        expect(result.data).toBeDefined();
        expect(result.data.length).toBeGreaterThan(0);
        expect(result.meta.total).toBe(usersData.length);
    });

    it("should filter users by search", async () => {
        const result = await userService.listUsers({ search: "anucha" });
        expect(result.data.length).toBe(1);
        expect(result.data[0].username).toBe("anucha");
    });

    it("should create a user", async () => {
        const newUser = {
            username: "testuser",
            email: "test@example.com",
            display_name: { en: "Test User", th: "Test", ja: "Test" },
            roles: ["viewer"],
            department: "IT",
            status: "active" as const
        };
        const created = await userService.createUser(newUser);
        expect(created.id).toBeDefined();
        expect(created.username).toBe(newUser.username);

        const list = await userService.listUsers({ search: "testuser" });
        expect(list.data.length).toBe(1);
    });

    it("should update a user", async () => {
        const user = (await userService.listUsers({})) .data[0];
        const updated = await userService.updateUser(user.id, { notes: "Updated note" });
        expect(updated.notes).toBe("Updated note");
    });

    it("should delete a user", async () => {
        const user = (await userService.listUsers({})) .data[0];
        await userService.deleteUser(user.id);
        
        const list = await userService.listUsers({});
        const found = list.data.find(u => u.id === user.id);
        expect(found).toBeUndefined();
    });
});
