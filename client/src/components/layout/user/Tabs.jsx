import { useLocation, useNavigate } from "react-router";

const Tabs = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const tabs = [
      { label: 'My Courses', path: '/user/profile' },
      { label: 'Message', path: '/user/messages' },
      { label: 'Wishlist', path: '/user/wishlist' },
      { label: 'Purchase History', path: '/user/purchase-history' },
      { label: 'Settings', path: '/user/settings' },
    ];
  
    return (
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex ">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              return (
                <button
                  key={tab.label}
                  onClick={() => navigate(tab.path)}
                  className={`px-4 py-3 text-sm  ${
                    isActive
                      ? 'text-orange-500 border-b-2 border-orange-500 font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  } transition duration-300`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  export default Tabs;