import { useApp } from "./ApplicationProvider";

export function ErrorInfo() {
  const { setState, setPaymentRequest, appError } = useApp();

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8">
      <div className="text-center space-y-6">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        {/* Error Title */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Application Error
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {appError || 'An unknown error occurred'}
          </p>
        </div>

        {/* Reset Button */}
        <button
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          onClick={() => {
            setState('form');
            setPaymentRequest(null);
          }}
        >
          🔄 Reset Application
        </button>

        {/* Additional help text */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This will return you to the payment form to try again!
        </p>
      </div>
    </div>
  );
}