'use client'

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ActivityPanel from '@/components/ActivityPanel';
import type { Activity } from '@/schemas/ActivityRelated';
import { ActivityTable, ActivityTableWithDeleteButton } from '@/schemas/ActivityRelated';

// Mock data
const initCurrentAndFutureList: Activity[] = [
    {title: 'Morning Jog',       time: '7:00AM, 11/07/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     attendees: 0, maxAttendees: 5
    },
    {title: 'Club Meetup',       time: '4:00PM, 11/07/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     attendees: 0, maxAttendees: 5
    },
    {title: 'Music Jam Session', time: '5:30PM, 11/07/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     attendees: 0, maxAttendees: 5
    },
    {title: 'Coding Night',      time: '8:00PM, 11/07/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     attendees: 0, maxAttendees: 5
    },
    {title: 'Morning Jog',       time: '7:00AM, 11/08/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     attendees: 0, maxAttendees: 5
    },
]
// Mock data
const initPastList: Activity[] = [
    {title: 'Morning Jog',       time: '7:00AM, 11/06/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     attendees: 1, maxAttendees: 5
    },
    {title: 'Morning Jog',       time: '7:00AM, 11/05/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     attendees: 2, maxAttendees: 5
    },
    {title: 'Morning Jog',       time: '7:00AM, 11/04/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     attendees: 3, maxAttendees: 5
    },
    {title: 'Morning Jog',       time: '7:00AM, 11/03/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     attendees: 4, maxAttendees: 5
    },
    {title: 'Morning Jog',       time: '7:00AM, 11/02/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     attendees: 5, maxAttendees: 5
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
    const [confirmPanelIndex, setConfirmPanelIndex] = useState<number | null>(null);
    const [rowSelected, setRowSelected] = useState<Activity | null>(null);
    const [activityPanelOpened, setActivityPanelOpened] = useState(false);

    const onRowClick = (row: Activity) => {
        setRowSelected(row)
        setActivityPanelOpened(true);
    };

    const deleteActivityFromPastList = (index: number) => {
        setPastList((predicate) => predicate.filter((_, i) => i !== index));
    };

    const onCancelButtonClick = () => {
        setRowSelected(null)
        setActivityPanelOpened(false);
    };

    return(
        <div className='min-h-screen flex flex-col items-center bg-white'>
            <main className='w-full max-w-sm rounded-2xl border bg-white p-5 mt-4 flex flex-col'>
                    <div className='relative flex gap-5 items-center'>
                        <GoBackToMainPage/>
                        <h1 className='text-2xl font-bold text-sky-500 mx-auto'>
                            Activity History
                        </h1>
                    </div>

                <section className='mt-4'>
                    <button onClick={() => setCurrentAndFutureListOpen(!currentAndFutureListOpen)} className='w-full flex items-center justify-between py-2 text-left cursor-pointer'>
                        <h2 className='text-lg font-bold text-black'>My Current & Future Activities</h2>
                    </button>
                    {currentAndFutureListOpen && (
                        <ActivityTable items={currentAndFutureList} onRowClick={onRowClick}/>
                    )}
                </section>

                <section className='mt-4'>
                    <button onClick={() => setPastListOpen(!pastListOpen)} className='w-full flex items-center justify-between py-2 text-left cursor-pointer'>
                        <h2 className='text-lg font-bold text-black'>My Past Activities</h2>
                    </button>
                    {pastListOpen && (
                        <ActivityTableWithDeleteButton items={pastList} onRowClick={onRowClick} onRequestDelete={(index) => {
                            setConfirmPanelIndex(index);
                        }}/>
                    )}
                </section>

                <section>
                    {confirmPanelIndex != null && (
                        <ConfirmPanel
                            onCancel={() => {
                                setConfirmPanelIndex(null);
                            }}
                            onConfirm={() => {
                                deleteActivityFromPastList(confirmPanelIndex);
                                setConfirmPanelIndex(null);
                            }}
                        />
                    )}
                </section>

                <section className='mt-4'>
                    {activityPanelOpened && rowSelected && (
                        <ActivityPanel activity={rowSelected} onCancel={onCancelButtonClick}/>
                    )}
                </section>
            </main>

            <footer className='text-4x1 font-bold text-sky-500 text-center mt-3 mb-2'>
                @LinkedUp
            </footer>
        </div>
    );
}
