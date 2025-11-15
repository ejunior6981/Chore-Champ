
import React from 'react';
import { PointRequest, PointRequestStatus } from '../types';
import { StarIcon } from './icons';

interface PointRequestCardProps {
  request: PointRequest;
  onAction: (id: number, newStatus: PointRequestStatus.Approved | PointRequestStatus.Denied) => void;
  userName?: string;
}

const PointRequestCard: React.FC<PointRequestCardProps> = ({ request, onAction, userName }) => {
    
    const cardBgColor = {
        [PointRequestStatus.Pending]: 'bg-white',
        [PointRequestStatus.Approved]: 'bg-green-50',
        [PointRequestStatus.Denied]: 'bg-red-50',
    };

    const statusBadge = {
        [PointRequestStatus.Pending]: <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-200 text-amber-800">Pending</span>,
        [PointRequestStatus.Approved]: <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-200 text-green-800">Approved</span>,
        [PointRequestStatus.Denied]: <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-200 text-red-800">Denied</span>,
    }

  return (
    <div className={`transition-all duration-300 rounded-xl shadow-lg flex flex-col p-4 ${cardBgColor[request.status]}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-grow pr-4">
            {userName && <p className="font-bold text-slate-800">{userName}'s Request</p>}
            <p className="text-slate-600 text-sm italic">"{request.description}"</p>
        </div>
        {statusBadge[request.status]}
      </div>
      <div className="flex items-center space-x-1 text-amber-500 mt-2 mb-4">
        <StarIcon className="w-5 h-5" />
        <span className="font-semibold text-lg">{request.points} Points Requested</span>
      </div>
      
      {request.status === PointRequestStatus.Pending && (
        <div className="flex space-x-2">
          <button
            onClick={() => onAction(request.id, PointRequestStatus.Denied)}
            className="flex-1 font-bold py-2 px-4 rounded-lg transition-colors bg-slate-200 text-slate-700 hover:bg-slate-300"
          >
            Deny
          </button>
          <button
            onClick={() => onAction(request.id, PointRequestStatus.Approved)}
            className="flex-1 font-bold py-2 px-4 rounded-lg transition-colors bg-green-500 text-white hover:bg-green-600"
          >
            Approve
          </button>
        </div>
      )}
    </div>
  );
};

export default PointRequestCard;