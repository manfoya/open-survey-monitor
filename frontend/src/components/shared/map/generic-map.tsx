"use client";

import dynamic from "next/dynamic";
import { GenericMapProps } from "./types";
import { useMemo } from "react";

export default function GenericMap(props: GenericMapProps) {
  const Map = useMemo(
    () =>
      dynamic<GenericMapProps>(() => import("./generic-map-inner"), {
        ssr: false,
        loading: () => (
          <div
            style={{ height: props.height || "400px" }}
            className="bg-muted animate-pulse rounded-xl w-full"
          />
        ),
      }),
    [],
  );

  return <Map {...props} />;
}
