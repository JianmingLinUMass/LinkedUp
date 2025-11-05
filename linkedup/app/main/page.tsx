'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Activity = {title: string; time: string};

const myActivityLst: Activity[] = [
    {title: 'Morning Jog',       time: '7:00AM, 11/07'},
    {title: 'Club Meetup',       time: '4:00PM, 11/07'},
    {title: 'Music Jam Session', time: '5:30PM, 11/07'},
    {title: 'Coding Night',      time: '8:00PM, 11/07'},
]

const activityFeedsList: Activity[] = [
    {title: 'Coffee Chat',       time: '5:30PM, 11/06'},
    {title: 'Group Study',       time: '8:15PM, 11/06'},
    {title: 'Morning Frisbee',   time: '7:30AM, 11/07'},
    {title: 'Morning Jog',       time: '7:30AM, 11/07'},
    {title: 'Hiking Meetup',     time: '9:00AM, 11/07'},
]

function ListBox({items}: {items: Activity[]}) {
    return (
        <div className='rounded-md border divide-y'>
            {items.map((activity, index) => (
                <div key={index} className='flex items-center justify-between px-3 py-3 text-sm md:text-base'>
                    <span className='text-black'>{activity.title}</span>
                    <span className='text-black'>{activity.time}</span>
                </div>
            ))}
        </div>
    )
}

// Transits to another page without using the 'Link' attribute
function GoToActivityCreationPage() {
    const router = useRouter();

    return (
        <button onClick={() => router.push('/activity-creation')} 
                className='mt-4 block w-full rounded-md bg-sky-400 py-2 text-center font-semibold text-white hover:bg-sky-500 transition'>
            Post an Activity
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

    return(
        <div className='min-h-screen flex flex-col justify-center bg-white'>
            <main className='flex-grow flex items-center justify-center'>
                <div className='w-full max-w-sm rounded-2xl border bg-white p-5 shadow-sm min-h-[700px]'>
                    <header className='flex gap-5 items-center pb-4 border-b text-gray-300'>
                        {GoToProfilePage()}
                        <div>
                            <p className='text-gray-500 font-bold'>
                                Welcome back,
                            </p>
                            <p className='text-gray-500 font-bold'>
                                {username}
                            </p>
                        </div>
                    </header>

                    <section className='mt-4'>
                        <button onClick={() => setMyListOpen((e) => !e)} className='w-full flex items-center justify-between py-2 text-left'>
                            <h2 className='text-lg font-bold text-black'>My Activities</h2>
                        </button>
                        {myListOpen && (
                            <>
                            <ListBox items={myActivityLst} />
                            </>
                        )}
                    </section>

                    <section className='mt-4'>
                        <button onClick={() => setFeedListOpen((e) => !e)} className='w-full flex items-center justify-between py-2 text-left'>
                            <h2 className='text-lg font-bold text-black'>Activity Feeds</h2>
                        </button>
                        {feedListOpen && (
                            <>
                            <ListBox items={activityFeedsList} />
                            </>
                        )}
                        {GoToActivityCreationPage()}
                    </section>
                </div>
            </main>

            <footer className='text-4x1 font-bold text-sky-500 text-center mb-2'>
                @LinkedUp
            </footer>
        </div>
    );
}
