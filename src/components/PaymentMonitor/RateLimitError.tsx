export function RateLimitError() {
  return (
    <div className="mt-6 p-1 bg-orange-50 dark:bg-orange-900/20 rounded-lg mb-6 w-full text-center">
      <h3 className="text-lg font-medium text-orange-900 dark:text-orange-300 mb-2">
        ⚠️ Rate Limit Active ⚠️
      </h3>
    </div>
  )
}
