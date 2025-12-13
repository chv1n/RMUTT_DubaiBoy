import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;

    const protectedPaths = [
        '/super-admin',
        '/admin',
        '/user',
        '/inventory-manager',
        '/prouction-manager', // Typo match
        '/purchase-maneger'   // Typo match
    ];

    const isProtectedPath = protectedPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    );

    // If trying to access protected routes without token
    if (isProtectedPath && !token) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        // Redirect to login (which is at /login now)
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/super-admin/:path*',
        '/admin/:path*',
        '/user/:path*',
        '/inventory-manager/:path*',
        '/prouction-manager/:path*',
        '/purchase-maneger/:path*',
    ],
};
