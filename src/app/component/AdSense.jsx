import { useEffect } from 'react';

const AdSpaceContainer = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = process.env.NEXT_PUBLIC_ADSENSE_SRC;
    script.onload = () => {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Define aspect ratios for different ad types
  const aspectRatioStyles = {
    square: { aspectRatio: "1 / 1" },
    horizontal: { aspectRatio: "4 / 3" }, 
    vertical: { aspectRatio: "3 / 4" },   
    auto: {},
  };

  const aspectRatio = "auto";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <div
        className="relative bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg overflow-hidden"
        style={{
          ...aspectRatioStyles[aspectRatio], 
          width: "100%", 
          height: "auto", 
        }}
      >
        <p
          className="text-sm font-semibold absolute top-2 right-2 px-2 py-1 rounded"
          style={{
            background: 'linear-gradient(to right, red, blue)',
            color: 'white',
            ...(document.body.classList.contains('dark') ? { background: 'linear-gradient(to right, #444, #888)' } : {}),
          }}
        >
          Ad Space
        </p>

        {/* AdSense Ad */}
        <div className="adsense-container" style={{ textAlign: 'center' }}>
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
            data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID}
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>
      </div>
    </div>
  );
};

export default AdSpaceContainer;
