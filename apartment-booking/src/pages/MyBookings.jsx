import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import BookingCard from "../components/bookings/BookingCard";

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState("all");

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => base44.entities.Booking.list('-created_date'),
    initialData: [],
  });

  const { data: apartments, isLoading: apartmentsLoading } = useQuery({
    queryKey: ['apartments'],
    queryFn: () => base44.entities.Apartment.list(),
    initialData: [],
  });

  const filteredBookings = activeTab === "all" 
    ? bookings 
    : bookings.filter(booking => booking.status === activeTab);

  const getApartmentById = (id) => {
    return apartments.find(apt => apt.id === id);
  };

  const isLoading = bookingsLoading || apartmentsLoading;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
            Мои бронирования
          </h1>
          <p className="text-slate-600 text-lg">
            Управляйте своими поездками
          </p>
        </div>

        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
              <TabsTrigger value="all" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                Все
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                Ожидают
              </TabsTrigger>
              <TabsTrigger value="confirmed" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                Подтверждены
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">
                Завершены
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === "all" ? (
                <Calendar className="w-12 h-12 text-slate-400" />
              ) : (
                <Package className="w-12 h-12 text-slate-400" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {activeTab === "all" ? "У вас пока нет бронирований" : "Нет бронирований в этой категории"}
            </h3>
            <p className="text-slate-600">
              {activeTab === "all" ? "Начните путешествовать!" : "Попробуйте другие фильтры"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {filteredBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BookingCard 
                    booking={booking} 
                    apartment={getApartmentById(booking.apartment_id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}