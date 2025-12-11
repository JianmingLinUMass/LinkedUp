'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import type { ActivityCreationFields } from '@/schemas/ActivityRelated';
import { GoBackToMainPage } from '@/components/PageNavigator';

export default function ActivityCreationPage() {
	const router = useRouter();

	const {
		register,
		handleSubmit,
		reset,
		getValues,
		formState: { errors }
	} = useForm<ActivityCreationFields>({
		mode: 'onSubmit',
		reValidateMode: 'onSubmit'
	});

	const OnPostActivityFormSubmission = async (data: ActivityCreationFields) => {
		console.log('Received user input:', data);

		const currentUserEmail = typeof window !== 'undefined' ? localStorage.getItem('currentUserEmail') : null;

		// Convert separate date and time to the expected format
		const dateObj = new Date(data.date + 'T' + data.time);
		const hours = dateObj.getHours();
		const minutes = dateObj.getMinutes();
		const ampm = hours >= 12 ? 'PM' : 'AM';
		const displayHours = hours % 12 || 12;
		const timeAndDate = `${displayHours}:${minutes.toString().padStart(2, '0')}${ampm}, ${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`;

		const res = await fetch('/api/activity', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				title: data.title,
				location: data.location,
				timeAndDate,
				maxAttendees: data.maxAttendees,
				currentUserEmail
			})
		});

		const result = await res.json();

		if (!res.ok) {
			alert(result.error || 'Failed to post activity.');
			return;
		}

		alert('Activity posted successfully!');
		reset();

		router.push('/main');
	};

	const validateDateTime = (date: string, time: string) => {
		if (!date || !time) return true;
		const inputDate = new Date(date + 'T' + time);
		if (inputDate < new Date()) {
			return 'Cannot select a past date and time.';
		}
		return true;
	};

	return (
		<div className='min-h-screen flex flex-col justify-center items-center bg-white px-4 py-4'>
			<main className='w-full max-w-sm md:max-w-md lg:max-w-lg rounded-2xl border bg-white p-4 md:p-6 mt-4 flex flex-col'>
				<div className='relative flex items-center mb-4'>
					<GoBackToMainPage />
					<h1 className='text-xl md:text-2xl font-bold text-sky-500 mx-auto'>Activity Information</h1>
				</div>

				<form
					onSubmit={handleSubmit(OnPostActivityFormSubmission)}
					className='w-full max-w-md bg-white rounded-x1 p-6 space-y-4'
				>
					<div>
						<label className='block font-bold text-black mb-1'>Activity Title</label>
						<input
							{...register('title', {
								required: 'Title is required for posting an activity.'
							})}
							placeholder=''
							className='w-full border rounded-md border-gray-200 text-black rounded-1g p-2 focus:outline-none focus:ring-2 focus:ring-sky-300'
						/>
						{errors.title && <span className='text-sm text-red-400'>{errors.title.message}</span>}
					</div>

					<div>
						<label className='block font-bold text-black mb-1'>Location</label>
						<input
							{...register('location', {
								required: 'Location is required for posting an activity.'
							})}
							placeholder=''
							className='w-full border rounded-md border-gray-200 text-black rounded-1g p-2 focus:outline-none focus:ring-2 focus:ring-sky-300'
						/>
						{errors.location && <span className='text-sm text-red-400'>{errors.location.message}</span>}
					</div>

					<div>
						<label className='block font-bold text-black mb-1'>Date</label>
						<input
							type='date'
							{...register('date', {
								required: 'Date is required for posting an activity.',
								validate: (value: string) => {
									const { time } = getValues();
									return validateDateTime(value, time);
								}
							})}
							className='w-full border rounded-md border-gray-200 text-black rounded-1g p-2 focus:outline-none focus:ring-2 focus:ring-sky-300'
						/>
						{errors.date && <span className='text-sm text-red-400'>{errors.date.message}</span>}
					</div>

					<div>
						<label className='block font-bold text-black mb-1'>Time</label>
						<input
							type='time'
							{...register('time', {
								required: 'Time is required for posting an activity.',
								validate: (value: string) => {
									const { date } = getValues();
									return validateDateTime(date, value);
								}
							})}
							className='w-full border rounded-md border-gray-200 text-black rounded-1g p-2 focus:outline-none focus:ring-2 focus:ring-sky-300'
						/>
						{errors.time && <span className='text-sm text-red-400'>{errors.time.message}</span>}
					</div>

					<div>
						<label className='block font-bold text-black mb-1'>Max Attendees</label>
						<input
							type='number'
							{...register('maxAttendees', {
								required: 'Max attendees is required for posting an activity.',
								min: { value: 1, message: 'Must be at least 1 attendee.' }
							})}
							placeholder=''
							className='w-full border rounded-md border-gray-200 text-black rounded-1g p-2 focus:outline-none focus:ring-2 focus:ring-sky-300'
						/>
						{errors.maxAttendees && <span className='text-sm text-red-400'>{errors.maxAttendees.message}</span>}
					</div>

					<div>
						<button
							type='submit'
							className='w-full py-2 rounded-md bg-sky-400 text-white font-semibold hover:bg-sky-500 mb-3'
						>
							Post Activity
						</button>
					</div>
				</form>
			</main>

			<footer className='text-sm md:text-base font-bold text-sky-500 text-center mt-3 mb-2'>@LinkedUp</footer>
		</div>
	);
}
