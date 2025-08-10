import React from 'react';
import FormPreview from './FormPreview';

// Wrapper for public fill links: disables back button
export default function FillFormPage({ formId }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-white to-purple-200">
      <FormPreview formId={formId} onBack={null} />
    </div>
  );
}
