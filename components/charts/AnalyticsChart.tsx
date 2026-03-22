export function AnalyticsChart() {
  // Simple CSS-based bar chart representation
  const data = [40, 70, 45, 90, 65, 85, 100]; 

  return (
    <div className="w-full h-64 bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col justify-end">
      <h3 className="text-sm font-bold text-gray-600 mb-4">Monthly Subscriptions</h3>
      <div className="flex justify-between items-end h-full gap-2">
        {data.map((height, index) => (
          <div key={index} className="w-full flex justify-center group">
            <div 
              className="w-full bg-charity-light rounded-t-md group-hover:bg-charity transition-colors duration-300"
              style={{ height: `${height}%` }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}