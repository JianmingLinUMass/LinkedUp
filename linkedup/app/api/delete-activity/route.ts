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

		const { activityId, userEmail } = await req.json();

		if (!activityId || !userEmail) {
			return NextResponse.json({ error: 'Activity ID and User Email required' }, { status: 400 });
		}

		const activity = await Activity.findById(activityId);

		if (!activity) {
			return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
		}

		// Check if user is the creator
		if (activity.creator.username !== userEmail) {
			return NextResponse.json({ error: 'Only creator can delete activity' }, { status: 403 });
		}

		await Activity.findByIdAndDelete(activityId);

		return NextResponse.json({ success: true }, { status: 200 });
	} catch (err) {
		console.error('Delete activity error:', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}