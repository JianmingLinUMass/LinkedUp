'use client'

import Link from 'next/link';
import { useState } from 'react';

const links = [
    {name: 'Already have an account? Log in here', href: '/log-in'}
];

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    
    const handleSubmitForm = (e: React.FormEvent) => {
        e.preventDefault();

        // Handle submit button logic here

    }

    return(
        <div className='min-h-screen flex items-center justify-center bg-white'>
            <div className='bg-white p-8 rounded-2x1 shadow-md w-full max-w-sm border'>
                <h1 className='text-4xl font-bold text-sky-500 text-center mb-1'>
                    Password Reset
                </h1>
                <p className='text-center text-gray-500 mb-8 font-bold'>
                    Reset your LinkedUp account password
                </p>

                <form onSubmit={handleSubmitForm} className='space-y-5'>
                    <div>
                        <label className='block text-black font-bold mb-1'>
                            Email
                        </label>
                        <input type='email' 
                               className='w-full border rounded-md p-2 text-black placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-300'
                               placeholder='Enter your email'
                               value={email}
                               onChange={(e) => setEmail(e.target.value)}
                               required
                        />
                    </div>

                    <div>
                        <button type='submit'
                                className='w-full bg-sky-400 hover:bg-sky-500 text-white font-bold py-2 rounded-md transition'>
                            Send Recovery Link
                        </button>
                    </div>
                </form>

                <div className='text-center mt-6 space-y-2'>
                    <p className='text-sm text'>
                        <Link href={links[0].href} className='text-sky-400 hover:underline'>
                            {links[0].name}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}