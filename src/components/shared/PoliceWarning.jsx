const PoliceWarning = () => {
  return (
    <div className="absolute top-2 left-2 right-2 bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="flex items-center p-3">
        <div className="bg-red-500 rounded-lg p-2 mr-3">
          <span className="text-white font-bold text-xs">★</span>
        </div>
        <p className="font-bold">
          POLICE CAR <span className="font-normal">in your</span>
          <span className="font-bold">LEFT</span>
        </p>
      </div>
      <div className="bg-red-500 p-1 px-3 flex items-center justify-start">
        <div className="text-white flex items-center">
          <span className="text-xs mr-1">▲</span>
          <span className="text-xs">WARNING</span>
        </div>
      </div>
    </div>
  );
};

export default PoliceWarning;
