import React, { useState } from 'react';
import { PointRequest, PointRequestStatus } from '../types';
import { StarIcon, CheckCircleIcon } from './icons';

interface PointRequestCardProps {
  request: PointRequest;
  onAction: (id: number, newStatus: PointRequestStatus.Approved | PointRequestStatus.Denied, adjustedPoints?: number) => void;
  userName?: string;
  canApprove?: boolean;
}

const PointRequestCard: React.FC<PointRequestCardProps> = ({ request, onAction, userName, canApprove = true }) => {
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustedPoints, setAdjustedPoints] = useState(request.points.toString());
  
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

  const handleApproveLess = () => {
    const pts = parseInt(adjustedPoints, 10);
    if (!isNaN(pts) && pts >= 0) {
      onAction(request.id, PointRequestStatus.Approved, pts);
      setShowAdjustModal(false);
    }
  };

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
      
      {request.status === PointRequestStatus.Pending && canApprove && (
        <div className="space-y-2">
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
          <button
            onClick={() => setShowAdjustModal(true)}
            className="w-full font-bold py-2 px-4 rounded-lg transition-colors bg-amber-100 text-amber-700 hover:bg-amber-200 text-sm"
          >
            Approve Less
          </button>
        </div>
      )}

      {showAdjustModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={() => setShowAdjustModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Approve Less</h3>
            <p className="text-slate-600 mb-4">
              The child requested <strong>{request.points} points</strong>. How many would you like to award?
            </p>
            <input
              type="number"
              value={adjustedPoints}
              onChange={e => setAdjustedPoints(e.target.value)}
              min="0"
              max={request.points}
              className="w-full p-3 border rounded-lg bg-slate-50 text-slate-800 mb-4"
              autoFocus
            />
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAdjustModal(false)}
                className="flex-1 bg-slate-200 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveLess}
                className="flex-1 bg-amber-500 text-white font-bold py-3 rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center space-x-1"
              >
                <CheckCircleIcon className="w-5 h-5" />
                <span>Award {adjustedPoints || 0}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointRequestCard;
