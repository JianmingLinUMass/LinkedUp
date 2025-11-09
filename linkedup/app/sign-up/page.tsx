'use client'

import Link from 'next/link';
import { useState } from 'react';

const links = [
    {name: 'Already have an account? Log in here', href: '/log-in'}
];

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmitForm = (e: React.FormEvent) => {
        e.preventDefault();

        // Step1: Verify whether the input email already exists in database

        // Step2: Verify whether the password and re-entered password match

        // Step3: Sign up successfully. Open the Log in Page
        window.location.href = '/log-in';

        // (Optional) Step3.5: Show a dialog on the Log in Page to inform that 
        //   account is successfully signed up
    }

    return(
        <div className='min-h-screen flex items-center justify-center bg-white px-4'>
            <div className='bg-white p-6 md:p-8 rounded-2xl shadow-md w-full max-w-sm md:max-w-md border'>
                <h1 className='text-3xl md:text-4xl font-bold text-sky-500 text-center mb-1'>
                    Sign Up
                </h1>
                <p className='text-center text-gray-500 mb-6 md:mb-8 font-bold text-sm md:text-base'>
                    Sign up an account for LinkedUp
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

                    <div className='flex items-center justify-between mb-1'>
                        <label className='block text-black font-bold'>
                            Password
                        </label>
                        <button type='button' 
                                onClick={() => setShowPassword(!showPassword)}
                                className='text-xs w-16 rounded-md text-center text-black border border-gray-300 bg-gray-100'>
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    <div>
                        <input type={showPassword ? 'text' : 'password'} 
                               className='w-full border rounded-md p-2 text-black placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-300'
                               placeholder='Enter your password'
                               value={password} 
                               onChange={(e) => setPassword(e.target.value)}
                               required
                        />
                    </div>

                    <div>
                        <button type='submit'
                                className='w-full bg-sky-400 hover:bg-sky-500 text-white font-bold py-2 rounded-md transition'>
                            Sign Up
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