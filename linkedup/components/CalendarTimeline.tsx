'use client';

import { useState } from 'react';
import type { Activity } from '@/schemas/ActivityRelated';

type CalendarTimelineProps = {
  activities: Activity[];
};

function parseActivityTime(timeStr: string) {
  // Parse "7:00AM, 11/07" format
  const [time, date] = timeStr.split(', ');
  const [month, day] = date.split('/');
  const currentYear = new Date().getFullYear();
  
  // Parse time
  const timeMatch = time.match(/(\d+):(\d+)(AM|PM)/);
  if (!timeMatch) return null;
  
  let hours = parseInt(timeMatch[1]);
  const minutes = parseInt(timeMatch[2]);
  const period = timeMatch[3];
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return new Date(currentYear, parseInt(month) - 1, parseInt(day), hours, minutes);
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

export default function CalendarTimeline({ activities }: CalendarTimelineProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Parse and group activities by date
  const activityMap = new Map<string, { activity: Activity; date: Date }[]>();
  
  activities.forEach(activity => {
    const date = parseActivityTime(activity.time);
    if (date) {
      const dateKey = date.toDateString();
      if (!activityMap.has(dateKey)) {
        activityMap.set(dateKey, []);
      }
      activityMap.get(dateKey)!.push({ activity, date });
    }
  });
  
  // Sort activities within each day by time
  activityMap.forEach(dayActivities => {
    dayActivities.sort((a, b) => a.date.getTime() - b.date.getTime());
  });
  
  // Get unique dates and sort them
  const dates = Array.from(activityMap.keys())
    .map(dateStr => new Date(dateStr))
    .sort((a, b) => a.getTime() - b.getTime());
  
  const selectedActivities = selectedDate 
    ? activityMap.get(selectedDate.toDateString()) || []
    : [];

  return (
    <div className='w-full'>
      <h3 className='text-lg font-bold text-black mb-3'>Calendar Timeline</h3>
      
      {/* Date selector */}
      <div className='flex gap-2 mb-4 overflow-x-auto pb-2'>
        {dates.map(date => {
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          const dayActivities = activityMap.get(date.toDateString()) || [];
          
          return (
            <button
              key={date.toDateString()}
              onClick={() => setSelectedDate(isSelected ? null : date)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg border text-sm font-medium transition ${
                isSelected 
                  ? 'bg-sky-400 text-white border-sky-400' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-sky-300'
              }`}
            >
              <div className='text-center'>
                <div className='text-xs opacity-75'>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div>
                  {date.getDate()}
                </div>
                <div className='text-xs opacity-75'>
                  {dayActivities.length} event{dayActivities.length !== 1 ? 's' : ''}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Timeline view */}
      {selectedDate ? (
        <div className='bg-gray-50 rounded-lg p-4'>
          <h4 className='font-semibold text-gray-800 mb-3'>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h4>
          
          <div className='space-y-3'>
            {selectedActivities.map(({ activity, date }, index) => (
              <div key={index} className='flex items-center gap-3'>
                <div className='flex-shrink-0 w-16 text-sm text-gray-600 font-medium'>
                  {formatTime(date)}
                </div>
                <div className='flex-shrink-0 w-2 h-2 bg-sky-400 rounded-full'></div>
                <div className='flex-grow bg-white rounded-md px-3 py-2 shadow-sm border'>
                  <span className='text-gray-800 font-medium'>{activity.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className='text-center py-8 text-gray-500'>
          <div className='text-4xl mb-2'>📅</div>
          <p>Select a date to view your activities</p>
        </div>
      )}
    </div>
  );
}