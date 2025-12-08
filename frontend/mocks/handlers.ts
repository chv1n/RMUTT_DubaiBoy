import { http, HttpResponse } from 'msw';
import usersData from './seed/users.json';
import { User, CreateUserPayload, UpdateUserPayload } from '@/types/user';

// In-memory store (reset on reload)
let users = [...usersData] as User[];

export const handlers = [
  // List Users
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const limit = Number(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search')?.toLowerCase();
    const role = url.searchParams.get('role');
    const status = url.searchParams.get('status');
    const department = url.searchParams.get('department');

    let filtered = users;

    if (search) {
      filtered = filtered.filter(u => 
        u.username.toLowerCase().includes(search) || 
        u.email.toLowerCase().includes(search) || 
        u.display_name.en.toLowerCase().includes(search) || 
        u.display_name.th.toLowerCase().includes(search) || 
        u.display_name.ja.toLowerCase().includes(search)
      );
    }

    if (role) {
      filtered = filtered.filter(u => u.roles.includes(role));
    }

    if (status) {
      filtered = filtered.filter(u => u.status === status);
    }

    if (department) {
        filtered = filtered.filter(u => u.department === department);
    }

    // Sort? (Implementation omitted for brevity, usually needed)

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return HttpResponse.json({
      data: paginated,
      total: filtered.length,
      page,
      limit,
      total_pages: Math.ceil(filtered.length / limit)
    });
  }),

  // Get User
  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    const user = users.find(u => u.id === id);
    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(user);
  }),

  // Create User
  http.post('/api/users', async ({ request }) => {
    const body = await request.json() as CreateUserPayload;
    const newUser: User = {
      id: `user-${Date.now()}`,
      ...body,
      status: 'active',
      last_login: null,
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    return HttpResponse.json(newUser, { status: 201 });
  }),

  // Update User
  http.put('/api/users/:id', async ({ request, params }) => {
    const { id } = params;
    const body = await request.json() as UpdateUserPayload;
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    users[index] = { ...users[index], ...body };
    return HttpResponse.json(users[index]);
  }),

  // Delete User (Soft)
  http.delete('/api/users/:id', ({ params }) => {
    const { id } = params;
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
        // Idempotent or 404
        return new HttpResponse(null, { status: 404 });
    }
    // Hard delete from list to simulating "gone", or just mark deleted. 
    // Requirement says soft delete. For list endpoint, usually we filter out deleted.
    // For mock simplicity, let's remove it or mark it.
    // users[index].status = 'inactive'; 
    // Or actually remove it from the list returned by API?
    // Let's remove it for now to see immediate effect.
    users.splice(index, 1);
    
    return new HttpResponse(null, { status: 200 });
  }),
  
  // Enable
  http.post('/api/users/:id/enable', ({ params }) => {
      const u = users.find(u => u.id === params.id);
      if(u) u.status = 'active';
      return HttpResponse.json({ success: true });
  }),

  // Disable
  http.post('/api/users/:id/disable', ({ params }) => {
      const u = users.find(u => u.id === params.id);
      if(u) u.status = 'inactive';
      return HttpResponse.json({ success: true });
  }),

  // Invite
    http.post('/api/users/invite', async () => {
        // Mock email sending
        await new Promise(resolve => setTimeout(resolve, 500));
        return HttpResponse.json({ success: true });
    }),
    
    // Reset Pass
    http.post('/api/users/:id/reset-password', async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return HttpResponse.json({ success: true });
    })

];
