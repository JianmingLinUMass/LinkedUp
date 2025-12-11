import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Activity from '@/models/Activity';

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

		// Remove participant
		activity.participants = activity.participants.filter((p: any) => p.username !== userEmail);

		await activity.save();

		return NextResponse.json({ success: true, message: 'Successfully left activity', activity }, { status: 200 });
	} catch (err) {
		console.error('Leave activity error:', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
