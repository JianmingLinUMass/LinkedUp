'use client'

import type { ActivityPanelArgs } from '@/schemas/ActivityRelated';

// Tapping on an activity on the activity table opens up a panel, which contains the following content:
/* 
   1. Activity Creator username and avatar
   2. Activity Title, Location, Date and Time (not using Calendar), Max Attendees (current / max)
   3. A 'join' button and a 'cancel' button
*/ 
export default function ActivityPanel({activity, onCancel, onJoin}: ActivityPanelArgs) {
    return (
        <div className='fixed inset-0 bg-black/30 flex items-center justify-center'>
            <div className='bg-white p-5 rounded-xl border w-60 text-center'>
                <h2 className='text-lg font-bold text-black'>
                    Activity Details
                </h2>

                {/* Creator Information */}
                <div className='flex items-center'>
                    <div>
                        <p className='font-bold text-black'>Activity Creator: </p>
                        {/* Add creator avatar here later */}
                        <p className='font-bold text-black'>{activity.creator.username}</p>
                    </div>
                </div>

                {/* Activity Information */}
                <div className='flex items-center'>
                    <div className='text-left'>
                        <p className='font-bold text-black'>{activity.title}</p>
                        <p className='font-bold text-black'>Location: {activity.location}</p>
                        <p className='font-bold text-black'>Time: {activity.time}</p>
                        <p className='font-bold text-black'>Title: {activity.title}</p>
                        <p className='font-bold text-black'>Attendees: {activity.attendees} / {activity.maxAttendees}</p>
                    </div>
                </div>

                {/* Join and Cancel Buttons */}
                <div className='mt-4 flex justify-between'>
                    <button onClick={() => onJoin(activity)} className='ml-3 px-2 py-1 text-black font-semibold border rounded hover:bg-sky-400'>
                        Join
                    </button>
                    <button onClick={onCancel} className='mr-3 px-2 py-1 text-black font-semibold border rounded hover:bg-gray-400'>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}