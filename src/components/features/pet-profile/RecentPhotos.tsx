"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { Camera, ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
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
  profilePhoto: string;
};

export function RecentPhotos({ photos, profilePhoto }: RecentPhotosProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selected =
    selectedIndex !== null ? photos[selectedIndex] : null;

  const move = useCallback(
    (offset: number) => {
      setSelectedIndex((current) => {
        if (current === null) return current;
        return (current + offset + photos.length) % photos.length;
      });
    },
    [photos.length]
  );

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedIndex(null);
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIndex, move]);

  if (photos.length === 0) return null;

  return (
    <MotionConfig reducedMotion="user">
      <GlassCard className="p-5 sm:p-6 lg:p-7">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-3 text-xl sm:text-2xl font-extrabold text-gray-950 dark:text-white">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-pink-50 text-pink-500 ring-1 ring-pink-100 dark:bg-pink-500/15 dark:text-pink-400 dark:ring-pink-500/30">
              <Camera size={22} />
            </span>
            Fotos recientes
          </h2>
          <span className="shrink-0 rounded-full bg-pink-50 px-3 py-1 text-sm font-extrabold text-pink-600 ring-1 ring-pink-100 dark:bg-pink-500/15 dark:text-pink-300 dark:ring-pink-500/30">
            {photos.length}
          </span>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <div className="group relative shrink-0 cursor-pointer">
            <div className="rounded-full bg-[linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)] p-[3px] transition hover:-translate-y-0.5">
              <div className="rounded-full bg-white p-[3px] dark:bg-gray-900">
                <Image
                  src={profilePhoto}
                  alt={`Foto de perfil de la mascota`}
                  width={80}
                  height={80}
                  className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
                />
              </div>
            </div>
            <span className="mt-2 block text-center text-xs font-extrabold text-gray-600 dark:text-gray-300">
              Perfil
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:gap-3">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setSelectedIndex(index)}
              aria-label={`Ver foto: ${photo.name}`}
              className="group relative aspect-square overflow-hidden rounded-2xl ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:ring-pink-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:ring-gray-800 dark:hover:ring-pink-500/40"
            >
              <Image
                src={photo.url}
                alt={photo.name}
                width={400}
                height={400}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute inset-0 grid place-items-center bg-gray-950/0 text-white opacity-0 transition group-hover:bg-gray-950/35 group-hover:opacity-100">
                <Expand size={22} />
              </span>
            </button>
          ))}
        </div>
      </GlassCard>

      <AnimatePresence>
        {selected && selectedIndex !== null ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            onClick={() => setSelectedIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`Foto: ${selected.name}`}
          >
            <button
              onClick={() => setSelectedIndex(null)}
              aria-label="Cerrar"
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
            >
              <X size={24} />
            </button>

            <button
              onClick={(event) => {
                event.stopPropagation();
                move(-1);
              }}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
            >
              <ChevronLeft size={26} />
            </button>
            <button
              onClick={(event) => {
                event.stopPropagation();
                move(1);
              }}
              aria-label="Foto siguiente"
              className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
            >
              <ChevronRight size={26} />
            </button>

            <motion.div
              key={selected.id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="max-h-[85vh] w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900 dark:shadow-black/60"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative max-h-[60vh] overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Image
                  src={selected.url}
                  alt={selected.name}
                  width={900}
                  height={900}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-extrabold text-gray-950 dark:text-white">{selected.name}</p>
                    <p className="mt-1 text-sm font-semibold text-gray-500 dark:text-gray-400">{selected.date}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-extrabold text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                    {selectedIndex + 1} / {photos.length}
                  </span>
                </div>
                {selected.description ? (
                  <p className="mt-3 font-bold leading-6 text-gray-700 dark:text-gray-200">{selected.description}</p>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </MotionConfig>
  );
}
