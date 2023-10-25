"use client";

import type { Snowflake } from "use-lanyard";

import Image from "next/image";

import { useLanyardWS } from "use-lanyard";
import { useThrottle } from "@/lib/throttle";
import { useSearchParams } from "next/navigation";
import { memo, useEffect, useState } from "react";

interface ProgressProps {
  start: number;
  end: number;
}

const ProgressBar = memo(({ start, end }: ProgressProps) => {
  const [, rerender] = useState({});

  const total = end - start;
  const progress = 100 - (100 * (end - new Date().getTime())) / total;

  useEffect(() => {
    const interval = setInterval(() => {
      rerender({});
    }, 1000);

    return () => clearInterval(interval);
  }, [start, end]);

  return (
    <div className="pr-6">
      <div className="h-3 w-full overflow-hidden rounded-full bg-white/50">
        <div
          className="h-3 rounded-full bg-white/50 transition-all duration-1000 ease-linear will-change-[width]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
});
ProgressBar.displayName = "ProgressBar";

interface SongProps {
  discord_id: Snowflake;
}

const Song = ({ discord_id }: SongProps) => {
  const data = useThrottle(useLanyardWS(discord_id));

  const opts = useSearchParams();

  if (!data || !data.spotify) {
    return <></>;
  }

  const { start, end } = data.spotify.timestamps;

  const bg = `rgba(0,0,0,${opts.get("opacity") || 60}%)`;

  return (
    <div
      className="flex h-[200px] w-[800px] space-x-8 rounded-[18px] border-2 border-neutral-800 p-3"
      style={{ backgroundColor: bg }}
    >
      <div className="flex-shrink-0">
        {data.spotify.album_art_url && (
          <Image
            src={data?.spotify?.album_art_url}
            alt={data?.spotify?.song}
            height={172}
            width={172}
            className="aspect-square rounded-xl"
          />
        )}
      </div>

      <div className="flex w-full flex-col justify-center space-y-4 overflow-hidden">
        <div className="space-y-2">
          <p className="truncate text-5xl font-bold text-white">
            {data?.spotify?.song}
          </p>
          <p className="truncate text-3xl text-white">
            {data?.spotify?.artist}
          </p>
        </div>
        <ProgressBar start={start} end={end} />
      </div>
    </div>
  );
};

export default Song;
