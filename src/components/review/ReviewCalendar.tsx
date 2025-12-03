import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon 
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReviewDay {
  date: string;
  count: number;
}

interface ReviewCalendarProps {
  reviewDays: ReviewDay[];
  onDayClick?: (date: Date) => void;
}

export const ReviewCalendar = ({ reviewDays, onDayClick }: ReviewCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Pad the beginning with empty cells
  const startDay = monthStart.getDay();
  const paddedDays = Array(startDay).fill(null).concat(days);
  
  const getReviewCount = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const found = reviewDays.find(r => r.date === dateStr);
    return found?.count || 0;
  };
  
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <CalendarIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Calendário de Revisões</h3>
            <p className="text-sm text-muted-foreground">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {paddedDays.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }
          
          const count = getReviewCount(day);
          const isCurrentDay = isToday(day);
          const hasReviews = count > 0;
          const isPast = day < new Date() && !isToday(day);
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick?.(day)}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center
                text-sm transition-all relative
                ${isCurrentDay ? 'bg-primary text-primary-foreground font-bold ring-2 ring-primary ring-offset-2' : ''}
                ${!isCurrentDay && hasReviews ? 'bg-warning/20 text-warning-foreground hover:bg-warning/30' : ''}
                ${!isCurrentDay && !hasReviews && !isPast ? 'hover:bg-muted/50' : ''}
                ${isPast && !hasReviews ? 'text-muted-foreground' : ''}
              `}
            >
              <span>{format(day, 'd')}</span>
              {hasReviews && (
                <span className={`text-[10px] font-semibold ${isCurrentDay ? 'text-primary-foreground' : 'text-warning'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 pt-4 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary" />
          <span>Hoje</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-warning/50" />
          <span>Com revisões</span>
        </div>
      </div>
    </Card>
  );
};
