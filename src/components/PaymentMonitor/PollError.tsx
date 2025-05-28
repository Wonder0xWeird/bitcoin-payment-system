import { AlertCircle } from "lucide-react";

type PollErrorProps = {
  pollError: string;
}

export function PollError({ pollError }: PollErrorProps) {
  return (
    <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg mb-6 flex items-center gap-2">
      <AlertCircle className="w-5 h-5 text-red-500" />
      <p className="text-sm text-red-700 dark:text-red-300">{pollError}</p>
    </div>
  )
}

