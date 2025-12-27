import { Loader2 } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center text-white bg-black z-50">
      <Loader2 className="w-10 h-10 animate-spin mb-3" />
      <p className="text-lg font-medium">Loading...</p>
    </div>
  );
}
