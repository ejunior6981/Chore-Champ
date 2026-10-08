import React, { useState } from 'react';
import { User } from '../types';
import { LockIcon, ArrowLeftIcon, QuestionMarkCircleIcon, XCircleIcon } from './icons';

interface LoginScreenProps {
  users: User[];
  onLogin: (userId: number) => void;
  onParentLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin, onParentLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const childUsers = users.filter(u => u.role === 'child');

  const handleKeyPress = (digit: string) => {
    if (pin.length < 8) {
      setPin(prev => prev + digit);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleSubmit = () => {
    if (pin.length < 4) {
      setError('PIN must be 4-8 digits');
      return;
    }
    const matchedChild = childUsers.find(child => child.pin === pin);
    if (matchedChild) {
      onLogin(matchedChild.id);
      setPin('');
      setError('');
    } else {
      setError('Invalid PIN');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-100 to-indigo-100 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-500 rounded-full mb-4 shadow-lg">
            <LockIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Chore Champ</h1>
          <p className="text-slate-600 mt-2">Enter your PIN to continue</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-center mb-6">
            <div className="flex space-x-3">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    i < pin.length ? 'bg-sky-500 scale-110' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {['1','2','3','4','5','6','7','8','9'].map(digit => (
              <button
                key={digit}
                onClick={() => handleKeyPress(digit)}
                className="h-14 rounded-xl bg-slate-100 text-xl font-bold text-slate-700 hover:bg-sky-100 active:bg-sky-200 transition-colors shadow-sm"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={() => setShowForgot(true)}
              className="h-14 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors flex items-center justify-center"
            >
              <QuestionMarkCircleIcon className="w-7 h-7" />
            </button>
            <button
              onClick={() => handleKeyPress('0')}
              className="h-14 rounded-xl bg-slate-100 text-xl font-bold text-slate-700 hover:bg-sky-100 active:bg-sky-200 transition-colors shadow-sm"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-14 rounded-xl bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-600 active:bg-red-200 transition-colors flex items-center justify-center shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12 12 14.25M16.5 12H3m14.25-2.25L19.5 12l-1.75 2.25" />
              </svg>
            </button>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full mt-4 h-14 rounded-xl bg-sky-500 text-white text-lg font-bold hover:bg-sky-600 active:bg-sky-700 transition-colors shadow-md"
          >
            Enter
          </button>
        </div>

        <button
          onClick={onParentLogin}
          className="w-full text-center text-slate-500 hover:text-slate-700 font-medium text-sm py-3"
        >
          <ArrowLeftIcon className="w-4 h-4 inline mr-1" />
          I'll login as parent
        </button>
      </div>

      {showForgot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={() => setShowForgot(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <XCircleIcon className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Forgot PIN?</h3>
              <p className="text-slate-600 mb-4">
                Ask your parent to check or reset your PIN in the <strong>Family</strong> tab.
              </p>
              <button
                onClick={() => setShowForgot(false)}
                className="w-full bg-sky-500 text-white font-bold py-3 rounded-lg hover:bg-sky-600 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;
