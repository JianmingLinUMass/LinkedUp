'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import CalendarTimeline from '@/components/CalendarTimeline';
import ActivityPanel from '@/components/ActivityPanel';
import GoToTopButton from '@/components/GoToTopButton';
import type { Activity } from '@/schemas/ActivityRelated';
import { ActivityTable } from '@/schemas/ActivityRelated';

// Mock data
const myActivityLst: Activity[] = [
    {id: uuidv4(), title: 'Morning Jog', time: '7:00AM, 11/07/2025', 
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     maxAttendees: 5, participants: []
    },
    {id: uuidv4(), title: 'Club Meetup', time: '4:00PM, 11/08/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     maxAttendees: 5, participants: []
    },
    {id: uuidv4(), title: 'Music Jam Session', time: '5:30PM, 11/09/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     maxAttendees: 5, participants: []
    },
    {id: uuidv4(), title: 'Coding Night', time: '8:00PM, 11/10/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     maxAttendees: 5, participants: []
    },
    // duplicated data below is used for testing the 'GoToTopButton'
    {id: uuidv4(), title: 'Morning Jog', time: '7:00AM, 11/07/2025', 
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     maxAttendees: 5, participants: []
    },
    {id: uuidv4(), title: 'Club Meetup', time: '4:00PM, 11/08/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     maxAttendees: 5, participants: []
    },
    {id: uuidv4(), title: 'Music Jam Session', time: '5:30PM, 11/09/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     maxAttendees: 5, participants: []
    },
    {id: uuidv4(), title: 'Coding Night', time: '8:00PM, 11/10/2025',
     location: 'Amherst', creator: {username: 'user123', avatar: '/lemon_drink.jpeg'},
     maxAttendees: 5, participants: []
    },
]
// Mock data
const activityFeedsList: Activity[] = [
    {id: uuidv4(), title: 'Coffee Chat', time: '5:30PM, 11/06/2025',
     location: 'Amherst', creator: {username: 'user4', avatar: '/orange_tart.jpg'},
     maxAttendees: 5, participants: []
    },
    {id: uuidv4(), title: 'Group Study', time: '8:15PM, 11/06/2025',
     location: 'Amherst', creator: {username: 'user5', avatar: '/orange_tart.jpg'},
     maxAttendees: 5, participants: []
    },
    {id: uuidv4(), title: 'Morning Frisbee', time: '7:30AM, 11/07/2025',
     location: 'Amherst', creator: {username: 'user6', avatar: '/orange_tart.jpg'},
     maxAttendees: 5, participants: []
    },
    {id: uuidv4(), title: 'Hiking Meetup', time: '9:00AM, 11/07/2025',
     location: 'Amherst', creator: {username: 'user7', avatar: '/orange_tart.jpg'},
     maxAttendees: 5, participants: []
    },
]

// Transits to another page without using the 'Link' attribute
function GoToActivityCreationPage() {
    const router = useRouter();

    return (
        <button onClick={() => router.push('/activity-creation')} 
                className='mt-4 block w-full rounded-md bg-sky-400 py-2 text-center font-semibold text-white hover:bg-sky-500 transition cursor-pointer'>
            Post an Activity
        </button>
    );
}
function GoToActivityHistoryPage() {
    const router = useRouter();

    return (
        <button onClick={() => router.push('/activity-history')} 
                className='mt-4 block w-full rounded-md bg-sky-400 py-2 text-center font-semibold text-white ≈ transition cursor-pointer'>
            Activity History
        </button>
    );
}
function GoToProfilePage() {
    const router = useRouter();

    return (
        <div onClick={() => router.push('/profile')} 
             className='h-12 w-12 rounded-full overflow-hidden border cursor-pointer'>
            <Image src='/lemon_drink.jpeg' alt='User Profile Picture' width={48} height={48} className='object-cover'/>
        </div>
    )
}

export default function MainPage() {
    const username = 'user123';

    const [myListOpen, setMyListOpen] = useState(true);
    const [feedListOpen, setFeedListOpen] = useState(true);

    const [showCalendarMyList, setShowCalendarMyList] = useState(false);
    const [showCalendarFeedList, setShowCalendarFeedList] = useState(false);

    const [rowSelected, setRowSelected] = useState<Activity | null>(null);
    const [activityPanelOpened, setActivityPanelOpened] = useState(false);

    const onRowClick = (row: Activity) => {
        setRowSelected(row)
        setActivityPanelOpened(true);
    };

    const onCancelButtonClick = () => {
        setRowSelected(null)
        setActivityPanelOpened(false);
    };

    // Backend logic needed for the 'Join' button
    const onJoinButtonClick = () => {
        console.log('Joined activity: ', rowSelected);
    }

    return(
        <div className='min-h-screen flex flex-col bg-white px-4 py-4'>
            <main className='flex-grow flex justify-center'>
                <div className='w-full max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-6xl rounded-2xl border bg-white p-4 md:p-8 shadow-sm min-h-[600px] md:min-h-[700px]'>
                    <header className='flex gap-5 items-center justify-between pb-4 border-b text-gray-300'>
                        <div className='flex gap-5 items-center'>
                            <GoToProfilePage/>
                            <div>
                                <p className='text-gray-500 font-bold'>
                                    Welcome back,
                                </p>
                                <p className='text-gray-500 font-bold'>
                                    {username}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                localStorage.removeItem('isLoggedIn');
                                window.location.href = '/';
                            }}
                            className='text-sm text-gray-500 hover:text-gray-800 bg-red-300 font-bold border border-gray-300 rounded px-2 py-1 cursor-pointer'
                        >
                            Logout
                        </button>
                    </header>
                    
                    <section className='mt-4'>
                        <div className='flex items-center justify-between py-2'>
                            <button onClick={() => setMyListOpen(!myListOpen)} className='text-left cursor-pointer'>
                                <h2 className='text-lg font-bold text-black'>My Activities</h2>
                            </button>
                            <button 
                                onClick={() => setShowCalendarMyList(!showCalendarMyList)}
                                className={`w-20 px-3 py-1 rounded-md text-sm font-medium transition cursor-pointer ${
                                    showCalendarMyList 
                                        ? 'bg-gray-200 text-gray-600 hover:bg-gray-200'
                                        : 'bg-sky-400 text-white' 
                                }`}
                            >
                                {showCalendarMyList ? 'List' : 'Calendar'}
                            </button>
                        </div>
                        {showCalendarMyList ? (
                            <CalendarTimeline activities={myActivityLst} />
                        ) : (
                            myListOpen && (
                                <div className={'rounded-md border'}>
                                    <ActivityTable items={myActivityLst} onRowClick={onRowClick}/>
                                </div>
                            )
                        )}
                        <GoToActivityHistoryPage/>
                    </section>

                    <section className='mt-4'>
                        <div className='flex items-center justify-between py-2'>
                            <button onClick={() => setFeedListOpen(!feedListOpen)} className='text-left cursor-pointer'>
                                <h2 className='text-lg font-bold text-black'>Activity Feeds</h2>
                            </button>
                            <button 
                                onClick={() => setShowCalendarFeedList(!showCalendarFeedList)}
                                className={`w-20 px-3 py-1 rounded-md text-sm font-medium transition cursor-pointer ${
                                    showCalendarFeedList 
                                        ? 'bg-gray-200 text-gray-600 hover:bg-gray-200'
                                        : 'bg-sky-400 text-white' 
                                }`}
                                >
                                    {showCalendarFeedList ? 'List' : 'Calendar'}
                            </button>
                        </div>
                        {showCalendarFeedList ? (
                            <CalendarTimeline activities={activityFeedsList} />
                        ) : (
                            feedListOpen && <ActivityTable items={activityFeedsList} onRowClick={onRowClick}/>
                        )}
                        <GoToActivityCreationPage/>
                    </section>

                    <section className='mt-4'>
                        {activityPanelOpened && rowSelected && (
                            <ActivityPanel activity={rowSelected} onCancel={onCancelButtonClick} onJoin={onJoinButtonClick} />
                        )}
                    </section>
                </div>
            </main>

            <GoToTopButton />

            <footer className='text-4x1 font-bold text-sky-500 text-center mb-2'>
                @LinkedUp
            </footer>
        </div>
    );
}
