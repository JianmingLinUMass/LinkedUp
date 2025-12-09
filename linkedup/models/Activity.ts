import mongoose from 'mongoose';

const ParticipantSchema = new mongoose.Schema(
	{
		username: String,
		avatar: String
	},
	{ _id: false }
);

const ActivitySchema = new mongoose.Schema({
	title: String,
	time: String,
	location: String,
	creator: ParticipantSchema,
	maxAttendees: Number,
	participants: [ParticipantSchema]
});

const Activity = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);

export default Activity;
