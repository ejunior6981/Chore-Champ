import React, { useState } from 'react';
import { InboxArrowDownIcon, CheckCircleIcon, XCircleIcon, PlusIcon, TrashIcon, PencilIcon } from './icons';

interface PointRequest {
  id: string;
  userId: string;
  userName: string;
  description: string;
  points: number;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: number;
  notes?: string;
}

interface RequestsViewProps {
  requests: PointRequest[];
  onApproveRequest: (requestId: string) => void;
  onDenyRequest: (requestId: string) => void;
  onDeleteRequest: (requestId: string) => void;
}

const RequestsView: React.FC<RequestsViewProps> = ({
  requests,
  onApproveRequest,
  onDenyRequest,
  onDeleteRequest,
}) => {
  const statusColors = {
    PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    DENIED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  const statusLabels = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    DENIED: 'Denied',
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
          Point Requests
        </h2>

        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">👤</span>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                      {request.userName}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {request.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      Points: <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {request.points}
                      </span>
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[request.status]}`}
                    >
                      {statusLabels[request.status]}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onDeleteRequest(request.id)}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors dark:text-slate-400 dark:hover:bg-red-900/30"
                    aria-label={`Delete ${request.description}`}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                {request.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => onApproveRequest(request.id)}
                      className="flex-1 bg-emerald-500 text-white text-sm font-medium py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => onDenyRequest(request.id)}
                      className="flex-1 bg-red-500 text-white text-sm font-medium py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      Deny
                    </button>
                  </>
                )}
                {request.status === 'APPROVED' && (
                  <span className="flex-1 text-sm text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" />
                    Approved
                  </span>
                )}
                {request.status === 'DENIED' && (
                  <span className="flex-1 text-sm text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
                    <XCircleIcon className="w-4 h-4" />
                    Denied
                  </span>
                )}
              </div>

              {request.notes && (
                <div className="mt-3 p-3 bg-slate-100 dark:bg-slate-600 rounded-lg">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold">Notes:</span> {request.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {requests.length === 0 && (
          <div className="text-center py-8">
            <InboxArrowDownIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">
              No point requests yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsView;
