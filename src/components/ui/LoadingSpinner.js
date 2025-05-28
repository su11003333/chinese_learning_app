export default function LoadingSpinner() {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-r from-pink-100 to-purple-100">
        <div className="animate-pulse p-8 bg-white rounded-3xl shadow-xl">
          <div className="w-24 h-24 mx-auto bg-pink-200 rounded-full mb-6"></div>
          <div className="h-6 bg-gray-200 rounded-full w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded-full w-1/2 mx-auto mb-8"></div>
          <div className="h-10 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-10 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-10 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  }