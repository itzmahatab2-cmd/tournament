import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Info } from 'lucide-react';
import { RegistrationData } from '../types';

export const SuccessPage: React.FC = () => {
  const location = useLocation();
  const submissionData = location.state?.data as RegistrationData | undefined;

  return (
    <div className="max-w-3xl mx-auto pt-12 pb-12 px-4">
       <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-t-8 border-t-green-500 p-8 relative">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl text-gray-800 mb-2">Registration Successful!</h1>
            <p className="text-gray-600">
                Your team has been successfully registered for the tournament. <br/>
                We have recorded your response.
            </p>
          </div>

          {submissionData && (
              <div className="bg-gray-50 p-6 rounded-md border border-gray-200 mb-8">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 border-b pb-2">Registration Receipt</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                          <p className="text-gray-500">Team Name</p>
                          <p className="font-semibold text-gray-900">{submissionData.teamName}</p>
                      </div>
                      <div>
                          <p className="text-gray-500">Game</p>
                          <p className="font-semibold text-gray-900">{submissionData.gameName}</p>
                      </div>
                      <div>
                          <p className="text-gray-500">Leader</p>
                          <p className="font-semibold text-gray-900">{submissionData.leaderName}</p>
                      </div>
                      <div>
                          <p className="text-gray-500">Transaction ID</p>
                          <p className="font-mono bg-white px-2 py-1 rounded border inline-block">{submissionData.transactionId}</p>
                      </div>
                  </div>
                  <div className="mt-4 flex items-start gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>Note: This data has been securely submitted to the tournament admin database.</p>
                  </div>
              </div>
          )}
          
          <div className="flex flex-col gap-3 justify-center items-center">
            <Link to="/" className="text-blue-600 hover:underline font-medium text-sm">
                Submit another response
            </Link>
             <Link to="/admin" className="text-gray-400 hover:text-gray-600 text-xs mt-8">
                Go to Admin Panel
            </Link>
          </div>
       </div>
    </div>
  );
};