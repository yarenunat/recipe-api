export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FAF9F6]">
      <div className="text-center">
        <h1 className="text-6xl font-black tracking-tighter text-[#1a1a1a] sm:text-7xl">
          Recipy AI
        </h1>
        <p className="mt-4 text-lg font-medium text-gray-400 uppercase tracking-widest">
          Engine is active
        </p>
        <div className="mt-10 flex justify-center">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </div>
        </div>
      </div>
    </main>
  );
}