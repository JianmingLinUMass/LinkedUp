'use client'

import Link from 'next/link';
import { useState } from 'react';

const links = [
    {name: "Don't have an account? Sign up", href: '/sign-up'},
    {name: 'Forgot password? Click here', href: '/forgot-password'}
];

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmitForm = (e: React.FormEvent) => {
        e.preventDefault();

        // Step1: Verify whether the combination of input email and password exist in database.

        // Step2: Log in successfully. Open the Main Page.
        window.location.href = '/main';
    }

    return(
        <div className='min-h-screen flex items-center justify-center bg-white'>
            <div className='bg-white p-8 rounded-2x1 shadow-md w-full max-w-sm border'>
                <h1 className='text-4xl font-bold text-sky-500 text-center mb-1'>
                    LinkedUp
                </h1>
                <p className='text-center text-gray-500 mb-8 font-bold'>
                    Activities, made easy.
                </p>

                <form onSubmit={handleSubmitForm} className='space-y-5'>
                    <div>
                        <label className='block text-black font-bold mb-1'>
                            Email
                        </label>
                        <input type='email' className='w-full border rounded-md p-2 text-black placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-300'
                            placeholder='Enter your email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>

                    <div>
                        <label className='block text-black font-bold mb-1'>
                            Password
                        </label>
                        <input type='password' className='w-full border rounded-md p-2 text-black placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-300'
                            placeholder='Enter your password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>

                    <div>
                        <button type='submit' className='w-full bg-sky-400 hover:bg-sky-500 text-white font-bold py-2 rounded-md transition'>
                            Log In
                        </button>
                    </div>
                </form>

                <div className='text-center mt-6 space-y-2'>
                    <p className='text-sm text'>
                        <Link href={links[0].href} className='text-sky-400 hover:underline'>
                            {links[0].name}
                        </Link>
                    </p>
                    <p className='text-sm'>
                        <Link href={links[1].href} className='text-sky-400 hover:underline'>
                            {links[1].name}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}