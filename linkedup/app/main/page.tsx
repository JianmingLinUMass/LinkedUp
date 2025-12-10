'use client';

import { useState, useEffect } from 'react';
import CalendarTimeline from '@/components/CalendarTimeline';
import ActivityPanel from '@/components/ActivityPanel';
import GoToTopButton from '@/components/GoToTopButton';
import type { Activity } from '@/schemas/ActivityRelated';
import { ActivityTable } from '@/schemas/ActivityRelated';
import { GoToProfilePage, GoToActivityHistoryPage, GoToActivityCreationPage } from '@/components/PageNavigator';

export default function MainPage() {
	const [username] = useState<string>(() => {
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem('currentUserEmail');
			if (stored) return stored;
		}
		return 'user123'; // fallback
	});

	// Activities from DB
	const [myActivities, setMyActivities] = useState<Activity[]>([]);
	const [feedActivities, setFeedActivities] = useState<Activity[]>([]);
	const [loading, setLoading] = useState(true);

	const [myListOpen, setMyListOpen] = useState(true);
	const [feedListOpen, setFeedListOpen] = useState(true);
	const [showCalendarMyList, setShowCalendarMyList] = useState(false);
	const [showCalendarFeedList, setShowCalendarFeedList] = useState(false);

	const [rowSelected, setRowSelected] = useState<Activity | null>(null);
	const [activityPanelOpened, setActivityPanelOpened] = useState(false);

	useEffect(() => {
		const loadActivities = async () => {
			try {
				const res = await fetch('/api/activity');
				if (!res.ok) {
					console.error('Failed to fetch activities');
					setLoading(false);
					return;
				}

				const data: Activity[] = await res.json();

				// My activities = created by me OR joined by me
				const mine = data.filter((a) => 
					a.creator?.username?.toLowerCase() === username.toLowerCase() ||
					a.participants?.some((p) => p.username?.toLowerCase() === username.toLowerCase())
				);
				
				// Feeds = not created by me AND not joined by me
				const feeds = data.filter((a) => 
					a.creator?.username?.toLowerCase() !== username.toLowerCase() &&
					!a.participants?.some((p) => p.username?.toLowerCase() === username.toLowerCase())
				);

				setMyActivities(mine);
				setFeedActivities(feeds);
			} catch (err) {
				console.error('Error fetching activities:', err);
			} finally {
				setLoading(false);
			}
		};

		loadActivities();
	}, [username]);

	const onRowClick = (row: Activity) => {
		setRowSelected(row);
		setActivityPanelOpened(true);
	};

	const onCancelButtonClick = () => {
		setRowSelected(null);
		setActivityPanelOpened(false);
	};

	const isActivityJoined = (activity: Activity) => {
		return activity.participants?.some((p) => p.username?.toLowerCase() === username.toLowerCase());
	};

	const isActivityCreator = (activity: Activity) => {
		return activity.creator?.username?.toLowerCase() === username.toLowerCase();
	};

	const onJoinButtonClick = async () => {
		if (!rowSelected) return;

		const userId = localStorage.getItem('currentUserId');
		const userEmail = localStorage.getItem('currentUserEmail');

		if (!userId) {
			alert('Please log in to join activities');
			return;
		}

		try {
			const res = await fetch('/api/join-activity', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					activityId: rowSelected.id,
					userId,
					userEmail
				})
			});

			const data = await res.json();

			if (!res.ok) {
				alert(data.error || 'Failed to join activity');
				return;
			}

			alert('Successfully joined activity!');
			setActivityPanelOpened(false);
			
			// Refresh activities
			const refreshRes = await fetch('/api/activity');
			if (refreshRes.ok) {
				const activities: Activity[] = await refreshRes.json();
				
				const mine = activities.filter((a) => 
					a.creator?.username?.toLowerCase() === username.toLowerCase() ||
					a.participants?.some((p) => p.username?.toLowerCase() === username.toLowerCase())
				);
				
				const feeds = activities.filter((a) => 
					a.creator?.username?.toLowerCase() !== username.toLowerCase() &&
					!a.participants?.some((p) => p.username?.toLowerCase() === username.toLowerCase())
				);
				
				setMyActivities(mine);
				setFeedActivities(feeds);
			}
		} catch (err) {
			console.error('Error joining activity:', err);
			alert('Failed to join activity');
		}
	};

	const onLeaveButtonClick = async () => {
		if (!rowSelected) return;

		const userEmail = localStorage.getItem('currentUserEmail');

		if (!userEmail) {
			alert('Please log in to leave activities');
			return;
		}

		try {
			const res = await fetch('/api/leave-activity', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					activityId: rowSelected.id,
					userEmail
				})
			});

			const data = await res.json();

			if (!res.ok) {
				alert(data.error || 'Failed to leave activity');
				return;
			}

			alert('Successfully left activity!');
			setActivityPanelOpened(false);
			
			// Refresh activities
			const refreshRes = await fetch('/api/activity');
			if (refreshRes.ok) {
				const activities: Activity[] = await refreshRes.json();
				
				const mine = activities.filter((a) => 
					a.creator?.username?.toLowerCase() === username.toLowerCase() ||
					a.participants?.some((p) => p.username?.toLowerCase() === username.toLowerCase())
				);
				
				const feeds = activities.filter((a) => 
					a.creator?.username?.toLowerCase() !== username.toLowerCase() &&
					!a.participants?.some((p) => p.username?.toLowerCase() === username.toLowerCase())
				);
				
				setMyActivities(mine);
				setFeedActivities(feeds);
			}
		} catch (err) {
			console.error('Error leaving activity:', err);
			alert('Failed to leave activity');
		}
	};

	const onDeleteButtonClick = async () => {
		if (!rowSelected) return;

		const userEmail = localStorage.getItem('currentUserEmail');

		if (!userEmail) {
			alert('Please log in to delete activities');
			return;
		}

		if (!confirm('Are you sure you want to delete this activity?')) {
			return;
		}

		try {
			const res = await fetch('/api/delete-activity', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					activityId: rowSelected.id,
					userEmail
				})
			});

			const data = await res.json();

			if (!res.ok) {
				alert(data.error || 'Failed to delete activity');
				return;
			}

			alert('Activity deleted successfully!');
			setActivityPanelOpened(false);
			
			// Refresh activities
			const refreshRes = await fetch('/api/activity');
			if (refreshRes.ok) {
				const activities: Activity[] = await refreshRes.json();
				
				const mine = activities.filter((a) => 
					a.creator?.username?.toLowerCase() === username.toLowerCase() ||
					a.participants?.some((p) => p.username?.toLowerCase() === username.toLowerCase())
				);
				
				const feeds = activities.filter((a) => 
					a.creator?.username?.toLowerCase() !== username.toLowerCase() &&
					!a.participants?.some((p) => p.username?.toLowerCase() === username.toLowerCase())
				);
				
				setMyActivities(mine);
				setFeedActivities(feeds);
			}
		} catch (err) {
			console.error('Error deleting activity:', err);
			alert('Failed to delete activity');
		}
	};

	return (
		<div className='min-h-screen flex flex-col bg-white px-4 py-4'>
			<main className='flex-grow flex justify-center'>
				<div className='w-full max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-6xl rounded-2xl border bg-white p-4 md:p-8 shadow-sm min-h-[600px] md:min-h-[700px]'>
					<header className='flex gap-5 items-center justify-between pb-4 border-b text-gray-300'>
						<div className='flex gap-5 items-center'>
							<GoToProfilePage />
							<div>
								<p className='text-gray-500 font-bold'>Welcome back,</p>
								<p className='text-gray-500 font-bold'>{username}</p>
							</div>
						</div>
						<button
							onClick={() => {
								localStorage.removeItem('currentUserEmail');
								localStorage.removeItem('currentUserId');
								window.location.href = '/';
							}}
							className='text-sm text-gray-500 hover:text-gray-800 bg-red-300 font-bold border border-gray-300 rounded px-2 py-1 cursor-pointer'
						>
							Logout
						</button>
					</header>

					{/* My Activities */}
					<section className='mt-4'>
						<div className='flex items-center justify-between py-2'>
							<button onClick={() => setMyListOpen(!myListOpen)} className='text-left cursor-pointer'>
								<h2 className='text-lg font-bold text-black'>My Activities</h2>
							</button>
							<button
								onClick={() => setShowCalendarMyList(!showCalendarMyList)}
								className={`w-20 px-3 py-1 rounded-md text-sm font-medium transition cursor-pointer ${
									showCalendarMyList ? 'bg-gray-200 text-gray-600 hover:bg-gray-200' : 'bg-sky-400 text-white'
								}`}
							>
								{showCalendarMyList ? 'List' : 'Calendar'}
							</button>
						</div>

						{loading ? (
							<p className='text-sm text-gray-500 px-3 py-2'>Loading activities...</p>
						) : myActivities.length === 0 ? (
							<p className='text-sm text-gray-500 px-3 py-2'>You have no activities yet. Try creating one!</p>
						) : showCalendarMyList ? (
							<CalendarTimeline activities={myActivities} />
						) : (
							myListOpen && (
								<div className='rounded-md border'>
									<ActivityTable items={myActivities} onRowClick={onRowClick} />
								</div>
							)
						)}

						<GoToActivityHistoryPage />
					</section>

					{/* Activity Feeds */}
					<section className='mt-4'>
						<div className='flex items-center justify-between py-2'>
							<button onClick={() => setFeedListOpen(!feedListOpen)} className='text-left cursor-pointer'>
								<h2 className='text-lg font-bold text-black'>Activity Feeds</h2>
							</button>
							<button
								onClick={() => setShowCalendarFeedList(!showCalendarFeedList)}
								className={`w-20 px-3 py-1 rounded-md text-sm font-medium transition cursor-pointer ${
									showCalendarFeedList ? 'bg-gray-200 text-gray-600 hover:bg-gray-200' : 'bg-sky-400 text-white'
								}`}
							>
								{showCalendarFeedList ? 'List' : 'Calendar'}
							</button>
						</div>

						{loading ? (
							<p className='text-sm text-gray-500 px-3 py-2'>Loading activities...</p>
						) : feedActivities.length === 0 ? (
							<p className='text-sm text-gray-500 px-3 py-2'>No activity feeds available yet.</p>
						) : showCalendarFeedList ? (
							<CalendarTimeline activities={feedActivities} />
						) : (
							feedListOpen && (
								<div className='rounded-md border'>
									<ActivityTable items={feedActivities} onRowClick={onRowClick} />
								</div>
							)
						)}

						<GoToActivityCreationPage />
					</section>

					{/* Activity Panel */}
					<section className='mt-4'>
						{activityPanelOpened && rowSelected && (
							<ActivityPanel 
								activity={rowSelected} 
								onCancel={onCancelButtonClick} 
								onJoin={onJoinButtonClick}
								onLeave={onLeaveButtonClick}
								onDelete={onDeleteButtonClick}
								isJoined={isActivityJoined(rowSelected)}
								isCreator={isActivityCreator(rowSelected)}
							/>
						)}
					</section>
				</div>
			</main>

			<GoToTopButton />

			<footer className='text-4x1 font-bold text-sky-500 text-center mb-2'>@LinkedUp</footer>
		</div>
	);
}
