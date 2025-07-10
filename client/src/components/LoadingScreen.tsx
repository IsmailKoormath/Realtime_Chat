export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
          <div className="absolute inset-0 bg-white/30 rounded-full animate-ping animation-delay-200"></div>
          <div className="relative w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
            <span className="text-3xl text-white font-bold">N</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Loading NexChat</h2>
        <p className="text-purple-200">Preparing your conversations...</p>
      </div>
    </div>
  );
}
