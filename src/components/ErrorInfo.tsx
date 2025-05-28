import { useApp } from "./ApplicationProvider";

export function ErrorInfo() {
  const { appError, setState, setPaymentRequest } = useApp();

  return (
    <div className="card text-center space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        ⚠️ Application Error ⚠️
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        {appError || 'An unknown error occurred'}
      </p>
      <button
        className="btn-secondary text-xs sm:text-sm py-2 px-2 sm:px-3 relative"
        onClick={() => {
          setState('form');
          setPaymentRequest(null);
        }}
      >
        Reset App
      </button>
    </div>
  );
}