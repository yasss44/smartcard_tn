import { useDrag } from 'react-dnd';
import { FaGripLines, FaTrash, FaPencilAlt, FaLink, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub, FaYoutube, FaEnvelope, FaPhone } from 'react-icons/fa';

interface LinkItemProps {
  id: string;
  index: number;
  title: string;
  url: string;
  icon: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  moveLink?: (dragIndex: number, hoverIndex: number) => void;
}

const LinkItem = ({ id, index, title, url, icon, onEdit, onDelete, moveLink }: LinkItemProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'LINK',
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Get the appropriate icon component based on the icon type
  const getIconComponent = () => {
    switch (icon) {
      case 'facebook':
        return <FaFacebook className="text-blue-600" />;
      case 'twitter':
        return <FaTwitter className="text-blue-400" />;
      case 'instagram':
        return <FaInstagram className="text-pink-500" />;
      case 'linkedin':
        return <FaLinkedin className="text-blue-700" />;
      case 'github':
        return <FaGithub className="text-gray-800" />;
      case 'youtube':
        return <FaYoutube className="text-red-600" />;
      case 'email':
        return <FaEnvelope className="text-yellow-500" />;
      case 'phone':
        return <FaPhone className="text-green-500" />;
      case 'link':
      default:
        return <FaLink className="text-blue-500" />;
    }
  };

  return (
    <div
      ref={drag}
      className={`flex items-center p-4 mb-3 rounded-lg border ${isDragging ? 'opacity-50 bg-gray-100 border-blue-300' : 'bg-white border-gray-200'} shadow-sm hover:shadow-md transition-all duration-200 group`}
      style={{ cursor: 'move' }}
    >
      <div className="mr-3 text-gray-400 group-hover:text-gray-600 transition-colors">
        <FaGripLines />
      </div>
      <div className="flex-shrink-0 mr-3 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
        {getIconComponent()}
      </div>
      <div className="flex-1 min-w-0"> {/* min-width ensures truncation works */}
        <h3 className="font-medium text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 truncate">{url}</p>
      </div>
      <div className="flex space-x-1 opacity-70 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(id)}
          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
          aria-label="Edit link"
          title="Edit link"
        >
          <FaPencilAlt />
        </button>
        <button
          onClick={() => onDelete(id)}
          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
          aria-label="Delete link"
          title="Delete link"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default LinkItem;
