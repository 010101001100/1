import React, { useEffect, useState } from 'react';
import { Download, Trash2, CheckSquare } from 'lucide-react';

interface ImageData {
  url: string;
  isSelected: boolean;
}

function App() {
  const [images, setImages] = useState<ImageData[]>([]);

  useEffect(() => {
    // Create WebSocket connection
    const ws = new WebSocket('ws://localhost:8080');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'images') {
        setImages(data.images);
      }
    };

    return () => ws.close();
  }, []);

  const handleSelectAll = () => {
    setImages(images.map(img => ({ ...img, isSelected: true })));
  };

  const handleReset = () => {
    setImages([]);
  };

  const handleImageClick = (index: number) => {
    setImages(images.map((img, i) => 
      i === index ? { ...img, isSelected: !img.isSelected } : img
    ));
  };

  const handleBulkDownload = () => {
    images
      .filter(img => img.isSelected)
      .forEach(img => {
        fetch(img.url)
          .then(response => response.blob())
          .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = img.url.split('/').pop() || 'image.jpg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          });
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Instagram & X.com Image Sync
            </h1>
            <div className="flex gap-4">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <CheckSquare size={20} />
                Select All
              </button>
              <button
                onClick={handleBulkDownload}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download size={20} />
                Download Selected
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 size={20} />
                Reset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className={`relative group cursor-pointer rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105 ${
                  image.isSelected ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleImageClick(index)}
              >
                <img
                  src={image.url}
                  alt={`Image ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fetch(image.url)
                      .then(response => response.blob())
                      .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = image.url.split('/').pop() || 'image.jpg';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                      });
                  }}
                  className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Download size={20} className="text-gray-700" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;