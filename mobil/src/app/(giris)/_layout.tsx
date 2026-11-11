import { Stack } from "expo-router";
import { renk } from "@/tema";

export default function GirisDuzeni() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: renk.krem } }} />;
}
