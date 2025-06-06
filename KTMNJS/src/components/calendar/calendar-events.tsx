'use client';

import { CalendarEvent } from '@/lib/services/calendar-service';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface CalendarEventsProps {
  events: CalendarEvent[];
  date: Date;
}

export function CalendarEvents({ events, date }: CalendarEventsProps) {
  // Filter events cho ngày được chọn
  const dateString = date.toISOString().split('T')[0];
  const eventsForDate = events.filter(event => {
    const eventDate = new Date(event.start).toISOString().split('T')[0];
    return eventDate === dateString;
  });

  console.log('CalendarEvents: Rendering events for date:', dateString, eventsForDate);

  if (eventsForDate.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Sự kiện - {format(date, 'dd/MM/yyyy', { locale: vi })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            Không có sự kiện nào trong ngày này
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Sự kiện - {format(date, 'dd/MM/yyyy', { locale: vi })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {eventsForDate.filter(event => event.id).map((event, index) => (
            <div
              key={event.id || `event-${index}`}
              className={`p-3 rounded-lg border ${
                event.completed ? 'bg-muted/50' : 'bg-card'
              }`}
              style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {event.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    )}
                    <h4 className={`font-medium ${
                      event.completed ? 'line-through text-muted-foreground' : ''
                    }`}>
                      {event.title}
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {event.end ? (
                        <span>
                          {format(new Date(event.start), 'HH:mm', { locale: vi })} - {' '}
                          {format(new Date(event.end), 'HH:mm', { locale: vi })}
                        </span>
                      ) : (
                        <span>
                          {format(new Date(event.start), 'HH:mm dd/MM', { locale: vi })}
                        </span>
                      )}
                    </div>
                    
                    <Badge variant="outline" className="text-xs">
                      {event.type === 'task' ? 'Công việc' : 'Khối thời gian'}
                    </Badge>
                  </div>
                  
                  {event.type === 'task' && (event.data as any).description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {(event.data as any).description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
