import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
	title: String,
	location: String,
	timeAndDate: String,
	maxAttendees: Number,
	creator: String,
	participants: [String]
});
const Activity = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);

export async function GET() {
	await dbConnect();
	const activities = await Activity.find().lean();
	return NextResponse.json(activities, { status: 200 });
}

export async function POST(req: Request) {
	try {
		await dbConnect();
		const { title, location, timeAndDate, maxAttendees, creator } = await req.json();

		if (!title || !location || !timeAndDate || !maxAttendees) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		if (maxAttendees < 1) {
			return NextResponse.json({ error: 'Max attendees must be at least 1' }, { status: 400 });
		}

		const activity = await Activity.create({
			title,
			location,
			timeAndDate,
			maxAttendees,
			creator,
			participants: []
		});

		return NextResponse.json({ id: String(activity._id), ...activity.toObject() }, { status: 201 });
	} catch (err) {
		console.error('API /activity error:', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
