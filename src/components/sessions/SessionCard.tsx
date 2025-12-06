'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreVertical, Users, Radio, Check, Clock, Lightbulb, Vote, BarChart2, Grid2x2, ExternalLink, Trash2 } from 'lucide-react';
import type { SessionListItem } from '@/types';

interface SessionCardProps {
  session: SessionListItem;
  onDelete: (sessionId: string) => void;
}

const getToolIcon = (toolType: string) => {
  const iconMap = {
    'voting-board': Vote,
    'problem-framing': Lightbulb,
    'rice': BarChart2,
    'moscow': Grid2x2,
  };
  return iconMap[toolType as keyof typeof iconMap] || Clock;
};

const getToolColors = (toolType: string) => {
  const colorMap = {
    'voting-board': { color: 'text-blue-600', bgColor: 'bg-blue-50' },
    'problem-framing': { color: 'text-green-600', bgColor: 'bg-green-50' },
    'rice': { color: 'text-purple-600', bgColor: 'bg-purple-50' },
    'moscow': { color: 'text-orange-600', bgColor: 'bg-orange-50' },
  };
  return colorMap[toolType as keyof typeof colorMap] || { color: 'text-gray-600', bgColor: 'bg-gray-50' };
};

export function SessionCard({ session, onDelete }: SessionCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const Icon = getToolIcon(session.tool_type);
  const { color, bgColor } = getToolColors(session.tool_type);

  const getSessionUrl = () => {
    if (session.tool_type === 'voting-board') {
      return `/session/${session.id}`;
    } else if (session.tool_type === 'problem-framing') {
      return `/tools/problem-framing/${session.id}/join`;
    }
    return `/session/${session.id}`;
  };

  const getStatusBadge = () => {
    switch (session.status) {
      case 'playing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <Radio className="w-3 h-3 fill-current" />
            Live
          </span>
        );
      case 'results':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            Results
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            <Check className="w-3 h-3" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            Open
          </span>
        );
    }
  };

  const copyLink = () => {
    const url = window.location.origin + getSessionUrl();
    navigator.clipboard.writeText(url);
    setShowMenu(false);
  };

  return (
    <div className="group relative bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all">
      <Link href={getSessionUrl()} className="block p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={'w-10 h-10 ' + bgColor + ' rounded-lg flex items-center justify-center flex-shrink-0'}>
              <Icon className={'w-5 h-5 ' + color} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">
                {session.title}
              </h3>
              {session.description && (
                <p className="text-xs text-gray-600 line-clamp-2">
                  {session.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3 mt-3">
          <div className="flex items-center gap-2 mb-2">
            {getStatusBadge()}
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
              {session.tool_type.replace('-', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1">
              <Users className="w-3 h-3" />
              {session.participantCount} participants
            </span>
            <span>·</span>
            <span>{session.lastActivityTime}</span>
          </div>
        </div>
      </Link>

      <div className="absolute top-4 right-4">
        <button
          onClick={(e) => {
            e.preventDefault();
            setShowMenu(!showMenu);
          }}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-8 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
              <Link
                href={getSessionUrl()}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowMenu(false)}
              >
                <ExternalLink className="w-4 h-4" />
                View Session
              </Link>
              <button
                onClick={copyLink}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
              >
                <ExternalLink className="w-4 h-4" />
                Copy Link
              </button>
              <hr className="my-1" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onDelete(session.id);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
              >
                <Trash2 className="w-4 h-4" />
                Delete Session
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
