import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ArrowLeft,
  Bed,
  Bath,
  Users,
  MapPin,
  Wifi,
  Tv,
  Wind,
  Car,
  CalendarIcon,
  CheckCircle2
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ru } from "date-fns/locale";

const amenityIcons = {
  "Wi-Fi": Wifi,
  "ТВ": Tv,
  "Кондиционер": Wind,
  "Парковка": Car,
};

export default function ApartmentDetails() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const apartmentId = urlParams.get('id');

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const { data: apartment, isLoading } = useQuery({
    queryKey: ['apartment', apartmentId],
    queryFn: async () => {
      const apartments = await base44.entities.Apartment.filter({ id: apartmentId });
      return apartments[0];
    },
    enabled: !!apartmentId,
  });

  const createBookingMutation = useMutation({
    mutationFn: (bookingData) => base44.entities.Booking.create(bookingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      navigate(createPageUrl("MyBookings"));
    },
  });

  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut || !apartment) return 0;
    const nights = differenceInDays(new Date(checkOut), new Date(checkIn));
    return nights * apartment.price_per_night;
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) return;

    await createBookingMutation.mutateAsync({
      apartment_id: apartmentId,
      check_in: format(checkIn, 'yyyy-MM-dd'),
      check_out: format(checkOut, 'yyyy-MM-dd'),
      guests,
      total_price: calculateTotalPrice(),
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      special_requests: specialRequests,
      status: "pending"
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Квартира не найдена</h2>
          <Button onClick={() => navigate(createPageUrl("Apartments"))}>
            Вернуться к каталогу
          </Button>
        </div>
      </div>
    );
  }

  const nights = checkIn && checkOut ? differenceInDays(new Date(checkOut), new Date(checkIn)) : 0;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Apartments"))}
          className="mb-6 hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к квартирам
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={apartment.image_filename 
                  ? `/images/apartments/${apartment.image_filename}` 
                  : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"}
                alt={apartment.title}
                onError={(e) => {
                  // Если локальное изображение не найдено, показываем изображение из интернета
                  e.target.src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800";
                }}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
              {!apartment.is_available && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                  <Badge className="bg-red-500 text-white border-0 shadow-xl px-6 py-3 text-lg">
                    Забронировано
                  </Badge>
                </div>
              )}
            </div>

            {/* Details */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  {apartment.title}
                </h1>

                {apartment.address && (
                  <div className="flex items-center gap-2 text-slate-600 mb-6">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    <span className="text-lg">{apartment.address}</span>
                  </div>
                )}

                <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-indigo-600" />
                    <span className="font-semibold">{apartment.bedrooms} спален</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5 text-indigo-600" />
                    <span className="font-semibold">{apartment.bathrooms || 1} ванных</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <span className="font-semibold">до {apartment.max_guests || 2} гостей</span>
                  </div>
                </div>

                {apartment.description && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-3">Описание</h2>
                    <p className="text-slate-600 leading-relaxed">{apartment.description}</p>
                  </div>
                )}

                {apartment.amenities && apartment.amenities.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Удобства</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {apartment.amenities.map((amenity, index) => {
                        const Icon = amenityIcons[amenity] || CheckCircle2;
                        return (
                          <div key={index} className="flex items-center gap-2 text-slate-600">
                            <Icon className="w-5 h-5 text-indigo-600" />
                            <span>{amenity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl sticky top-4">
              <CardContent className="p-6">
                <div className="text-center mb-6 pb-6 border-b border-slate-200">
                  <div className="text-3xl font-bold text-slate-900">
                    {apartment.price_per_night?.toLocaleString('ru-RU')} ₽
                  </div>
                  <div className="text-slate-600">за ночь</div>
                </div>

                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <Label className="font-semibold mb-2 block">Даты</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {checkIn ? format(checkIn, "d MMM", { locale: ru }) : "Заезд"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={checkIn}
                            onSelect={setCheckIn}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {checkOut ? format(checkOut, "d MMM", { locale: ru }) : "Выезд"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={checkOut}
                            onSelect={setCheckOut}
                            disabled={(date) => date <= (checkIn || new Date())}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="guests" className="font-semibold mb-2 block">Количество гостей</Label>
                    <Input
                      id="guests"
                      type="number"
                      min="1"
                      max={apartment.max_guests || 10}
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="name" className="font-semibold mb-2 block">Ваше имя</Label>
                    <Input
                      id="name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="font-semibold mb-2 block">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="font-semibold mb-2 block">Телефон</Label>
                    <Input
                      id="phone"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="requests" className="font-semibold mb-2 block">Особые пожелания</Label>
                    <Textarea
                      id="requests"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {checkIn && checkOut && nights > 0 && (
                    <div className="bg-indigo-50 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">
                          {apartment.price_per_night?.toLocaleString('ru-RU')} ₽ × {nights} ночей
                        </span>
                        <span className="font-semibold">
                          {(apartment.price_per_night * nights).toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-indigo-200">
                        <span>Итого</span>
                        <span>{calculateTotalPrice().toLocaleString('ru-RU')} ₽</span>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-6 text-lg shadow-lg shadow-indigo-500/30"
                    disabled={!checkIn || !checkOut || !apartment.is_available || createBookingMutation.isPending}
                  >
                    {createBookingMutation.isPending ? "Бронируем..." : "Забронировать"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}