import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";

export default function ApartmentFilters({ filters, onFilterChange }) {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-lg text-slate-900">Фильтры</h3>
        </div>
        
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-3 block">
              Максимальная цена: {filters.maxPrice?.toLocaleString('ru-RU')} ₽
            </Label>
            <Slider
              value={[filters.maxPrice || 15000]}
              onValueChange={([value]) => onFilterChange({ ...filters, maxPrice: value })}
              max={30000}
              min={1000}
              step={500}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-3 block">
              Количество спален
            </Label>
            <Select
              value={filters.bedrooms || "all"}
              onValueChange={(value) => onFilterChange({ ...filters, bedrooms: value })}
            >
              <SelectTrigger className="bg-white border-slate-200">
                <SelectValue placeholder="Любое" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Любое количество</SelectItem>
                <SelectItem value="1">1 спальня</SelectItem>
                <SelectItem value="2">2 спальни</SelectItem>
                <SelectItem value="3">3 спальни</SelectItem>
                <SelectItem value="4">4+ спальни</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}