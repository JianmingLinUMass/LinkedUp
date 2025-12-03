export type Activity = {
    title: string; 
    time: string;
    location: string;
    creator: {
        username: string;
        avatar: string;
    }
    attendees: number;
    maxAttendees: number;
};

export type ActivityCreationFields = {
    title: string;
    location: string;
    time: string;
    date: string;
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

export function ActivityTable({items, onRowClick}: ActivityBox) {
    return (
        <div >
            <div className='rounded-md border divide-y'>
                {items.map(row => (
                    <div key={row.title + row.time} 
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

export function ActivityTableWithDeleteButton({items, onRowClick, onRequestDelete}: ActivityBox & { onRequestDelete?: (index: number) => void }) {
    function DeleteButton({onDelete}: {onDelete: () => void}) {
        return (
            <button onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }} 
                className='text-red-500 hover:text-red-700 font-bold text-2xl mr-1 w-8 h-8 rounded-full hover:bg-red-100'>
                x
            </button>
        )
    }
    return (
        <div >
            <div className='rounded-md border divide-y'>
                {items.map((row, index) => (
                    <div key={row.title + row.time} 
                        className='flex items-center justify-between px-3 py-3 text-sm md:text-base cursor-pointer'
                        onClick={() => onRowClick?.(row)}>
                        <span className='text-black'>{row.title}</span>

                        <div className='flex items-center gap-2'>
                            <span className='text-black'>{row.time}</span>
                            {onRequestDelete && (
                                <DeleteButton onDelete={() => onRequestDelete(index)} />
                            )}
                        </div>
                    </div>
                    )
                )}
            </div>
        </div>
    )
}