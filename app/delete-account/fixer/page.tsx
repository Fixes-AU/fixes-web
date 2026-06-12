"use client";

import { useState } from 'react';

export default function DeleteAccountPage() {
    const [email, setEmail] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('https://fixes-server.onrender.com/api/auth/delete-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, reason })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setMessage({ text: data.message || 'Request submitted successfully.', type: 'success' });
                setEmail('');
                setReason('');
            } else {
                setMessage({ text: data.message || 'Something went wrong.', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Failed to connect to the server. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#f9faf9] min-h-screen flex items-center justify-center p-4 text-[#001e00] font-sans">
            <title>Delete Account - Fixes</title>
            <div className="w-full max-w-md">
                {/* Logo Area */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <svg className="h-14 w-auto mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 55 55">
                      <g id="Group_340" data-name="Group 340" transform="translate(-165 -582)">
                        <rect id="Rectangle_440" data-name="Rectangle 440" width="55" height="55" rx="11" transform="translate(165 582)" fill="#08544b"/>
                        <g id="Group_330" data-name="Group 330" transform="translate(171.059 594.864)">
                          <g id="Group_329" data-name="Group 329" transform="translate(0 0)">
                            <path id="Union_17" data-name="Union 17" d="M28.817,14.928a7.671,7.671,0,0,1-1.7-.18,4.992,4.992,0,0,1-1.588-.641,3.76,3.76,0,0,1-.667-.541,3.536,3.536,0,0,1-.536-.713,3.96,3.96,0,0,1-.373-.9,5.191,5.191,0,0,1-.174-1.114A5.738,5.738,0,0,1,23.847,9.8a5.41,5.41,0,0,1,.266-1.022A5.113,5.113,0,0,1,25.3,6.918a6.13,6.13,0,0,1,2.185-1.374A8.77,8.77,0,0,1,29,5.128,11.949,11.949,0,0,1,30.8,4.942h.019A4.243,4.243,0,0,1,34.36,6.326a3.553,3.553,0,0,1,.626,1.285A5.178,5.178,0,0,1,35.152,8.9a6.561,6.561,0,0,1-.067.989c-.035.243-.072.394-.072.4H28.441a1.949,1.949,0,0,0-.039.286,2.4,2.4,0,0,0,.047.674,1.77,1.77,0,0,0,.768,1.129,2.36,2.36,0,0,0,.565.269,2.51,2.51,0,0,0,.785.12,3.928,3.928,0,0,0,1.172-.2,6.523,6.523,0,0,0,1.036-.436,7.625,7.625,0,0,0,1.021-.634l-.356,1.883a3.811,3.811,0,0,1-.636.482,6.554,6.554,0,0,1-.821.436,8.187,8.187,0,0,1-1.18.419,8.44,8.44,0,0,1-.917.156,9.364,9.364,0,0,1-1.07.062Zm.662-7.611a1.954,1.954,0,0,0-.424.592,3.614,3.614,0,0,0-.226.592c-.046.159-.067.268-.067.269h2.071a3.407,3.407,0,0,0,.066-.563,2.178,2.178,0,0,0-.034-.487.993.993,0,0,0-.182-.431.608.608,0,0,0-.216-.173.742.742,0,0,0-.316-.067H30.14a.97.97,0,0,0-.661.269ZM0,14.87,1.343,7.364H0L.308,5.187H1.7A5.742,5.742,0,0,1,5.274.507a11.9,11.9,0,0,1,6.786,0l-.443,2.747a2.75,2.75,0,0,0-3.131-.937c-1.694.6-1.76,2.87-1.76,2.87h6.527l-1.731,9.621h-4.8L8.156,7.364H6.3L5,14.87ZM17.953,14.8l-.78-1.823L15.81,14.8H12.058l4.324-3.755L13.755,5.228h5.74l.744,1.758L21.9,5.228H25.29L21.054,8.779,23.59,14.8Z" transform="translate(0 -0.002)" fill="#fffef8"/>
                            <g id="Group_328" data-name="Group 328" transform="translate(34.841 5.382)">
                              <path id="Path_1238" data-name="Path 1238" d="M266.46,356.89H271.1l-.187,1.039-.381,1.985-1.163,6.6h-4.8l1.431-7.445Z" transform="translate(-264.577 -356.89)" fill="#fffef8"/>
                              <path id="Path_1239" data-name="Path 1239" d="M286.5,356.432a3.9,3.9,0,0,1,2.835-1.246c2.625.221,1.975,3.046,1.975,3.046h-2.844a.839.839,0,0,0-.974-.911c-1.045.064-1.589,2.245-1.589,2.245Z" transform="translate(-280.674 -355.106)" fill="#fffef8"/>
                            </g>
                          </g>
                        </g>
                        <g id="Group_337" data-name="Group 337" transform="matrix(0.259, 0.966, -0.966, 0.259, 196.738, 609.868)">
                          <path id="Exclusion_18" data-name="Exclusion 18" d="M0,21.377l1.318,5.209s.673-.4,1.623-1a12.977,12.977,0,0,0,4.644-4.7,17.2,17.2,0,0,0,1.49-6.856c.045-2.253-.3-4.1.15-5.6.55-2.111,3.3-3.23,3.3-3.23L11.158,0S10.19.578,8.972,1.386A10.221,10.221,0,0,0,4.423,6.608c-.81,2.173-.58,4.465-.5,6.6a11.285,11.285,0,0,1-.686,5.24A6.855,6.855,0,0,1,0,21.377Z" transform="translate(0 0)" fill="#fff"/>
                        </g>
                      </g>
                    </svg>
                    
                    <h2 className="text-2xl font-bold tracking-tight">Account Deletion</h2>
                    <p className="text-sm text-gray-500 mt-1">Submit a request to permanently delete your data</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">Registered Email</label>
                            <input type="email" id="email" required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#14a800] focus:border-[#14a800] transition-all placeholder:text-gray-400 text-sm"
                                placeholder="you@example.com" />
                        </div>
                        
                        <div>
                            <label htmlFor="reason" className="block text-sm font-semibold text-gray-700 mb-1.5">Reason for leaving</label>
                            <textarea id="reason" required rows={4} 
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#14a800] focus:border-[#14a800] transition-all placeholder:text-gray-400 text-sm resize-none"
                                placeholder="Please tell us why you are deleting your account..."></textarea>
                        </div>

                        <div className="pt-2">
                            <button type="submit" disabled={loading}
                                className="w-full flex items-center justify-center gap-2 rounded-full bg-red-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600 active:bg-red-700 disabled:opacity-70 disabled:pointer-events-none">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        Submit Deletion Request
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {message && (
                        <div className={`mt-6 p-4 rounded-lg text-sm font-medium border flex items-start gap-3 transition-all duration-300 ${message.type === 'success' ? 'bg-green-50 text-[#14a800] border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {message.type === 'success' ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                )}
                            </svg>
                            <p>{message.text}</p>
                        </div>
                    )}
                    
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-400">
                            Your request will be processed within 30 days in accordance with our 
                            <a href="/privacy-policy/tradie" className="text-[#14a800] font-medium hover:underline ml-1">Privacy Policy</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
