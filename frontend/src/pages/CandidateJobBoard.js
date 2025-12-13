import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJobs } from '../services/api';

const CandidateJobBoard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await getJobs();
                setJobs(data);
            } catch (err) {
                console.error("Failed to fetch jobs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-xl text-gray-500">Loading Open Positions...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Join Our Team</h1>
                    <p className="text-xl text-gray-600">Explore open roles and define the future with us.</p>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {jobs.map((job) => (
                            <li key={job.id}>
                                <div className="px-6 py-6 hover:bg-gray-50 flex items-center justify-between transition ease-in-out duration-150">
                                    <div>
                                        <div className="flex items-center mb-2">
                                            <p className="text-lg font-bold text-indigo-600 truncate">{job.title}</p>
                                            <span className="ml-3 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {job.job_type}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500 flex flex-col sm:flex-row sm:gap-4">
                                            <p>📍 {job.location}</p>
                                            <p>📅 Posted {new Date(job.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-700 max-w-xl">
                                            {job.description.substring(0, 150)}...
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-shrink-0">
                                        <Link
                                            to={`/jobs/${job.id}/apply`}
                                            className="font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-full shadow-sm transition"
                                        >
                                            Apply Now &rarr;
                                        </Link>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {jobs.length === 0 && (
                            <li className="px-6 py-12 text-center text-gray-500">
                                No current openings. Please check back later!
                            </li>
                        )}
                    </ul>
                </div>

                <div className="mt-8 text-center">
                    <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CandidateJobBoard;
