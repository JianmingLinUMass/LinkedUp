'use client'

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Activity = {title: string; time: string};

const currentAndFutureList: Activity[] = [
    {title: 'Morning Jog',       time: '7:00AM, 11/07'},
    {title: 'Club Meetup',       time: '4:00PM, 11/07'},
    {title: 'Music Jam Session', time: '5:30PM, 11/07'},
    {title: 'Coding Night',      time: '8:00PM, 11/07'},
    {title: 'Morning Jog',       time: '7:00AM, 11/08'},
]

const pastList: Activity[] = [
    {title: 'Morning Jog',       time: '7:00AM, 11/06'},
    {title: 'Morning Jog',       time: '7:00AM, 11/05'},
    {title: 'Morning Jog',       time: '7:00AM, 11/04'},
    {title: 'Morning Jog',       time: '7:00AM, 11/03'},
    {title: 'Morning Jog',       time: '7:00AM, 11/02'},
]

function ActivityBox({items}: {items: Activity[]}) {
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
    const [currentAndFutureListOpen, setCurrentAndFutureListOpen] = useState(true);
    const [pastListOpen, setPastListOpen] = useState(true);

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
                        <>
                        <ActivityBox items={currentAndFutureList} />
                        </>
                    )}
                </section>

                <section className='mt-4'>
                    <button onClick={() => setPastListOpen(!pastListOpen)} className='w-full flex items-center justify-between py-2 text-left cursor-pointer'>
                        <h2 className='text-lg font-bold text-black'>My Past Activities</h2>
                    </button>
                    {pastListOpen && (
                        <>
                        <ActivityBox items={pastList} />
                        </>
                    )}
                </section>
            </main>

            <footer className='text-4x1 font-bold text-sky-500 text-center mt-3 mb-2'>
                @LinkedUp
            </footer>
        </div>
    );
}
