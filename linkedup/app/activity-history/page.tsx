'use client'

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import CalendarTimeline from '@/components/CalendarTimeline';
import ActivityPanel from '@/components/ActivityPanel';
import GoToTopButton from '@/components/GoToTopButton'
import type { Activity } from '@/schemas/ActivityRelated';
import { ActivityTable, ActivityTableWithDeleteButton } from '@/schemas/ActivityRelated';

// Mock data
const initCurrentAndFutureList: Activity[] = [
    {id: uuidv4(), title: 'Morning Jog',       time: '7:00AM, 11/07/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     maxAttendees: 5, participants: []
    },
    {id: uuidv4(), title: 'Club Meetup',       time: '4:00PM, 11/07/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     maxAttendees: 5, participants: []
    },
    {id: uuidv4(), title: 'Music Jam Session', time: '5:30PM, 11/07/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     maxAttendees: 5, participants: []
    },
    {id: uuidv4(), title: 'Coding Night',      time: '8:00PM, 11/07/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     maxAttendees: 5, participants: []
    },
    {id: uuidv4(), title: 'Morning Jog',       time: '7:00AM, 11/08/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     maxAttendees: 5, participants: []
    },
]
// Mock data
const initPastList: Activity[] = [
    {id: uuidv4(), title: 'Morning Jog',       time: '7:00AM, 11/06/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     maxAttendees: 5, 
     participants: [
        {username: 'user001', avatar: '/lemon_drink.jpeg'}
     ]
    },
    {id: uuidv4(), title: 'Morning Jog',       time: '7:00AM, 11/05/2023',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     maxAttendees: 5, 
     participants: [
        {username: 'user001', avatar: '/lemon_drink.jpeg'},
        {username: 'user002', avatar: '/lemon_drink.jpeg'}
     ]
    },
    {id: uuidv4(), title: 'Morning Jog',       time: '7:00AM, 11/04/2024',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     maxAttendees: 5, 
     participants: [
        {username: 'user001', avatar: '/lemon_drink.jpeg'},
        {username: 'user002', avatar: '/lemon_drink.jpeg'},
        {username: 'user003', avatar: '/lemon_drink.jpeg'}
     ]
    },
    {id: uuidv4(), title: 'Morning Jog',       time: '7:00AM, 11/03/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     maxAttendees: 5, 
     participants: [
        {username: 'user001', avatar: '/lemon_drink.jpeg'},
        {username: 'user002', avatar: '/lemon_drink.jpeg'},
        {username: 'user003', avatar: '/lemon_drink.jpeg'},
        {username: 'user004', avatar: '/lemon_drink.jpeg'}
     ]
    },
    {id: uuidv4(), title: 'Morning Jog',       time: '7:00AM, 11/02/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     maxAttendees: 5,
     participants: [
        {username: 'user001', avatar: '/lemon_drink.jpeg'},
        {username: 'user002', avatar: '/lemon_drink.jpeg'},
        {username: 'user003', avatar: '/lemon_drink.jpeg'},
        {username: 'user004', avatar: '/lemon_drink.jpeg'},
        {username: 'user005', avatar: '/lemon_drink.jpeg'}
     ]
    },
    // duplicated data below is used for testing the 'GoToTopButton'
    {id: uuidv4(), title: 'Morning Jog',       time: '7:00AM, 11/04/2024',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     maxAttendees: 5,      
     participants: [
        {username: 'user001', avatar: '/lemon_drink.jpeg'},
        {username: 'user002', avatar: '/lemon_drink.jpeg'},
        {username: 'user003', avatar: '/lemon_drink.jpeg'}
     ]
    },
    {id: uuidv4(), title: 'Morning Jog',       time: '7:00AM, 11/03/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     maxAttendees: 5,      
     participants: [
        {username: 'user001', avatar: '/lemon_drink.jpeg'},
        {username: 'user002', avatar: '/lemon_drink.jpeg'},
        {username: 'user003', avatar: '/lemon_drink.jpeg'},
        {username: 'user004', avatar: '/lemon_drink.jpeg'}
     ]
    },
    {id: uuidv4(), title: 'Morning Jog',       time: '7:00AM, 11/02/2026',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     maxAttendees: 6, 
     participants: [
        {username: 'user001', avatar: '/lemon_drink.jpeg'},
        {username: 'user002', avatar: '/lemon_drink.jpeg'},
        {username: 'user003', avatar: '/lemon_drink.jpeg'},
        {username: 'user004', avatar: '/lemon_drink.jpeg'},
        {username: 'user005', avatar: '/lemon_drink.jpeg'},
        {username: 'user006', avatar: '/lemon_drink.jpeg'}
     ]
    },
]

function ConfirmPanel({onCancel, onConfirm}: {onCancel: () => void; onConfirm: () => void}) {
    return (
        <div className='fixed inset-0 bg-black/30 flex items-center justify-center'>
            <div className='bg-white p-5 rounded-xl border w-60 text-center'>
                <h2 className='text-lg font-bold text-black'>
                    Deletion Confirmation
                    </h2>
                <p className='mt-2 text-sm text-black'>
                    This action cannot be undone.
                    </p>
                <div className='mt-4 flex justify-between'>
                    <button onClick={onConfirm} className='ml-3 px-2 py-1 text-black font-semibold border rounded hover:bg-sky-300'>
                        Delete
                    </button>
                    <button onClick={onCancel} className='mr-3 px-2 py-1 text-black font-semibold border rounded hover:bg-gray-300'>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

function GoBackToMainPage() {
    const router = useRouter();

    return (
        <button onClick={() => router.push('/main')} 
                className='absolute left-0 text-4xl text-black font-bold cursor-pointer'>
            ←
        </button>
    );
}

export default function ActivityHistoryPage() {
    // setCurrentAndFutureList is not used as currentAndFutureList should not be modified with the delete activity buttons
    const [currentAndFutureList, setCurrentAndFutureList] = useState(initCurrentAndFutureList);
    const [pastList, setPastList] = useState(initPastList);

    const [currentAndFutureListOpen, setCurrentAndFutureListOpen] = useState(true);
    const [pastListOpen, setPastListOpen] = useState(true);

    const [showCalendarCurrentAndFutureList, setShowCalendarCurrentAndFutureList] = useState(false);
    const [showCalendarPastList, setShowCalendarPastList] = useState(false);

    const [confirmPanelId, setConfirmPanelId] = useState<string | null>(null);
    const [rowSelected, setRowSelected] = useState<Activity | null>(null);
    const [activityPanelOpened, setActivityPanelOpened] = useState(false);

    const onRowClick = (row: Activity) => {
        setRowSelected(row)
        setActivityPanelOpened(true);
    };

    const deleteActivityFromPastList = (id: string) => {
        setPastList(prev => prev.filter(activity => activity.id !== id));
    };

    const onCancelButtonClick = () => {
        setRowSelected(null)
        setActivityPanelOpened(false);
    };

    return(
        <div className='min-h-screen flex flex-col bg-white px-4 py-4'>
            <main className='flex-grow flex justify-center'>
                <div className='w-full max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-6xl rounded-2xl border bg-white p-4 md:p-8 shadow-sm min-h-[600px] md:min-h-[700px]'>
                    <div className='relative flex gap-5 items-center'>
                        <GoBackToMainPage/>
                        <h1 className='text-2xl font-bold text-sky-500 mx-auto'>
                            Activity History
                        </h1>
                    </div>

                    <section className='mt-4'>
                        <div className='flex items-center justify-between py-2'>
                            <button onClick={() => setCurrentAndFutureListOpen(!currentAndFutureListOpen)} className='text-left cursor-pointer'>
                                <h2 className='text-lg font-bold text-black'>My Current & Future Activities</h2>
                            </button>
                            <button 
                                onClick={() => setShowCalendarCurrentAndFutureList(!showCalendarCurrentAndFutureList)}
                                className={`w-20 px-3 py-1 rounded-md text-sm font-medium transition cursor-pointer ${
                                    showCalendarCurrentAndFutureList 
                                        ? 'bg-gray-200 text-gray-600 hover:bg-gray-200'
                                        : 'bg-sky-400 text-white' 
                                }`}
                            >
                                {showCalendarCurrentAndFutureList ? 'List' : 'Calendar'}
                            </button>
                        </div>

                        {showCalendarCurrentAndFutureList ? (
                            <CalendarTimeline activities={currentAndFutureList} />
                        ) : (
                            currentAndFutureListOpen && (
                                <div className={'rounded-md border'}>
                                    <ActivityTable items={currentAndFutureList} onRowClick={onRowClick}/>
                                </div>
                            )
                        )}
                    </section>

                    <section className='mt-4'>
                        <div className='flex items-center justify-between py-2'>
                            <button onClick={() => setPastListOpen(!pastListOpen)} className='text-left cursor-pointer'>
                                <h2 className='text-lg font-bold text-black'>My Past Activities</h2>
                            </button>
                            <button 
                                onClick={() => setShowCalendarPastList(!showCalendarPastList)}
                                className={`w-20 px-3 py-1 rounded-md text-sm font-medium transition cursor-pointer ${
                                    showCalendarPastList 
                                        ? 'bg-gray-200 text-gray-600 hover:bg-gray-200'
                                        : 'bg-sky-400 text-white' 
                                }`}
                            >
                                {showCalendarPastList ? 'List' : 'Calendar'}
                            </button>
                        </div>


                        {showCalendarPastList ? (
                            <CalendarTimeline activities={pastList} />
                        ) : (
                            pastListOpen && (
                                <div className={'rounded-md border'}>
                                    <ActivityTableWithDeleteButton items={pastList} onRowClick={onRowClick} onRequestDelete={(id) => {
                                setConfirmPanelId(id);
                            }}/>
                                </div>
                            )
                        )}
                    </section>

                    <section>
                        {confirmPanelId != null && (
                            <ConfirmPanel
                                onCancel={() => setConfirmPanelId(null)}
                                onConfirm={() => {
                                    deleteActivityFromPastList(confirmPanelId);
                                    setConfirmPanelId(null);
                                }}
                            />
                        )}
                    </section>

                    <section className='mt-4'>
                        {activityPanelOpened && rowSelected && (
                            <ActivityPanel activity={rowSelected} onCancel={onCancelButtonClick}/>
                        )}
                    </section>
                </div>
            </main>

            <GoToTopButton />

            <footer className='text-4x1 font-bold text-sky-500 text-center mt-3 mb-2'>
                @LinkedUp
            </footer>
        </div>
    );
}
