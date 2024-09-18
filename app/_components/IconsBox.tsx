
import { FaTerminal, FaComment } from 'react-icons/fa';

const IconsBox: React.FC = () => {
  return (
    <div className="flex justify-center items-center mt-[100px] gap-4">
      <div className="w-64 h-40 flex flex-col justify-center items-center border border-gray-300 rounded-lg">
        <FaTerminal className="text-4xl mb-2" />
        <span className="text-lg">COMMANDS</span>
      </div>
      <div className="w-64 h-40 flex flex-col justify-center items-center border border-gray-300 rounded-lg">
        <FaComment className="text-4xl mb-2" />
        <span className="text-lg">PROMPTS</span>
      </div>
    </div>
  );
};

export default IconsBox;
