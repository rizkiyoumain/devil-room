import { createFileRoute } from "@tanstack/react-router";
import { RoomApp } from "@/components/room/room-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <RoomApp />;
}
