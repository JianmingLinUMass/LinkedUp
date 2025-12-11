import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Activity from '@/models/Activity';
import mongoose from 'mongoose';

export async function POST(req: Request) {
	try {
		await dbConnect();

		const { activityId, userEmail } = await req.json();

		if (!activityId || !userEmail) {
			return NextResponse.json({ error: 'Activity ID and User Email required' }, { status: 400 });
		}

		// Validate ObjectId format
		if (!mongoose.Types.ObjectId.isValid(activityId)) {
			return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
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

		return NextResponse.json({ success: true, message: 'Successfully joined activity', activity }, { status: 200 });
	} catch (err) {
		console.error('Join activity error:', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
