import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Activity from '@/models/Activity';
import type { Activity as ActivityType, Participant } from '@/schemas/ActivityRelated';

export async function GET() {
	try {
		await dbConnect();
		const docs = await Activity.find().lean();

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const activities: ActivityType[] = docs.map((doc: any) => ({
			id: String(doc._id),
			title: doc.title,
			time: doc.time,
			location: doc.location,
			creator: doc.creator as Participant,
			maxAttendees: doc.maxAttendees,
			participants: (doc.participants || []) as Participant[]
		}));

		return NextResponse.json(activities, { status: 200 });
	} catch (err) {
		console.error('Activity GET error:', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		await dbConnect();

		const body = await req.json();
		const { title, location, timeAndDate, maxAttendees, currentUserEmail } = body;

		if (!title || !location || !timeAndDate || !maxAttendees) {
			return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
		}

		if (maxAttendees <= 0) {
			return NextResponse.json({ error: 'Maximum attendees must be greater than 0' }, { status: 400 });
		}

		const creator: Participant = {
			username: currentUserEmail || 'anonymous',
			avatar: '/lemon_drink.jpeg' // placeholder avatar
		};

		const createdDoc = await Activity.create({
			title,
			location,
			time: timeAndDate, // matches your existing "7:00AM, 11/07/2025" format
			maxAttendees,
			creator,
			participants: [creator] // Creator automatically joins
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const created: any = createdDoc.toObject ? createdDoc.toObject() : createdDoc;

		const activity: ActivityType = {
			id: String(created._id),
			title: created.title,
			time: created.time,
			location: created.location,
			creator: created.creator as Participant,
			maxAttendees: created.maxAttendees,
			participants: (created.participants || []) as Participant[]
		};

		return NextResponse.json(activity, { status: 201 });
	} catch (err) {
		console.error('Activity POST error:', err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
