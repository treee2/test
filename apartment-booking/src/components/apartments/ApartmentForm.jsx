import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, MapPin, DollarSign, Upload, Image as ImageIcon, CheckCircle2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const AMENITIES_OPTIONS = [
  "Wi-Fi",
  "ТВ",
  "Кондиционер",
  "Парковка",
  "Кухня",
  "Стиральная машина",
  "Балкон",
  "Лифт"
];

export default function ApartmentForm({ onSuccess, onCancel }) {
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    price_per_night: "",
    bedrooms: "",
    bathrooms: "",
    max_guests: "",
    image_url: "",
    amenities: [],
    is_available: true
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, image_url: file_url }));
    } catch (error) {
      console.error("Error uploading file:", error);
    }
    setIsUploading(false);
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      price_per_night: parseFloat(formData.price_per_night),
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      max_guests: parseInt(formData.max_guests)
    };

    onSuccess(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <CardTitle className="text-xl">Основная информация</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title" className="font-semibold">Название квартиры *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Уютная студия в центре"
              className="mt-2"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="font-semibold">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Расскажите о вашей квартире..."
              rows={4}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="address" className="font-semibold">Адрес</Label>
            <div className="relative mt-2">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Москва, улица Пушкина, 10"
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            <CardTitle className="text-xl">Характеристики и цена</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price_per_night" className="font-semibold">Цена за ночь (₽) *</Label>
              <Input
                id="price_per_night"
                type="number"
                min="0"
                step="100"
                value={formData.price_per_night}
                onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                placeholder="5000"
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="bedrooms" className="font-semibold">Количество спален *</Label>
              <Input
                id="bedrooms"
                type="number"
                min="1"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                placeholder="2"
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="bathrooms" className="font-semibold">Количество ванных</Label>
              <Input
                id="bathrooms"
                type="number"
                min="1"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                placeholder="1"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="max_guests" className="font-semibold">Максимум гостей</Label>
              <Input
                id="max_guests"
                type="number"
                min="1"
                value={formData.max_guests}
                onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
                placeholder="4"
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-indigo-600" />
            <CardTitle className="text-xl">Фотография</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-indigo-300 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="image-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    <p className="text-sm text-slate-600">Загрузка...</p>
                  </>
                ) : formData.image_url ? (
                  <>
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button type="button" variant="outline" size="sm">
                      Изменить фото
                    </Button>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-slate-400" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-900">
                        Загрузите фотографию квартиры
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        PNG, JPG до 10MB
                      </p>
                    </div>
                  </>
                )}
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Удобства</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AMENITIES_OPTIONS.map((amenity) => (
              <div key={amenity} className="flex items-center gap-2">
                <Checkbox
                  id={amenity}
                  checked={formData.amenities.includes(amenity)}
                  onCheckedChange={() => handleAmenityToggle(amenity)}
                />
                <Label htmlFor={amenity} className="cursor-pointer text-sm">
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Checkbox
              id="is_available"
              checked={formData.is_available}
              onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
            />
            <Label htmlFor="is_available" className="cursor-pointer font-semibold">
              Квартира доступна для бронирования
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="px-8">
            Отмена
          </Button>
        )}
        <Button
          type="submit"
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold px-8 py-6 text-lg shadow-lg shadow-indigo-500/30"
        >
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Добавить квартиру
        </Button>
      </div>
    </form>
  );
}