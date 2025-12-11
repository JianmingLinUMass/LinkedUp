import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
	try {
		await dbConnect();

		const { email, password } = await req.json();

		if (!email || !password) {
			return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
		}

		const user = await User.findOne({ email, password }).lean();

		if (!user) {
			return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
		}

		return NextResponse.json({ id: String(user._id), email: user.email }, { status: 200 });
	} catch (err) {
		console.error('Login error:', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
