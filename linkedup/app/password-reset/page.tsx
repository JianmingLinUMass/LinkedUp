'use client'

import { useState } from 'react';

function CancelReset() {
    // Needs to handle cancel password reset
    console.log('Canceling password reset.')
    return;
}

function ResetPassword() {
    // Needs to reset password
    console.log('Resetting password.')
    return;
}

export default function ProfilePage() {    
    const userEmail = 'user123@umass.edu';

    const [newPassword, setNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showConfirmedNewPassword, setShowConfirmedNewPassword] = useState(false);

    return(
        <div className='min-h-screen flex flex-col items-center bg-white justify-center'>
            <main className='w-full max-w-sm md:max-w-md lg:max-w-lg rounded-2xl border bg-white p-4 md:p-6 mt-4 flex flex-col'>
                <div>
                    <h1 className='text-4xl font-bold text-sky-500 text-center mb-1'>
                        Reset Password
                    </h1>
                    <p className='text-center text-gray-500 mb-8 font-bold'>
                        Reset your LinkedUp account password
                    </p>
                </div>

                <label className='font-bold text-black mb-1'>
                    Email
                </label>
                <input type='text' value={userEmail} 
                       className='w-full border border-gray-200 rounded-md p-2 mb-4 text-gray-400 bg-gray-100 focus:outline-none' readOnly/>

                <label className='font-bold text-black mb-1'>
                    New Password
                </label>
                <div className='flex items-center gap-3 mb-4'>
                    <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                           className='w-full border border-gray-200 rounded-md p-2 mb-2 text-black focus:outline-none focus:ring-2 focus:ring-sky-300 tracking-wide'/>
                    <button onClick={() => setShowNewPassword(!showNewPassword)}
                            className='text-xs px-2 w-16 rounded-md text-center text-black border border-gray-300 bg-gray-100'>
                        {showNewPassword ? 'Hide' : 'Show'}
                    </button>
                </div>

                <label className='font-bold text-black mb-1'>
                    Confirm New Password
                </label>
                <div className='flex items-center gap-3 mb-4'>
                    <input type={showConfirmedNewPassword ? 'text' : 'password'} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} 
                           className='w-full border border-gray-200 rounded-md p-2 mb-2 text-black focus:outline-none focus:ring-2 focus:ring-sky-300 tracking-wide'/>
                    <button onClick={() => setShowConfirmedNewPassword(!showConfirmedNewPassword)}
                            className='text-xs px-2 w-16 rounded-md text-center text-black border border-gray-300 bg-gray-100'>
                        {showConfirmedNewPassword ? 'Hide' : 'Show'}
                    </button>
                </div>

                <button onClick={ResetPassword} className='w-full py-2 rounded-md bg-sky-400 text-white font-semibold hover:bg-sky-500 mb-3'>
                    Reset
                </button>

                <button onClick={CancelReset} className='w-full py-2 rounded-md bg-red-500 text-white font-semibold hover:bg-red-600'>
                    Cancel Reset
                </button>
            </main>

            <footer className='text-sm md:text-base font-bold text-sky-500 text-center mt-3 mb-2'>
                @LinkedUp
            </footer>
        </div>
    );
}