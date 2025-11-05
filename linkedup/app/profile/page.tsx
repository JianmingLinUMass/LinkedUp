'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function GoBackToMainPage() {
    const router = useRouter();

    return (
        <button onClick={() => router.push('/main')} 
                className='absolute left-0 text-4xl text-black font-bold cursor-pointer'>
            ←
        </button>
    );
}

function GoBackToLoginPage() {
    const router = useRouter();

    return (
        <button onClick={() => router.push('/log-in')} 
                className='w-full py-2 rounded-md bg-red-500 text-white font-semibold hover:bg-red-600 cursor-pointer'>
            Sign Out
        </button>
    );
}

function SaveChanges() {
    // Needs to apply changes to username and password
    console.log('Saving changes.')
    return;
}

export default function ProfilePage() {    
    const userEmail = 'user123@umass.edu';
    const userCurrentPassword = '12345678';

    const [username, setUsername] = useState('user123');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [userNewPassword, setUserNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);

    return(
        <div className='min-h-screen flex flex-col items-center bg-white'>
            <main className='w-full max-w-sm rounded-2xl border bg-white p-5 mt-4 flex flex-col'>
                <div className='relative flex items-center mb-4'>
                    <GoBackToMainPage/>
                    <h1 className='text-2xl font-bold text-sky-500 mx-auto'>
                        My Profile
                    </h1>
                </div>

                <div className='flex iterms-center justify-between mb-5'>
                    <p className='font-bold text-black'>
                        Profile Picture
                    </p>
                    <div className='h-16 w-16 rounded-full overflow-hidden border cursor-pointer'>
                        <Image src='/lemon_drink.jpeg' alt='User Profile Picture' width={64} height={64} className='object-cover'/>
                    </div>
                </div>

                <label className='font-bold text-black mb-1'>
                    Username
                </label>
                <input type='text' value={username} onChange={(e) => setUsername(e.target.value)} 
                       className='w-full border border-gray-200 rounded-md p-2 mb-3 text-black focus:outline-none focus:ring-2 focus:ring-sky-300'/>

                <label className='font-bold text-black mb-1'>
                    Email
                </label>
                <input type='text' value={userEmail} 
                       className='w-full border border-gray-200 rounded-md p-2 mb-3 text-gray-400 bg-gray-100 focus:outline-none' readOnly/>

                <label className='font-bold text-black mb-1'>
                    Current Password
                </label>
                <div className='flex items-center gap-3 mb-4'>
                    <input type={showCurrentPassword ? 'text' : 'password'} value={userCurrentPassword} 
                           className='w-full border border-gray-200 rounded-md p-2 mb-3 text-gray-400 bg-gray-100 focus:outline-none tracking-wide' readOnly/>
                    <button onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className='text-xs px-2 w-16 rounded-md text-center text-black border border-gray-300 bg-gray-100'>
                        {showCurrentPassword ? 'Hide' : 'Show'}
                    </button>
                </div>

                <label className='font-bold text-black mb-1'>
                    New Password
                </label>
                <div className='flex items-center gap-3 mb-4'>
                    <input type={showNewPassword ? 'text' : 'password'} value={userNewPassword} onChange={(e) => setUserNewPassword(e.target.value)} 
                           className='w-full border border-gray-200 rounded-md p-2 mb-2 text-black focus:outline-none focus:ring-2 focus:ring-sky-300 tracking-wide'/>
                    <button onClick={() => setShowNewPassword(!showNewPassword)}
                            className='text-xs px-2 w-16 rounded-md text-center text-black border border-gray-300 bg-gray-100'>
                        {showNewPassword ? 'Hide' : 'Show'}
                    </button>
                </div>

                <button onClick={SaveChanges} className='w-full py-2 rounded-md bg-sky-400 text-white font-semibold hover:bg-sky-500 mb-3'>
                    Save Changes
                </button>

                <GoBackToLoginPage/>
            </main>

            <footer className='text-4x1 font-bold text-sky-500 text-center mt-3 mb-2'>
                @LinkedUp
            </footer>
        </div>
    );
}