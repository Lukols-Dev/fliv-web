"use client";

import { useEffect } from "react";

type Props = {
  error: Error;
  reset(): void;
};

export default function Error({ error }: Props) {

  useEffect(() => {
    console.error(error);
  }, [error]);

  return <div>Error</div>;
}
