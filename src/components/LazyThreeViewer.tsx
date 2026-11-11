'use client';

import dynamic from 'next/dynamic';

const ThreeViewer = dynamic(() => import('./ThreeViewer'), {
  ssr: false,
  loading: () => (
    <div className="model-frame model-sticky" style={{ minHeight: '420px' }}>
      <div className="model-placeholder-loader">
        <div className="viewer-radar-loader">
          <div className="radar-ring" />
          <div className="radar-sweep" />
          <div className="radar-core" />
        </div>
        <span className="loader-status-text">3D model loading...</span>
      </div>
    </div>
  ),
});

export default function LazyThreeViewer() {
  return (
    <div>
      <ThreeViewer />
    </div>
  );
}
