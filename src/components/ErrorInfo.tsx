export function ErrorInfo({ error }: { error: string }) {
  return (
    <div className="card text-center">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        ⚠️ Application Error ⚠️
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        {error}
      </p>
    </div>
  );
}