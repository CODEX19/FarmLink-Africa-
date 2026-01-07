
import React, { useState, useEffect } from 'react';
import { CalendarEvent, UserProfile, OfflineAction } from './types.ts';
import { getCalendarSuggestions } from './geminiService.ts';
import { Icons } from '../constants.tsx';

interface FarmingCalendarProps {
  user: UserProfile;
  isOnline: boolean;
}

interface ParsedSuggestion {
  category: string;
  task: string;
  advice: string;
  timing: string;
}

const FarmingCalendar: React.FC<FarmingCalendarProps> = ({ user, isOnline }) => {
  const [suggestions, setSuggestions] = useState<ParsedSuggestion[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDataLive, setIsDataLive] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'maintenance' as CalendarEvent['type'], description: '' });

  const parseAISuggestions = (text: string): ParsedSuggestion[] => {
    const sections = text.split(/\d\./).filter(s => s.trim().length > 0);
    const parsed: ParsedSuggestion[] = [];

    sections.forEach(section => {
      const categoryMatch = section.match(/CATEGORY:\s*(.*)/i);
      const taskMatch = section.match(/TASK:\s*(.*)/i);
      const adviceMatch = section.match(/DETAILED ADVICE:\s*([\s\S]*?)(?=TIMING:|$)/i);
      const timingMatch = section.match(/TIMING:\s*(.*)/i);

      if (categoryMatch || taskMatch) {
        parsed.push({
          category: categoryMatch ? categoryMatch[1].trim() : 'General',
          task: taskMatch ? taskMatch[1].trim() : 'Agricultural Strategy',
          advice: adviceMatch ? adviceMatch[1].trim() : section.trim(),
          timing: timingMatch ? timingMatch[1].trim() : 'TBD'
        });
      }
    });

    if (parsed.length === 0 && text.length > 50) {
      return [{
        category: 'Market',
        task: 'Regional Strategy Update',
        advice: text,
        timing: 'Immediate'
      }];
    }

    return parsed;
  };

  useEffect(() => {
    const cachedEvents = localStorage.getItem('farmlink_calendar_events');
    const cachedSuggestions = localStorage.getItem('farmlink_calendar_suggestions');

    if (cachedEvents) {
      setEvents(JSON.parse(cachedEvents));
    } else {
      const initialEvents: CalendarEvent[] = [
        { id: '1', title: 'Start Maize Planting', date: '2025-03-12', type: 'planting', description: 'Early season planting for Nakuru region.' },
        { id: '2', title: 'Local Hub Market Day', date: '2025-03-15', type: 'market', description: 'Major trading day at Central Nakuru Hub.' },
        { id: '3', title: 'Vegetable Maintenance', date: '2025-03-18', type: 'maintenance', description: 'Scheduled fertilization for green leafy crops.' },
      ];
      setEvents(initialEvents);
      localStorage.setItem('farmlink_calendar_events', JSON.stringify(initialEvents));
    }

    if (cachedSuggestions) {
      setSuggestions(parseAISuggestions(cachedSuggestions));
      setLoading(false);
    }

    if (!isOnline) return;

    const fetchSuggestions = async () => {
      setLoading(true);
      const result = await getCalendarSuggestions(user.location, ['Maize', 'Vegetables']);
      setSuggestions(parseAISuggestions(result));
      localStorage.setItem('farmlink_calendar_suggestions', result);
      setIsDataLive(true);
      setLoading(false);
    };

    fetchSuggestions();

    const handleSyncComplete = () => {
      setEvents(prev => {
        const updated = prev.map(e => ({ ...e, isPending: false }));
        localStorage.setItem('farmlink_calendar_events', JSON.stringify(updated));
        return updated;
      });
    };

    window.addEventListener('farmlink_sync_complete', handleSyncComplete);
    return () => window.removeEventListener('farmlink_sync_complete', handleSyncComplete);
  }, [user.location, isOnline]);

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) return;

    const event: CalendarEvent = {
      id: Date.now().toString(),
      ...newEvent,
      isPending: !isOnline
    };

    const updatedEvents = [...events, event].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setEvents(updatedEvents);
    localStorage.setItem('farmlink_calendar_events', JSON.stringify(updatedEvents));

    if (!isOnline) {
      const queueJson = localStorage.getItem('farmlink_sync_queue') || '[]';
      const queue: OfflineAction[] = JSON.parse(queueJson);
      queue.push({
        id: event.id,
        type: 'create_event',
        payload: event,
        timestamp: Date.now()
      });
      localStorage.setItem('farmlink_sync_queue', JSON.stringify(queue));
    }

    setShowAddModal(false);
    setNewEvent({ title: '', date: '', type: 'maintenance', description: '' });
  };

  const getBadgeColor = (type: CalendarEvent['type'] | string) => {
    const t = type.toLowerCase();
    if (t.includes('planting')) return 'bg-emerald-100 text-emerald-700';
    if (t.includes('harvesting')) return 'bg-amber-100 text-amber-700';
    if (t.includes('market')) return 'bg-blue-100 text-blue-700';
    if (t.includes('maintenance')) return 'bg-slate-100 text-slate-700';
    return 'bg-slate-50 text-slate-500';
  };

  const getCategoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes('planting')) return <Icons.Leaf className="w-8 h-8 text-emerald-500" />;
    if (c.includes('harvesting')) return <Icons.Wheat className="w-8 h-8 text-amber-600" />;
    if (c.includes('market')) return <Icons.Shop className="w-8 h-8 text-blue-500" />;
    if (c.includes('maintenance')) return <Icons.Wrench className="w-8 h-8 text-slate-500" />;
    return <Icons.Sparkles className="w-8 h-8 text-indigo-500" />;
  };

  const syncToNativeCalendar = (eventList: CalendarEvent[]) => {
    if (eventList.length === 0) return;

    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//FarmLink Africa//NONSGML v1.0//EN\n";
    eventList.forEach(event => {
      const date = new Date(event.date).toISOString().replace(/-|:|\.\d+/g, "");
      icsContent += "BEGIN:VEVENT\n";
      icsContent += `UID:${event.id}@farmlink.africa\n`;
      icsContent += `DTSTAMP:${date}\n`;
      icsContent += `DTSTART:${date.split('T')[0]}T080000Z\n`;
      icsContent += `DTEND:${date.split('T')[0]}T170000Z\n`;
      icsContent += `SUMMARY:FarmLink: ${event.title}\n`;
      icsContent += `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}\n`;
      icsContent += "END:VEVENT\n";
    });
    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', eventList.length === 1 ? `${eventList[0].title}.ics` : 'farmlink_calendar.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">Farming Calendar</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Plan your season with data-driven precision.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {!isOnline && (
            <div className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 tracking-widest">Offline Mode</span>
            </div>
          )}
          <button 
            onClick={() => syncToNativeCalendar(events)}
            className="px-5 py-2.5 bg-slate-900 dark:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-800 dark:hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-xl active:scale-95"
          >
            <Icons.Download className="w-4 h-4" />
            Neural Sync All
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white">Your Roadmap</h3>
              <button 
                onClick={() => setShowAddModal(true)}
                className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl transition-colors uppercase tracking-widest"
              >
                + New Node
              </button>
            </div>
            
            <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-[600px] overflow-y-auto custom-scrollbar">
              {events.length > 0 ? (
                events.map((event) => (
                  <div key={event.id} className={`p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center gap-4 group ${event.isPending ? 'opacity-70 grayscale-[0.3]' : ''}`}>
                    <div className="flex-shrink-0 text-center sm:w-16">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{new Date(event.date).toLocaleString('default', { month: 'short' })}</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{new Date(event.date).getDate()}</p>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getBadgeColor(event.type)}`}>
                          {event.type}
                        </span>
                        <h4 className="font-bold text-slate-800 dark:text-white">{event.title}</h4>
                        {event.isPending && (
                          <span className="flex items-center gap-1 text-[10px] text-amber-500 font-bold uppercase ml-2">
                            <Icons.Clock className="w-3 h-3 animate-spin" />
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{event.description}</p>
                    </div>
                    <button 
                      onClick={() => syncToNativeCalendar([event])}
                      className="opacity-0 group-hover:opacity-100 w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-slate-400 hover:text-emerald-600"
                      title="Sync to device calendar"
                    >
                      <Icons.Download className="w-5 h-5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-400 font-medium">No events scheduled in the current matrix.</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 flex flex-col sm:flex-row items-center gap-8 group">
             <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/20 rounded-3xl flex items-center justify-center flex-shrink-0 shadow-inner transition-transform group-hover:scale-110">
                <Icons.CloudSun className="w-16 h-16 text-emerald-600" />
             </div>
             <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Meteorological Intelligence</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
                  Regional telemetry indicates moderate precipitation in the upcoming cycle. Optimal fertilizer application windows are opening.
                </p>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl min-h-[600px] flex flex-col border border-white/5">
             <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Icons.Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold leading-none tracking-tight">Expert Strategy</h3>
                      <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mt-1">
                        {isDataLive ? 'Live Uplink' : 'Cached Node'}
                      </p>
                    </div>
                  </div>
                  {loading && <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>}
                </div>
                
                <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                   {loading && suggestions.length === 0 ? (
                     <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="space-y-3 bg-white/5 p-5 rounded-[1.5rem] border border-white/10 animate-pulse">
                             <div className="h-3 bg-white/10 rounded w-1/4"></div>
                             <div className="h-5 bg-white/20 rounded w-3/4"></div>
                          </div>
                        ))}
                     </div>
                   ) : suggestions.length > 0 ? (
                     suggestions.map((s, idx) => (
                       <div key={idx} className="bg-white/5 p-6 rounded-[1.5rem] border border-white/10 hover:bg-white/10 transition-all group hover:border-emerald-500/30">
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${getBadgeColor(s.category).replace('bg-','bg-opacity-20 bg-')}`}>
                              {s.category}
                            </span>
                            <div className="group-hover:scale-125 transition-transform duration-300">
                              {getCategoryIcon(s.category)}
                            </div>
                          </div>
                          <h4 className="text-sm font-bold text-white mb-2 leading-snug">{s.task}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed mb-4">
                             {s.advice}
                          </p>
                          <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                            <div className="flex items-center gap-2">
                               <Icons.Clock className="w-4 h-4 text-emerald-400" />
                               <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">{s.timing}</span>
                            </div>
                            <button 
                              onClick={() => {
                                const tempEvent: CalendarEvent = {
                                  id: `ai-${idx}`,
                                  title: s.task,
                                  date: new Date().toISOString().split('T')[0], // AI suggestion for today or generic
                                  type: s.category.toLowerCase() as any,
                                  description: s.advice
                                };
                                syncToNativeCalendar([tempEvent]);
                              }}
                              className="text-[9px] font-black text-emerald-500 hover:text-emerald-400 transition-colors uppercase tracking-widest"
                            >
                              Push to Native
                            </button>
                          </div>
                       </div>
                     ))
                   ) : (
                    <div className="text-center py-20 opacity-50">
                      <p className="text-sm font-bold">No strategic data streams found.</p>
                    </div>
                   )}
                </div>
             </div>
             <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative animate-in zoom-in-95 border border-slate-100 dark:border-slate-800">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Schedule New Protocol</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Title</label>
                <input 
                  type="text" 
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none font-bold dark:text-white"
                  placeholder="e.g., Seasonal Soil Analysis"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Execution Date</label>
                <input 
                  type="date" 
                  value={newEvent.date}
                  onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none font-bold dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <select 
                  value={newEvent.type}
                  onChange={e => setNewEvent({...newEvent, type: e.target.value as any})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none font-bold dark:text-white"
                >
                  <option value="planting">Planting</option>
                  <option value="harvesting">Harvesting</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="market">Market Stream</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Intel</label>
                <textarea 
                  value={newEvent.description}
                  onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none font-medium h-24 dark:text-white"
                  placeholder="Detailed instructions for field units..."
                />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddEvent}
                className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg glow-green"
              >
                Commit Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmingCalendar;
