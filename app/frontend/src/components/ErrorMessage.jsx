import { AlertCircle } from 'lucide-react';

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Une erreur est survenue</h3>
        <p className="text-red-700 mb-4">{message || 'Impossible de charger les données'}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn btn-primary">
            Réessayer
          </button>
        )}
      </div>
    </div>
  );
}
