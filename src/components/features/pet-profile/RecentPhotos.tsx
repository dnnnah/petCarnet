"use client";

import { useState } from "react";
import { Camera, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

type Photo = {
  id: string;
  name: string;
  url: string;
  date: string;
  description?: string;
};

type RecentPhotosProps = {
  photos: ReadonlyArray<Photo>;
};

export function RecentPhotos({ photos }: RecentPhotosProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <GlassCard className="p-5 sm:p-6 lg:p-7">
        <h2 className="flex items-center gap-3 text-xl sm:text-2xl font-extrabold text-gray-950">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-pink-50 text-pink-500 ring-1 ring-pink-100">
            <Camera size={22} />
          </span>
          Fotos Recientes
        </h2>

        <div className="mt-5 flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {photos.map((photo) => (
            <button
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group flex shrink-0 flex-col items-center gap-2"
            >
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-pink-400 via-fuchsia-400 to-amber-400 p-[3px] shadow-[0_8px_24px_rgba(236,72,153,0.25)] transition-transform duration-200 group-hover:scale-105">
                <div className="h-full w-full rounded-full bg-white p-[2px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="max-w-[80px] truncate text-xs font-extrabold text-gray-600">
                {photo.name}
              </span>
            </button>
          ))}
        </div>
      </GlassCard>

      {selectedPhoto ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
          >
            <X size={24} />
          </button>

          <div
            className="relative max-h-[85vh] max-w-lg animate-[scale-in_0.25s_ease-out] overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.name}
              className="h-auto w-full object-cover"
            />
            <div className="p-5">
              <p className="text-lg font-extrabold text-gray-950">{selectedPhoto.name}</p>
              <p className="mt-1 text-sm font-semibold text-gray-500">{selectedPhoto.date}</p>
              <p className="mt-2 text-sm font-bold text-gray-700">{selectedPhoto.description ?? ""}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
