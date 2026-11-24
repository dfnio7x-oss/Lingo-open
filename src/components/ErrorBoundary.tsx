import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'حدث خطأ غير متوقع.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-canvas)] text-[var(--text-primary)]">
          <div className="max-w-md w-full rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-8 text-center shadow-lg">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#FF4B4B]/15 text-[#FF4B4B] flex items-center justify-center text-2xl font-bold">
              !
            </div>
            <h2 className="text-xl font-extrabold mb-2">حدث خطأ غير متوقع</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6 break-words">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-3d-green px-6 py-3 rounded-2xl font-bold text-sm cursor-pointer"
            >
              إعادة تحميل التطبيق
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
