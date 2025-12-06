'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function GoBackToMainPage() {
    const router = useRouter();

    return (
        <button onClick={() => router.push('/main')} 
                className='absolute left-0 text-4xl text-black font-bold cursor-pointer'>
            ←
        </button>
    );
}

export function GoToActivityCreationPage() {
    const router = useRouter();

    return (
        <button onClick={() => router.push('/activity-creation')} 
                className='mt-4 block w-full rounded-md bg-sky-400 py-2 text-center font-semibold text-white hover:bg-sky-500 transition cursor-pointer'>
            Post an Activity
        </button>
    );
}

export function GoToActivityHistoryPage() {
    const router = useRouter();

    return (
        <button onClick={() => router.push('/activity-history')} 
                className='mt-4 block w-full rounded-md bg-sky-400 py-2 text-center font-semibold text-white ≈ transition cursor-pointer'>
            Activity History
        </button>
    );
}
export function GoToProfilePage() {
    const router = useRouter();

    return (
        <div onClick={() => router.push('/profile')} 
             className='h-12 w-12 rounded-full overflow-hidden border cursor-pointer'>
            <Image src='/lemon_drink.jpeg' alt='User Profile Picture' width={48} height={48} className='object-cover'/>
        </div>
    )
}

export function GoBackToLoginPage() {
    const router = useRouter();

    return (
        <button onClick={() => router.push('/log-in')} 
                className='w-full py-2 rounded-md bg-red-500 text-white font-semibold hover:bg-red-600 cursor-pointer'>
            Sign Out
        </button>
    );
}