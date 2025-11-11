import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({ email: String, password: String });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export async function POST(req: Request) {
	await dbConnect();
	const { email, password } = await req.json();

	if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

	const exists = await User.findOne({ email });
	if (exists) return NextResponse.json({ error: 'Email already exists' }, { status: 409 });

	const user = await User.create({ email, password });
	return NextResponse.json({ id: String(user._id), email: user.email }, { status: 201 });
}
