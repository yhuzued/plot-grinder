import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Character, CharacterStatus, EventType, StoryEvent, StoryState } from './types';
import { cn, EVENT_COLORS, EVENT_BG_COLORS } from './utils';
import { 
  Plus, 
  Settings, 
  UserPlus, 
  Trash2, 
  GripVertical, 
  X, 
  Activity,
  FileText,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Reorder } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

// Initial Mock Data
const initialCharacters: Character[] = [
  { id: 'c1', name: 'John', color: '#3b82f6' },
  { id: 'c2', name: 'Sarah', color: '#ef4444' },
  { id: 'c3', name: 'Mike', color: '#10b981' },
  { id: 'c4', name: 'Emily', color: '#f59e0b' },
];

const initialEvents: StoryEvent[] = [
  {
    id: 'e1',
    title: 'Introduction',
    summary: 'The group arrives at the cabin.',
    location: 'The Cabin',
    tension: 2,
    type: 'Safe',
    charactersPresent: [
      { characterId: 'c1' },
      { characterId: 'c2' },
      { characterId: 'c3' },
      { characterId: 'c4' },
    ],
  },
  {
    id: 'e2',
    title: 'The Party',
    summary: 'Drinks and games. Someone hears a noise outside.',
    location: 'Living Room',
    tension: 4,
    type: 'Suspense',
    charactersPresent: [
      { characterId: 'c1' },
      { characterId: 'c2' },
      { characterId: 'c3' },
      { characterId: 'c4' },
    ],
  },
  {
    id: 'e3',
    title: 'First Blood',
    summary: 'Mike goes to check the generator and is attacked.',
    location: 'The Basement',
    tension: 8,
    type: 'Violence',
    charactersPresent: [
      { characterId: 'c3', statusChange: 'Injured' },
      { characterId: 'c1' },
    ],
  },
  {
    id: 'e4',
    title: 'Setback',
    summary: 'They realize the phones are dead and the cars are sabotaged.',
    location: 'Driveway',
    tension: 9,
    type: 'Setback',
    charactersPresent: [
      { characterId: 'c1' },
      { characterId: 'c2' },
      { characterId: 'c4' },
    ],
  },
];

export default function App() {
  const [timelines, setTimelines] = useState<Record<string, StoryEvent[]>>({
    'Main Timeline': initialEvents
  });
  const [currentTimelineId, setCurrentTimelineId] = useState<string>('Main Timeline');
  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  
  const events = timelines[currentTimelineId] || [];
  
  const setEvents = (newEvents: StoryEvent[]) => {
    setTimelines({
      ...timelines,
      [currentTimelineId]: newEvents
    });
  };

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showCharacterModal, setShowCharacterModal] = useState(false);

  // Calculate character statuses at each event
  const characterStatusesByEvent = useMemo(() => {
    const statuses: Record<string, Record<string, CharacterStatus>> = {};
    let currentStatuses: Record<string, CharacterStatus> = {};
    
    // Initialize all as Alive
    characters.forEach(c => {
      currentStatuses[c.id] = 'Alive';
    });

    events.forEach(event => {
      const newStatuses = { ...currentStatuses };
      event.charactersPresent.forEach(cp => {
        if (cp.statusChange) {
          newStatuses[cp.characterId] = cp.statusChange;
        }
      });
      statuses[event.id] = newStatuses;
      currentStatuses = newStatuses;
    });

    return statuses;
  }, [events, characters]);

  // Current global statuses (at the end of the timeline)
  const currentGlobalStatuses = events.length > 0 
    ? characterStatusesByEvent[events[events.length - 1].id] 
    : Object.fromEntries(characters.map(c => [c.id, 'Alive']));

  const handleAddEvent = () => {
    const newEvent: StoryEvent = {
      id: uuidv4(),
      title: 'New Event',
      summary: '',
      location: '',
      tension: 5,
      type: 'Safe',
      charactersPresent: [],
    };
    setEvents([...events, newEvent]);
    setSelectedEventId(newEvent.id);
  };

  const handleExportOutline = () => {
    let outline = `# PlotGrinder Outline\n\n`;
    
    events.forEach((event, index) => {
      outline += `## ${index + 1}. ${event.title} [${event.type}]\n`;
      outline += `**Location:** ${event.location || 'Unknown'} | **Time:** ${event.time || 'Unknown'} | **Tension:** ${event.tension}/10\n\n`;
      outline += `${event.summary || 'No summary provided.'}\n\n`;
      
      if (event.charactersPresent.length > 0) {
        outline += `**Characters Present:**\n`;
        event.charactersPresent.forEach(cp => {
          const char = characters.find(c => c.id === cp.characterId);
          if (char) {
            const statusChange = cp.statusChange ? ` -> ${cp.statusChange}` : '';
            outline += `- ${char.name}${statusChange}\n`;
          }
        });
        outline += `\n`;
      }
      outline += `---\n\n`;
    });

    const blob = new Blob([outline], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'story-outline.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddCharacter = () => {
    const newChar: Character = {
      id: uuidv4(),
      name: `Character ${characters.length + 1}`,
      color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`
    };
    setCharacters([...characters, newChar]);
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <div className="flex h-screen w-full bg-[#0A0A0A] text-[#E4E3E0] font-sans overflow-hidden">
      {/* Sidebar - Outline */}
      <div className="w-64 bg-[#111111] text-[#E4E3E0] flex flex-col border-r border-white/10 shrink-0 z-20">
        <div className="p-4 border-b border-white/10 shrink-0">
          <h1 className="text-xl font-bold tracking-tight text-red-500 uppercase flex items-center gap-2">
            <Activity className="w-5 h-5" />
            PlotGrinder
          </h1>
          <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">Story Outline</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="space-y-1">
            {events.map((event, index) => (
              <div 
                key={event.id}
                onClick={() => setSelectedEventId(event.id)}
                className={cn(
                  "p-2 rounded cursor-pointer text-sm border-l-2 transition-all group",
                  selectedEventId === event.id 
                    ? "bg-white/10 text-white border-red-500" 
                    : "hover:bg-white/5 text-white/50 border-transparent hover:border-white/20"
                )}
              >
                <div className="font-medium truncate text-white/90">{index + 1}. {event.title}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs opacity-60 truncate">{event.location || 'No location'}</span>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                    event.type === 'Safe' ? "bg-blue-500/20 text-blue-400" :
                    event.type === 'Suspense' ? "bg-yellow-500/20 text-yellow-400" :
                    event.type === 'Violence' ? "bg-red-500/20 text-red-400" :
                    event.type === 'Setback' ? "bg-gray-500/20 text-gray-400" :
                    "bg-purple-500/20 text-purple-400"
                  )}>{event.type}</span>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="text-sm text-white/40 italic text-center mt-4">No events yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="h-14 bg-[#111111] border-b border-white/10 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/5 rounded p-1">
              <select 
                value={currentTimelineId}
                onChange={(e) => {
                  setCurrentTimelineId(e.target.value);
                  setSelectedEventId(null);
                }}
                className="bg-transparent border-none text-sm font-bold text-white/90 focus:ring-0 cursor-pointer"
              >
                {Object.keys(timelines).map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
              <button 
                onClick={() => {
                  const newId = `${currentTimelineId} (Copy ${Object.keys(timelines).length})`;
                  setTimelines({
                    ...timelines,
                    [newId]: [...events]
                  });
                  setCurrentTimelineId(newId);
                }}
                className="px-2 py-1 text-xs bg-white/10 border border-white/10 rounded shadow-sm hover:bg-white/20 text-white/80 font-medium transition-colors"
                title="Duplicate Timeline"
              >
                Duplicate
              </button>
              <button 
                onClick={() => {
                  const newId = `New Story ${Object.keys(timelines).length + 1}`;
                  const templateEvents: StoryEvent[] = [
                    { id: uuidv4(), title: 'Introduction', summary: '', location: '', tension: 2, type: 'Safe', charactersPresent: [] },
                    { id: uuidv4(), title: 'The Party', summary: '', location: '', tension: 4, type: 'Suspense', charactersPresent: [] },
                    { id: uuidv4(), title: 'First Blood', summary: '', location: '', tension: 8, type: 'Violence', charactersPresent: [] },
                    { id: uuidv4(), title: 'Second Blood', summary: '', location: '', tension: 9, type: 'Violence', charactersPresent: [] },
                    { id: uuidv4(), title: 'Setback', summary: '', location: '', tension: 3, type: 'Setback', charactersPresent: [] },
                    { id: uuidv4(), title: 'Climax', summary: '', location: '', tension: 10, type: 'Resolution', charactersPresent: [] },
                  ];
                  setTimelines({
                    ...timelines,
                    [newId]: templateEvents
                  });
                  setCurrentTimelineId(newId);
                  setSelectedEventId(null);
                }}
                className="px-2 py-1 text-xs bg-white/10 border border-white/10 rounded shadow-sm hover:bg-white/20 text-white/80 font-medium transition-colors"
                title="New Story from Template"
              >
                + Template
              </button>
            </div>
            
            <div className="w-px h-6 bg-white/10"></div>

            <button 
              onClick={handleAddEvent}
              className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </button>
            <button 
              onClick={() => setShowCharacterModal(true)}
              className="flex items-center gap-2 bg-[#1A1A1A] border border-white/10 text-white/80 px-3 py-1.5 rounded text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <Users className="w-4 h-4" />
              Characters
            </button>
            <button 
              onClick={handleExportOutline}
              className="flex items-center gap-2 bg-[#1A1A1A] border border-white/10 text-white/80 px-3 py-1.5 rounded text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Export Outline
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Timeline Canvas */}
        <div className="flex-1 overflow-y-auto bg-[#0A0A0A] p-8 relative custom-scrollbar">
          <div className="max-w-4xl mx-auto relative">
            <div className="absolute top-0 bottom-0 left-[28px] w-0.5 bg-white/10 z-0"></div>
            
            <Reorder.Group 
              axis="y" 
              values={events} 
              onReorder={setEvents} 
              className="flex flex-col gap-6 relative z-10"
            >
              {events.map((event, index) => (
                <Reorder.Item 
                  key={event.id}
                  value={event}
                  onClick={() => setSelectedEventId(event.id)}
                  className="flex gap-6 group cursor-grab active:cursor-grabbing"
                >
                  {/* Timeline Node */}
                  <div className="relative flex flex-col items-center mt-4">
                    <div className={cn(
                      "w-14 h-14 rounded-full border-4 border-[#0A0A0A] flex items-center justify-center z-10 shadow-lg transition-transform group-hover:scale-110",
                      EVENT_BG_COLORS[event.type],
                      selectedEventId === event.id ? "ring-2 ring-red-500" : ""
                    )}>
                      <span className="font-bold text-lg text-white/90">{index + 1}</span>
                    </div>
                  </div>

                  {/* Event Card (Horizontal) */}
                  <div className={cn(
                    "flex-1 rounded-2xl border bg-[#111111] transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 overflow-hidden flex flex-col md:flex-row",
                    selectedEventId === event.id ? "border-red-500 ring-1 ring-red-500/50" : "border-white/10"
                  )}>
                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col gap-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                          <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded", EVENT_COLORS[event.type])}>{event.type}</span>
                          <div className="flex items-center gap-1.5 text-xs text-white/50 font-medium">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">{event.location || 'Unknown Location'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div 
                                key={i} 
                                className={cn(
                                  "w-1.5 h-3 rounded-sm",
                                  i < Math.ceil(event.tension / 2) ? "bg-white/80" : "bg-white/20"
                                )}
                              />
                            ))}
                          </div>
                          <GripVertical className="w-4 h-4 opacity-50" />
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-xl leading-tight text-white/90">{event.title}</h3>
                      <p className="text-sm text-white/60 line-clamp-2 mt-1">
                        {event.summary || 'No summary provided.'}
                      </p>
                    </div>
                    
                    {/* Characters Section */}
                    <div className="p-5 bg-white/5 border-t md:border-t-0 md:border-l border-white/10 md:w-64 flex flex-col justify-center">
                      <div className="flex items-center gap-1.5 mb-3">
                        <Users className="w-3 h-3 text-white/40" />
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">In Scene</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {event.charactersPresent.map(cp => {
                          const char = characters.find(c => c.id === cp.characterId);
                          if (!char) return null;
                          
                          // Get status AT THIS EVENT
                          const statusAtEvent = characterStatusesByEvent[event.id]?.[char.id] || 'Alive';
                          const isDead = statusAtEvent === 'Dead';
                          
                          return (
                            <div 
                              key={cp.characterId}
                              className={cn(
                                "inline-block w-8 h-8 rounded-full ring-2 ring-[#1A1A1A] flex items-center justify-center text-xs font-bold text-white relative",
                                isDead && "grayscale opacity-60"
                              )}
                              style={{ backgroundColor: char.color }}
                              title={`${char.name} (${statusAtEvent})`}
                            >
                              {char.name.charAt(0)}
                              {isDead && (
                                <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-sm drop-shadow-md">
                                  X
                                </div>
                              )}
                              {cp.statusChange && !isDead && (
                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-1 ring-[#1A1A1A]" />
                              )}
                            </div>
                          );
                        })}
                        {event.charactersPresent.length === 0 && (
                          <span className="text-xs text-white/30 italic">No characters</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Reorder.Item>
              ))}
              
              {/* Add Event Placeholder */}
              <div className="flex gap-6">
                <div className="relative flex flex-col items-center mt-4">
                  <div className="w-14 h-14 rounded-full border-4 border-[#0A0A0A] bg-white/5 flex items-center justify-center z-10 text-white/40">
                    <Plus className="w-6 h-6" />
                  </div>
                </div>
                <button 
                  onClick={handleAddEvent}
                  className="flex-1 h-32 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center text-white/40 hover:text-white/80 hover:border-white/40 hover:bg-white/10 transition-all group"
                >
                  <span className="font-bold uppercase tracking-wider text-sm">Add Event</span>
                </button>
              </div>
            </Reorder.Group>
          </div>
        </div>

        {/* Tension Graph Bottom Panel */}
        <div className="h-32 bg-[#111111] border-t border-white/10 shrink-0 p-3 flex flex-col">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Tension Graph</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={events} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorTension" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="title" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#888' }} 
                  dy={10}
                />
                <YAxis 
                  domain={[0, 10]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#888' }} 
                  ticks={[0, 2, 4, 6, 8, 10]}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111' }}
                />
                <ReferenceLine y={5} stroke="#f0f0f0" strokeDasharray="3 3" />
                <Area 
                  type="monotone" 
                  dataKey="tension" 
                  stroke="#ef4444" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorTension)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#ef4444' }}
                  animationDuration={500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111111] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-white/10">
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#1A1A1A] rounded-t-2xl">
              <div className="flex items-center gap-4">
                <h2 className="font-bold text-xl text-white/90">Edit Event</h2>
                <div className="flex items-center bg-[#111111] border border-white/10 rounded-md shadow-sm overflow-hidden">
                  <button 
                    onClick={() => {
                      const idx = events.findIndex(e => e.id === selectedEvent.id);
                      if (idx > 0) setSelectedEventId(events[idx - 1].id);
                    }}
                    disabled={events.findIndex(e => e.id === selectedEvent.id) === 0}
                    className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors border-r border-white/10"
                    title="Previous Event"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      const idx = events.findIndex(e => e.id === selectedEvent.id);
                      if (idx < events.length - 1) setSelectedEventId(events[idx + 1].id);
                    }}
                    disabled={events.findIndex(e => e.id === selectedEvent.id) === events.length - 1}
                    className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    title="Next Event"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEventId(null)}
                className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">Event Title</label>
              <input 
                type="text" 
                value={selectedEvent.title}
                onChange={(e) => {
                  setEvents(events.map(ev => ev.id === selectedEvent.id ? { ...ev, title: e.target.value } : ev));
                }}
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-medium"
                placeholder="e.g., The Party"
              />
            </div>

            {/* Type & Tension Row */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">Type</label>
                <select 
                  value={selectedEvent.type}
                  onChange={(e) => {
                    setEvents(events.map(ev => ev.id === selectedEvent.id ? { ...ev, type: e.target.value as EventType } : ev));
                  }}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="Safe">Safe (Blue)</option>
                  <option value="Suspense">Suspense (Yellow)</option>
                  <option value="Violence">Violence (Red)</option>
                  <option value="Setback">Setback (Black)</option>
                  <option value="Resolution">Resolution (Purple)</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">
                  Tension ({selectedEvent.tension})
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={selectedEvent.tension}
                  onChange={(e) => {
                    setEvents(events.map(ev => ev.id === selectedEvent.id ? { ...ev, tension: parseInt(e.target.value) } : ev));
                  }}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer mt-3 accent-red-500"
                />
              </div>
            </div>

            {/* Location & Time */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Location
                </label>
                <input 
                  type="text" 
                  value={selectedEvent.location}
                  onChange={(e) => {
                    setEvents(events.map(ev => ev.id === selectedEvent.id ? { ...ev, location: e.target.value } : ev));
                  }}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  placeholder="e.g., The Cabin"
                />
              </div>
              <div className="w-1/3">
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Time
                </label>
                <input 
                  type="text" 
                  value={selectedEvent.time || ''}
                  onChange={(e) => {
                    setEvents(events.map(ev => ev.id === selectedEvent.id ? { ...ev, time: e.target.value } : ev));
                  }}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  placeholder="9:00 PM"
                />
              </div>
            </div>

            {/* Summary */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider">Event Summary</label>
              </div>
              <textarea 
                value={selectedEvent.summary}
                onChange={(e) => {
                  setEvents(events.map(ev => ev.id === selectedEvent.id ? { ...ev, summary: e.target.value } : ev));
                }}
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-white/10 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm h-32 resize-none"
                placeholder="What actually happens in this scene?"
              />
            </div>

            {/* Characters Present & Status Changes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider">Characters in Scene</label>
              </div>
              
              <div className="space-y-2 border border-white/10 rounded-md p-2 bg-[#1A1A1A]">
                {characters.map(char => {
                  const isPresent = selectedEvent.charactersPresent.some(cp => cp.characterId === char.id);
                  const cpData = selectedEvent.charactersPresent.find(cp => cp.characterId === char.id);
                  
                  return (
                    <div key={char.id} className="flex flex-col gap-2 p-2 bg-[#111111] rounded border border-white/5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={isPresent}
                            onChange={(e) => {
                              let newCp = [...selectedEvent.charactersPresent];
                              if (e.target.checked) {
                                newCp.push({ characterId: char.id });
                              } else {
                                newCp = newCp.filter(cp => cp.characterId !== char.id);
                              }
                              setEvents(events.map(ev => ev.id === selectedEvent.id ? { ...ev, charactersPresent: newCp } : ev));
                            }}
                            className="w-4 h-4 text-red-600 rounded border-white/20 bg-[#1A1A1A] focus:ring-red-500 focus:ring-offset-[#111111]"
                          />
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ backgroundColor: char.color }}
                          >
                            {char.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-white/90">{char.name}</span>
                        </div>
                        
                        {isPresent && (
                          <select
                            value={cpData?.statusChange || ''}
                            onChange={(e) => {
                              const val = e.target.value as CharacterStatus | '';
                              const newCp = selectedEvent.charactersPresent.map(cp => 
                                cp.characterId === char.id 
                                  ? { ...cp, statusChange: val ? val : undefined } 
                                  : cp
                              );
                              setEvents(events.map(ev => ev.id === selectedEvent.id ? { ...ev, charactersPresent: newCp } : ev));
                            }}
                            className={cn(
                              "text-xs border-white/10 rounded focus:ring-red-500 focus:border-red-500 py-1 pl-2 pr-6",
                              cpData?.statusChange === 'Dead' ? "text-red-400 font-bold bg-red-500/10" :
                              cpData?.statusChange === 'Injured' ? "text-orange-400 font-medium bg-orange-500/10" :
                              cpData?.statusChange === 'Missing' ? "text-yellow-400 font-medium bg-yellow-500/10" :
                              "text-white/50 bg-[#1A1A1A]"
                            )}
                          >
                            <option value="">No Status Change</option>
                            <option value="Alive">Alive (Recovered)</option>
                            <option value="Injured">Injured</option>
                            <option value="Missing">Missing</option>
                            <option value="Dead">Killed</option>
                          </select>
                        )}
                      </div>
                      
                      {isPresent && (
                        <div className="pl-8 pr-2">
                          <input 
                            type="text" 
                            value={cpData?.itemsFound?.join(', ') || ''}
                            onChange={(e) => {
                              const items = e.target.value.split(',').map(i => i.trim()).filter(Boolean);
                              const newCp = selectedEvent.charactersPresent.map(cp => 
                                cp.characterId === char.id 
                                  ? { ...cp, itemsFound: items.length > 0 ? items : undefined } 
                                  : cp
                              );
                              setEvents(events.map(ev => ev.id === selectedEvent.id ? { ...ev, charactersPresent: newCp } : ev));
                            }}
                            className="w-full px-2 py-1 text-xs border border-white/10 rounded bg-[#1A1A1A] text-white focus:bg-[#222222] focus:ring-1 focus:ring-red-500"
                            placeholder="Clues/Items found (comma separated)"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Delete Event */}
            <div className="pt-4 border-t border-white/10">
              <button 
                onClick={() => {
                  setEvents(events.filter(e => e.id !== selectedEvent.id));
                  setSelectedEventId(null);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-red-500/30 text-red-500 rounded-md hover:bg-red-500/10 transition-colors text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Delete Event
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Character Manager Modal */}
      {showCharacterModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111111] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col border border-white/10">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="font-bold text-xl text-white/90 flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" />
                Character Roster
              </h2>
              <button 
                onClick={() => setShowCharacterModal(false)}
                className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 border-b border-white/5 bg-[#1A1A1A] flex justify-between items-center">
              <p className="text-sm text-white/50">Manage your story's characters. Characters can be assigned to events to track their status.</p>
              <button 
                onClick={handleAddCharacter}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
              >
                <UserPlus className="w-4 h-4" />
                Add Character
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {characters.map(char => {
                  const status = currentGlobalStatuses[char.id] || 'Alive';
                  const isDead = status === 'Dead';
                  const isMissing = status === 'Missing';
                  const isInjured = status === 'Injured';
                  
                  return (
                    <div key={char.id} className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-[#1A1A1A] shadow-sm group hover:border-white/20 transition-colors">
                      <div className="relative shrink-0">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-inner ring-2 ring-[#111111]"
                          style={{ backgroundColor: char.color }}
                        >
                          {char.name.charAt(0)}
                        </div>
                        {isDead && (
                          <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-3xl drop-shadow-md">
                            X
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={char.name}
                          onChange={(e) => {
                            setCharacters(characters.map(c => c.id === char.id ? { ...c, name: e.target.value } : c));
                          }}
                          className={cn(
                            "w-full bg-transparent text-base font-bold text-white/90 truncate focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-1 -ml-1",
                            isDead && "line-through decoration-red-500 decoration-2 opacity-50"
                          )}
                        />
                        <div className={cn(
                          "text-xs font-mono mt-1 font-medium",
                          status === 'Alive' ? "text-green-400" :
                          status === 'Injured' ? "text-orange-400" :
                          status === 'Missing' ? "text-yellow-400" :
                          "text-red-500"
                        )}>
                          {status}
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setCharacters(characters.filter(c => c.id !== char.id));
                          setEvents(events.map(ev => ({
                            ...ev,
                            charactersPresent: ev.charactersPresent.filter(cp => cp.characterId !== char.id)
                          })));
                        }}
                        className="p-1.5 text-white/30 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Character"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
                {characters.length === 0 && (
                  <div className="col-span-full text-center py-12 text-white/40 italic">
                    No characters yet. Add one to get started.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
