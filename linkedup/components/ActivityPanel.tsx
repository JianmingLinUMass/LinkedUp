'use client'

import Image from 'next/image';
import type { ActivityPanelArgs } from '@/schemas/ActivityRelated';

// Tapping on an activity on the activity table opens up a panel, which contains the following content:
/* 
   1. Activity Creator username and avatar
   2. Activity Title, Location, Date and Time (not using Calendar), Max Attendees (current / max)
   3. A 'join' button and a 'cancel' button
*/ 
export default function ActivityPanel({activity, onCancel, onJoin, onLeave, isJoined}: ActivityPanelArgs) {
    return (
        <div className='fixed inset-0 bg-black/30 flex items-center justify-center'>
            <div className='bg-white p-5 rounded-xl border w-80 text-center'>
                <h2 className='mb-4 text-lg font-bold text-sky-400'>
                    Activity Details
                </h2>

                {/* Creator Information */}
                <div className='mb-2 flex items-center justify-between'>
                    <span className='font-bold text-black'>Activity Creator:</span>
                    <div className='flex items-center gap-1'>
                        <span className='font-bold text-gray-500'>{activity.creator.username}</span>
                        <Image src={activity.creator.avatar} alt='User Profile Picture' 
                               width={36} height={36} className='object-cover rounded-full border border-gray-300'/>
                    </div>
                </div>

                {/* Activity Information */}
                <div className='space-y-2'>
                    <div className='flex justify-between'>
                        <span className='font-bold text-black'>Title: </span>
                        <span className='font-bold text-sky-500'>{activity.title}</span>
                    </div>

                    <div className='flex justify-between'>
                        <span className='font-bold text-black'>Location: </span>
                        <span className='font-bold text-sky-500'>{activity.location}</span>
                    </div>

                    <div className='flex justify-between'>
                        <span className='font-bold text-black'>Time: </span>
                        <span className='font-bold text-sky-500'>{activity.time}</span>
                    </div>

                    <div className='flex justify-between items-center'>
                        <div className='flex items-center gap-2'>
                            <span className='font-bold text-black'>Attendees: </span>
                            <span className='font-bold text-sky-500 w-10 text-left ml-4'>
                                {activity.participants.length}/{activity.maxAttendees}
                            </span>
                        </div>

                        <div className='flex items-center gap-4'>
                            <div className='flex -space-x-3'>
                                {/* Show the avatars of the first 4 participants */}
                                {activity.participants.slice(0, 4).map((participant, index) => (
                                    <Image key={index} src={participant.avatar} alt={participant.username}
                                        width={36} height={36} className='object-cover rounded-full border border-gray-300'
                                    />
                                ))}
                                
                                {/* Show the the rest of the participants as a '+' symbol */}
                                {activity.participants.length > 4 && (
                                    <div className='flex w-9 h-9 text-sm text-gray-600 font-bold items-center justify-center rounded-full border border-gray-300'>
                                        +{activity.participants.length - 4}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Join/Leave and Cancel Buttons */}
                <div className='mt-4 flex justify-center gap-10'>
                    {isJoined ? (
                        onLeave && (
                            <button onClick={() => onLeave?.(activity)} className='px-2 py-1 text-white font-semibold bg-red-500 border rounded hover:bg-red-600 cursor-pointer'>
                                Leave
                            </button>
                        )
                    ) : (
                        onJoin && (
                            <button onClick={() => onJoin?.(activity)} className='px-2 py-1 text-black font-semibold border rounded hover:bg-sky-300 cursor-pointer'>
                                Join
                            </button>
                        )
                    )}
                    <button onClick={onCancel} className='px-2 py-1 text-black font-semibold border rounded hover:bg-gray-300 cursor-pointer'>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}