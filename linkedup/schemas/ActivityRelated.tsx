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
    onJoin: (row: Activity) => void
};

