'use client';

import { useEffect, useState } from 'react';
import CalendarTimeline from '@/components/CalendarTimeline';
import ActivityPanel from '@/components/ActivityPanel';
import GoToTopButton from '@/components/GoToTopButton';
import type { Activity } from '@/schemas/ActivityRelated';
import { ActivityTableWithDeleteButton, parseActivityTime } from '@/schemas/ActivityRelated';
import { GoBackToMainPage } from '@/components/PageNavigator';

function ConfirmPanel({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
	return (
		<div className='fixed inset-0 bg-black/30 flex items-center justify-center'>
			<div className='bg-white p-5 rounded-xl border w-60 text-center'>
				<h2 className='text-lg font-bold text-black'>Deletion Confirmation</h2>
				<p className='mt-2 text-sm text-black'>This action cannot be undone.</p>
				<div className='mt-4 flex justify-between'>
					<button
						onClick={onConfirm}
						className='ml-3 px-2 py-1 text-black font-semibold border rounded hover:bg-sky-300'
					>
						Delete
					</button>
					<button
						onClick={onCancel}
						className='mr-3 px-2 py-1 text-black font-semibold border rounded hover:bg-gray-300'
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}

// same logic as MainPage
const isMine = (activity: Activity, username: string) => {
	const uname = username.toLowerCase();
	return (
		activity.creator?.username?.toLowerCase() === uname ||
		activity.participants?.some((p) => p.username?.toLowerCase() === uname)
	);
};

const isPast = (activity: Activity) => {
	return parseActivityTime(activity.time) < new Date();
};

export default function ActivityHistoryPage() {
	const [username] = useState<string>(() => {
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem('currentUserEmail');
			if (stored) return stored;
		}
		return 'user123'; // fallback
	});

	const [pastList, setPastList] = useState<Activity[]>([]);
	const [loading, setLoading] = useState(true);

	const [pastListOpen, setPastListOpen] = useState(true);
	const [showCalendarPastList, setShowCalendarPastList] = useState(false);

	const [confirmPanelId, setConfirmPanelId] = useState<string | null>(null);
	const [rowSelected, setRowSelected] = useState<Activity | null>(null);
	const [activityPanelOpened, setActivityPanelOpened] = useState(false);

	useEffect(() => {
		const loadHistory = async () => {
			try {
				const res = await fetch('/api/activity');
				if (!res.ok) {
					console.error('Failed to fetch activities for history');
					setLoading(false);
					return;
				}

				const data: Activity[] = await res.json();

				// past activities that are mine (created or joined)
				const history = data.filter((a) => isMine(a, username) && isPast(a));

				setPastList(history);
			} catch (err) {
				console.error('Error fetching activities for history:', err);
			} finally {
				setLoading(false);
			}
		};

		loadHistory();
	}, [username]);

	const onRowClick = (row: Activity) => {
		setRowSelected(row);
		setActivityPanelOpened(true);
	};

	const deleteActivityFromPastList = (id: string) => {
		// currently just removes from UI; if you want to persist deletion,
		// add a DELETE API call here.
		setPastList((prev) => prev.filter((activity) => activity.id !== id));
	};

	const onCancelButtonClick = () => {
		setRowSelected(null);
		setActivityPanelOpened(false);
	};

	return (
		<div className='min-h-screen flex flex-col bg-white px-4 py-4'>
			<main className='flex-grow flex justify-center'>
				<div className='w-full max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-6xl rounded-2xl border bg-white p-4 md:p-8 shadow-sm min-h-[600px] md:min-h-[700px]'>
					<div className='relative flex gap-5 items-center'>
						<GoBackToMainPage />
						<h1 className='text-2xl font-bold text-sky-500 mx-auto'>Activity History</h1>
					</div>

					<section className='mt-4'>
						<div className='flex items-center justify-between py-2'>
							<button onClick={() => setPastListOpen(!pastListOpen)} className='text-left cursor-pointer'>
								<h2 className='text-lg font-bold text-black'>My Past Activities</h2>
							</button>
							<button
								onClick={() => setShowCalendarPastList(!showCalendarPastList)}
								className={`w-20 px-3 py-1 rounded-md text-sm font-medium transition cursor-pointer ${
									showCalendarPastList ? 'bg-gray-200 text-gray-600 hover:bg-gray-200' : 'bg-sky-400 text-white'
								}`}
							>
								{showCalendarPastList ? 'List' : 'Calendar'}
							</button>
						</div>

						{loading ? (
							<p className='text-sm text-gray-500 px-3 py-2'>Loading history...</p>
						) : pastList.length === 0 ? (
							<p className='text-sm text-gray-500 px-3 py-2'>You have no past activities yet.</p>
						) : showCalendarPastList ? (
							<CalendarTimeline activities={pastList} />
						) : (
							pastListOpen && (
								<div className='rounded-md border'>
									<ActivityTableWithDeleteButton
										items={pastList}
										onRowClick={onRowClick}
										onRequestDelete={(id) => {
											setConfirmPanelId(id);
										}}
									/>
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
							<ActivityPanel activity={rowSelected} onCancel={onCancelButtonClick} />
						)}
					</section>
				</div>
			</main>

			<GoToTopButton />

			<footer className='text-4x1 font-bold text-sky-500 text-center mt-3 mb-2'>@LinkedUp</footer>
		</div>
	);
}
