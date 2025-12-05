'use client'

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import type { ActivityCreationFields } from '@/schemas/ActivityRelated';

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
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ActivityCreationFields>({
        mode: 'onSubmit',
        reValidateMode: 'onSubmit'
    });

    // Receives user input here, in data
    const OnPostActivityFormSubmission = (data: ActivityCreationFields) => {
        console.log('Received user input:', data)
        reset();
    }

    // return true if timeAndDateValue is a future time 
    const validateTimeAndDate = (timeAndDateValue: string) => {
        const match = timeAndDateValue.match(/^(\d{1,2}):(\d{2})(AM|PM), (\d{2})\/(\d{2})\/(\d{4})$/i);
        if (!match) return true;

        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const period = match[3];
        const month = parseInt(match[4]) - 1;
        const day = parseInt(match[5]);
        const year = parseInt(match[6]);
        
        if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
        if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
        
        const inputDate = new Date(year, month, day, hours, minutes)
        if (inputDate < new Date()) {
            return 'Invalid input: cannot input a past time.';
        }
        return true;
    };

    return(
        <div className='min-h-screen flex flex-col justify-center items-center bg-white px-4 py-4'>
            <main className='w-full max-w-sm md:max-w-md lg:max-w-lg rounded-2xl border bg-white p-4 md:p-6 mt-4 flex flex-col'>
                <div className='relative flex items-center mb-4'>
                    <GoBackToMainPage/>
                    <h1 className='text-xl md:text-2xl font-bold text-sky-500 mx-auto'>
                        Activity Information
                    </h1>
                </div>

                <form onSubmit={handleSubmit(OnPostActivityFormSubmission)}
                      className='w-full max-w-md  bg-white rounded-x1 p-6 space-y-4'>
                    <div>
                        <label className='block font-bold text-black mb-1'>
                            Activity Title
                        </label>
                        <input {...register('title', {required: 'Title is required for posting an activity.'})} 
                               placeholder='' className='w-full border rounded-md border-gray-200 text-black rounded-1g p-2 focus:outline-none focus:ring-2 focus:ring-sky-300'/>
                        {errors.title && 
                            <span className='text-sm text-red-400'>
                                {errors.title.message}
                            </span>
                        }
                    </div>

                    <div>
                        <label className='block font-bold text-black mb-1'>
                            Location
                        </label>
                        <input {...register('location', {required: 'Location is required for posting an activity.'})}
                               placeholder='' className='w-full border rounded-md border-gray-200 text-black rounded-1g p-2 focus:outline-none focus:ring-2 focus:ring-sky-300'/>
                        {errors.location && 
                            <span className='text-sm text-red-400'>
                                {errors.location.message}
                            </span>
                        }
                    </div>

                    <div>
                        <label className='block font-bold text-black mb-1'>
                            Date & Time
                        </label>
                        <div className='flex flex-col'>
                            <input {...register('timeAndDate', {
                                required: 'Time and Date is required for posting an activity.',
                                pattern: {
                                    value: /^[0-9]{1,2}:[0-9]{2}(AM|PM), [0-9]{2}\/[0-9]{2}\/[0-9]{4}$/i,
                                    message: 'Invalid format.'
                                },
                                validate: (value: string) => {
                                    return validateTimeAndDate(value);
                                }
                            })} placeholder='' className='w-full border rounded-md border-gray-200 text-black rounded-1g p-2 focus:outline-none focus:ring-2 focus:ring-sky-300'/>
                        </div>
                        <span className='block text-sm text-gray-600'>
                            Please enter the time and date in this format: 00:00AM, MM/DD/YYYY
                        </span>
                        {errors.timeAndDate && 
                            <span className='block text-sm text-red-400'>
                                {errors.timeAndDate.message}
                            </span>
                        }
                    </div>

                    <div>
                        <label className='block font-bold text-black mb-1'>
                            Max Attendees
                        </label>
                        <input type='number' {...register('maxAttendees', {
                            required: 'Max attendees is required for posting an activity.',
                            min: {value: 1, message: 'Must be at least 1 attendee.'}
                        })} placeholder='' className='w-full border rounded-md border-gray-200 text-black rounded-1g p-2 focus:outline-none focus:ring-2 focus:ring-sky-300'/>
                        {errors.maxAttendees && 
                            <span className='text-sm text-red-400'>
                                {errors.maxAttendees.message}
                            </span>
                        }
                    </div>   

                    <div>
                        <button type='submit' className='w-full py-2 rounded-md bg-sky-400 text-white font-semibold hover:bg-sky-500 mb-3'>
                            Post Activity
                        </button>     
                    </div> 
                </form>
            </main>

            <footer className='text-sm md:text-base font-bold text-sky-500 text-center mt-3 mb-2'>
                @LinkedUp
            </footer>
        </div>
    );
}