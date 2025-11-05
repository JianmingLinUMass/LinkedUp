'use client'

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

type ActivityFields = {
    title: string;
    location: string;
    time: string;
    date: string;
    maxAttendees: number;
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

export default function ActivityCreationPage() {
    const { register, handleSubmit, reset } = useForm<ActivityFields>();

    const OnPostActivityFormSubmission = (data: ActivityFields) => {
        console.log('Received user input:', data)
        reset();
    }

    return(
        <div className='min-h-screen flex flex-col justify-center items-center bg-white'>
            <main className='w-full max-w-sm rounded-2xl border bg-white p-5 mt-4 flex flex-col'>
                <div className='relative flex items-center mb-4'>
                    <GoBackToMainPage/>
                    <h1 className='text-2xl font-bold text-sky-500 mx-auto'>
                        Activity Information
                    </h1>
                </div>

                <form onSubmit={handleSubmit(OnPostActivityFormSubmission)}
                      className='w-full max-w-md  bg-white rounded-x1 p-6 space-y-4'>
                    <div>
                        <label className='block font-bold text-black mb-1'>
                            Activity Title
                        </label>
                        <input {...register('title')} placeholder='' className='w-full border rounded-md border-gray-200 text-black rounded-1g p-2 focus:outline-none focus:ring-2 focus:ring-sky-300'/>
                    </div>

                    <div>
                        <label className='block font-bold text-black mb-1'>
                            Location
                        </label>
                        <input {...register('location')} placeholder='' className='w-full border rounded-md border-gray-200 text-black rounded-1g p-2 focus:outline-none focus:ring-2 focus:ring-sky-300'/>
                    </div>

                    <div>
                        <label className='block font-bold text-black mb-1'>
                            Date & Time
                        </label>
                        <div className="flex gap-2">
                            <input {...register('time')} placeholder='' className='w-3/5 border rounded-md border-gray-200 text-black rounded-1g p-2 focus:outline-none focus:ring-2 focus:ring-sky-300'/>
                            <input {...register('date')} placeholder='' className='w-2/5 border rounded-md border-gray-200 text-black rounded-1g p-2 focus:outline-none focus:ring-2 focus:ring-sky-300'/>
                        </div>
                    </div>

                    <div>
                        <label className='block font-bold text-black mb-1'>
                            Max Attendees
                        </label>
                        <input {...register('maxAttendees')} placeholder='' className='w-full border rounded-md border-gray-200 text-black rounded-1g p-2 focus:outline-none focus:ring-2 focus:ring-sky-300'/>
                    </div>   

                    <div>
                        <button type='submit' className='w-full py-2 rounded-md bg-sky-400 text-white font-semibold hover:bg-sky-500 mb-3'>
                            Post Activity
                        </button>     
                    </div> 
                </form>
            </main>

            <footer className='text-4x1 font-bold text-sky-500 text-center mt-3 mb-2'>
                @LinkedUp
            </footer>
        </div>
    );
}