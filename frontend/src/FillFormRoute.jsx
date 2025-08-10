import React from 'react';

/**
 * Simple wrapper to extract :formId param from URL and render FillFormPage
 */
import FillFormPage from './components/FillFormPage';

export default function FillFormRoute() {
  // Extract formId from URL (first segment)
  const formId = window.location.pathname.replace(/^\//, '').split('/')[0];
  return <FillFormPage formId={formId} />;
}
