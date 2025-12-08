export type Participant = {
    username: string;
    avatar: string;
}

export type Activity = {
    id: string;
    title: string; 
    time: string;
    location: string;
    creator: Participant;
    maxAttendees: number;
    participants: Participant[];
};

export type ActivityCreationFields = {
    title: string;
    location: string;
    timeAndDate: string;
    maxAttendees: number;
}

export type ActivityBox = {
    items: Activity[];
    onRowClick?: (row: Activity) => void;
}

export type ActivityPanelArgs = {
    activity: Activity;
    onCancel: () => void; 
    onJoin?: (row: Activity) => void
};

function sortActivityList(items: Activity[]) {
    return [...items].sort((row1, row2) => {
        const date1 = parseActivityTime(row1.time);
        const date2 = parseActivityTime(row2.time);
        return date1.getTime() - date2.getTime();
    });
}

export function ActivityTable({items, onRowClick}: ActivityBox) {
    return (
        <div >
            <div className='divide-y'>
                {sortActivityList(items).map(row => (
                    <div key={row.id} 
                        className='flex items-center justify-between px-3 py-3 text-sm md:text-base cursor-pointer'
                        onClick={() => onRowClick?.(row)}>
                        <span className='text-black'>{row.title}</span>
                        <span className='text-black'>{row.time}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function ActivityTableWithDeleteButton({items, onRowClick, onRequestDelete}: ActivityBox & { onRequestDelete?: (id: string) => void }) {
    function DeleteButton({onDelete}: {onDelete: () => void}) {
        return (
            <button onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }} 
                className='flex items-center justify-center text-red-500 hover:text-red-700 font-bold text-2xl mr-1 w-6 h-6 rounded-full hover:bg-red-100'>
                x
            </button>
        )
    }
    return (
        <div >
            <div className='divide-y'>
                {sortActivityList(items).map((row) => (
                    <div key={row.id} 
                        className='flex items-center justify-between px-3 py-3 text-sm md:text-base cursor-pointer'
                        onClick={() => onRowClick?.(row)}>
                        <span className='text-black'>{row.title}</span>

                        <div className='flex items-center gap-2'>
                            <span className='text-black'>{row.time}</span>
                            {onRequestDelete && (
                                <DeleteButton onDelete={() => onRequestDelete(row.id)} />
                            )}
                        </div>
                    </div>
                    )
                )}
            </div>
        </div>
    )
}

export function parseActivityTime(timeStr: string) {
  // Parse "7:00AM, 11/07/2025" format
  const [time, date] = timeStr.split(', ');
  const [month, day, year] = date.split('/');
  
  // Parse time
  const timeMatch = time.match(/(\d+):(\d+)(AM|PM)/);
  if (!timeMatch) return new Date(0);
  
  let hours = parseInt(timeMatch[1]);
  const minutes = parseInt(timeMatch[2]);
  const period = timeMatch[3];
  
  if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
  if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
  
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hours, minutes);
}