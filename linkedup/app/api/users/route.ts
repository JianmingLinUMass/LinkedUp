import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
	await dbConnect();
	const users = await User.find().select('_id email').lean();
	return NextResponse.json(users, { status: 200 });
}

export async function POST(req: Request) {
	try {
		await dbConnect();
		const { email, password } = await req.json();

		if (!email || !password) {
			return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
		}

		const exists = await User.findOne({ email });
		if (exists) {
			return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
		}

		const user = await User.create({ email, password });
		return NextResponse.json({ id: String(user._id), email: user.email }, { status: 201 });
	} catch (err) {
		console.error('API /users error:', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
