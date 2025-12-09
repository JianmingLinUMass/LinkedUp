import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
	email: String,
	password: String
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export async function PATCH(req: Request) {
	try {
		await dbConnect();

		const { email, username, newPassword } = await req.json();

		if (!email) {
			return NextResponse.json({ error: 'Email is required' }, { status: 400 });
		}

		const update: Record<string, unknown> = {};

		if (typeof username === 'string' && username.trim()) {
			update.username = username.trim();
		}

		if (typeof newPassword === 'string' && newPassword.trim()) {
			update.password = newPassword;
		}

		if (Object.keys(update).length === 0) {
			return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
		}

		const user = await User.findOneAndUpdate({ email }, update, { new: true });

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		return NextResponse.json({ success: true }, { status: 200 });
	} catch (err) {
		console.error('Profile update error:', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
