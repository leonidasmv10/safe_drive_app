import { Car } from "lucide-react";
const WarningAlert = () => {
  return (
    <div className="bg-red-50 rounded-xl p-3 mb-6 flex items-center shadow-md">
      <div className="bg-red-100 p-2 rounded-lg mr-3">
        <Car className="text-red-600" size={20} />
      </div>
      <div>
        <p className="text-red-600 font-bold text-sm">WARNING!</p>
        <p className="text-gray-800 text-sm">POLICE CAR in your LEFT</p>
      </div>
    </div>
  );
};

export default WarningAlert;
