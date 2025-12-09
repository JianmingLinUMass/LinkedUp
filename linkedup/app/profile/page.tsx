'use client';

import { useState, useEffect } from 'react';
import { GoBackToMainPage, GoBackToLoginPage } from '@/components/PageNavigator';

export default function ProfilePage() {
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');

	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const storedEmail = localStorage.getItem('currentUserEmail');
		const storedId = localStorage.getItem('currentUserId');

		if (!storedEmail || !storedId) {
			window.location.href = '/log-in';
			return;
		}

		const loadProfile = async () => {
			setEmail(storedEmail);

			try {
				const res = await fetch(`/api/profile?email=${storedEmail}`);
				const data = await res.json();
				if (!data.error) {
					setUsername(data.username || '');
					setCurrentPassword(data.password || '');
				}
			} catch (error) {
				console.error('Failed to load profile:', error);
			}
		};

		loadProfile();
	}, []);

	const saveChanges = async () => {
		const res = await fetch('/api/profile', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email,
				username,
				newPassword
			})
		});

		const result = await res.json();

		if (!res.ok) {
			alert(result.error || 'Failed to update profile.');
			return;
		}

		alert('Profile updated successfully!');
	};

	return (
		<div className='min-h-screen flex flex-col items-center bg-white px-4 py-4'>
			<main className='w-full max-w-sm md:max-w-md lg:max-w-lg rounded-2xl border bg-white p-4 md:p-6 mt-4 flex flex-col'>
				<div className='relative flex items-center mb-6'>
					<GoBackToMainPage />
					<h1 className='text-xl md:text-2xl font-bold text-sky-500 mx-auto'>My Profile</h1>
				</div>

				<label className='font-bold text-black mb-1'>Email</label>
				<input
					type='text'
					value={email}
					readOnly
					className='w-full border border-gray-200 rounded-md p-2 mb-3 text-gray-400 bg-gray-100'
				/>

				<label className='font-bold text-black mb-1'>Current Password</label>
				<div className='flex items-center gap-3 mb-4'>
					<input
						type={showCurrentPassword ? 'text' : 'password'}
						value={currentPassword}
						readOnly
						className='w-full border border-gray-200 rounded-md p-2 mb-3 text-gray-400 bg-gray-100 tracking-wide'
					/>
					<button
						onClick={() => setShowCurrentPassword(!showCurrentPassword)}
						className='text-xs px-2 w-16 rounded-md text-center text-black border border-gray-300 bg-gray-100'
					>
						{showCurrentPassword ? 'Hide' : 'Show'}
					</button>
				</div>

				<label className='font-bold text-black mb-1'>New Password</label>
				<div className='flex items-center gap-3 mb-4'>
					<input
						type={showNewPassword ? 'text' : 'password'}
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						className='w-full border border-gray-200 rounded-md p-2 mb-2 text-black focus:outline-none focus:ring-2 focus:ring-sky-300 tracking-wide'
					/>
					<button
						onClick={() => setShowNewPassword(!showNewPassword)}
						className='text-xs px-2 w-16 rounded-md text-center text-black border border-gray-300 bg-gray-100'
					>
						{showNewPassword ? 'Hide' : 'Show'}
					</button>
				</div>

				<button
					onClick={saveChanges}
					className='w-full py-2 rounded-md bg-sky-400 text-white font-semibold hover:bg-sky-500 mb-3'
				>
					Save Changes
				</button>

				<GoBackToLoginPage />
			</main>
		</div>
	);
}
