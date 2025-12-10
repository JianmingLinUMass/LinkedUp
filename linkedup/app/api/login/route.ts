import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
	email: String,
	password: String
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export async function POST(req: Request) {
	try {
		await dbConnect();
		const { email, password } = await req.json();

		if (!email || !password) {
			return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
		}

		const user = await User.findOne({ email });
		if (!user) {
			return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
		}

		if (user.password !== password) {
			return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
		}

		return NextResponse.json({ id: String(user._id), email: user.email }, { status: 200 });
	} catch (err) {
		console.error('API /login error:', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
