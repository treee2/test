import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, MapPin, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const statusColors = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  completed: "bg-slate-100 text-slate-800 border-slate-200"
};

const statusLabels = {
  pending: "Ожидает подтверждения",
  confirmed: "Подтверждено",
  cancelled: "Отменено",
  completed: "Завершено"
};

export default function BookingCard({ booking, apartment }) {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-xl font-bold text-slate-900">
            {apartment?.title || "Загрузка..."}
          </CardTitle>
          <Badge className={`${statusColors[booking.status]} border font-semibold`}>
            {statusLabels[booking.status]}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {apartment?.address && (
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span className="text-sm">{apartment.address}</span>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Заезд</p>
              <p className="text-sm font-semibold text-slate-900">
                {format(new Date(booking.check_in), "d MMM yyyy", { locale: ru })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Выезд</p>
              <p className="text-sm font-semibold text-slate-900">
                {format(new Date(booking.check_out), "d MMM yyyy", { locale: ru })}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-600">
            <Users className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium">{booking.guests} гостей</span>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-600" />
            <span className="text-lg font-bold text-slate-900">
              {booking.total_price?.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}