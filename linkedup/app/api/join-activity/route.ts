import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
	title: String,
	time: String,
	location: String,
	creator: Object,
	maxAttendees: Number,
	participants: Array
});

const Activity = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);

export async function POST(req: Request) {
	try {
		await dbConnect();

		const { activityId, userId, userEmail } = await req.json();

		if (!activityId || !userId) {
			return NextResponse.json({ error: 'Activity ID and User ID required' }, { status: 400 });
		}

		const activity = await Activity.findById(activityId);

		if (!activity) {
			return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
		}

		// Check if already joined
		const alreadyJoined = activity.participants.some((p: any) => p.username === userEmail);
		if (alreadyJoined) {
			return NextResponse.json({ error: 'Already joined this activity' }, { status: 400 });
		}

		// Check if activity is full
		if (activity.participants.length >= activity.maxAttendees) {
			return NextResponse.json({ error: 'Activity is full' }, { status: 400 });
		}

		// Add participant
		activity.participants.push({
			username: userEmail,
			avatar: '/lemon_drink.jpeg'
		});

		await activity.save();

		return NextResponse.json({ success: true, activity }, { status: 200 });
	} catch (err) {
		console.error('Join activity error:', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
